"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FAQCategoryModel } from "@/model/firebase/faq_model";

type Props = {
  onMore: () => void;
};

const FAQ_COLLECTION = "faqCategories";

export default function FAQSection({ onMore }: Props) {
  const [faqCategories, setFaqCategories] = useState<FAQCategoryModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, FAQ_COLLECTION),
          orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);

        const items = snapshot.docs
          .map((doc) => FAQCategoryModel.fromMap(doc.data(), doc.id))
          .filter((category) => category.isActive)
          .map((category) =>
            category.copyWith({
              items: category.items
                .filter((item) => item.isActive)
                .sort((a, b) => a.order - b.order)
                .map((item) => item.toMap()),
            })
          );

        setFaqCategories(items);

        if (items.length > 0) {
          setSelectedCategory(items[0].id);
        }
      } catch (error) {
        console.error("FAQ 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const selectedItems = useMemo(() => {
    return (
      faqCategories.find((category) => category.id === selectedCategory)
        ?.items || []
    );
  }, [faqCategories, selectedCategory]);

  return (
    <section className="px-6 pt-6 pb-8">
      <div className="rounded-[28px] bg-white p-5 shadow-sm">
        <h3 className="text-left text-[20px] font-extrabold text-black">
          자주 묻는 질문
        </h3>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-6 text-center text-sm font-semibold text-gray-400">
            FAQ를 불러오는 중입니다.
          </div>
        ) : faqCategories.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-6 text-center text-sm font-semibold text-gray-400">
            등록된 FAQ가 없습니다.
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {faqCategories.map((category) => {
                const active = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setOpenedIndex(null);
                    }}
                    className={`cursor-pointer rounded-full border px-5 py-2 text-xs font-semibold shadow-sm transition active:scale-95 ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-gray-300 bg-white text-gray-500 hover:border-black hover:text-black"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-3">
              {selectedItems.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-[#fafafa] px-4 py-6 text-center text-sm font-semibold text-gray-400">
                  이 카테고리에 등록된 질문이 없습니다.
                </div>
              ) : (
                selectedItems.map((item, index) => {
                  const open = openedIndex === index;

                  return (
                    <div
                      key={item.id || `${selectedCategory}-${index}`}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-[#fafafa]"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenedIndex(open ? null : index)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left transition active:scale-[0.99]"
                      >
                        <div className="flex min-w-0 flex-1 flex-col items-start">
                          {item.tags.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-500"
                                >
                                  {tag.startsWith("#") ? tag : `#${tag}`}
                                </span>
                              ))}
                            </div>
                          )}

                          <span className="pr-4 text-sm font-semibold text-black">
                            {item.question}
                          </span>
                        </div>

                        <span
                          className={`ml-3 shrink-0 text-lg text-gray-500 transition-transform duration-200 ${
                            open ? "rotate-180" : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          open
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="whitespace-pre-line border-t border-gray-200 px-4 py-4 text-sm leading-6 text-gray-600">
                            {item.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onMore}
          className="mt-5 flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-black transition hover:bg-gray-50 active:scale-[0.99]"
        >
          더보기
        </button>
      </div>
    </section>
  );
}