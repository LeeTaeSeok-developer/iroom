"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FAQCategoryModel } from "@/model/firebase/faq_model";

type Props = {
  open: boolean;
  onClose: () => void;
  onMenu: () => void;
};

export default function FAQPage({ open, onClose, onMenu }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState<FAQCategoryModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFaqCategories = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, "faqCategories"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      const list = snapshot.docs
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

      setCategories(list);

      if (list.length > 0) {
        setSelectedCategory(list[0].id);
      }
    } catch (error) {
      console.error("FAQ 불러오기 실패:", error);
      setCategories([]);
      setSelectedCategory("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    let raf1 = 0;
    let raf2 = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (open) {
      setMounted(true);
      setVisible(false);
      setOpenedIndex(null);
      document.body.style.overflow = "hidden";

      fetchFaqCategories();

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      document.body.style.overflow = originalOverflow;

      timer = setTimeout(() => {
        setMounted(false);
        setOpenedIndex(null);
      }, 300);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    setOpenedIndex(null);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!mounted) return null;

  const currentCategory =
    categories.find((category) => category.id === selectedCategory) ??
    categories[0];

  return (
    <div className="fixed inset-0 z-40 flex justify-center overflow-hidden">
      <div
        className={`h-screen w-full max-w-[700px] transform-gpu overflow-hidden bg-white transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-[100vw]"
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
            >
              ←
            </button>
            <h2 className="font-bold text-black">자주 묻는 질문</h2>
          </div>

          <button
            type="button"
            onClick={onMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ☰
          </button>
        </header>

        <div className="h-[calc(100vh-76px)] overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="rounded-2xl bg-gray-50 px-5 py-6 text-center text-sm font-bold text-gray-500">
              FAQ를 불러오는 중입니다.
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 px-5 py-6 text-center text-sm font-bold text-gray-500">
              등록된 FAQ가 없습니다.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
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

              <div className="mt-6 space-y-3">
                {(currentCategory?.items ?? []).map((item, index) => {
                  const openItem = openedIndex === index;

                  return (
                    <div
                      key={item.id || `${currentCategory.id}-${index}`}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-[#fafafa]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenedIndex(openItem ? null : index)
                        }
                        className="flex w-full items-center justify-between px-4 py-4 text-left transition active:scale-[0.99]"
                      >
                        <span className="pr-4 text-sm font-semibold text-black">
                          {item.question}
                        </span>
                        <span
                          className={`text-lg text-gray-500 transition-transform duration-200 ${
                            openItem ? "rotate-180" : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          openItem
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
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}