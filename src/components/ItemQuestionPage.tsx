"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductQuestionSetModel } from "@/model/firebase/product_question_model";

type Props = {
  itemName: string | null;
  onClose: () => void;
  onMenu: () => void;
};

export default function ItemQuestionPage({
  itemName,
  onClose,
  onMenu,
}: Props) {
  const [displayItemName, setDisplayItemName] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [questionSet, setQuestionSet] =
    useState<ProductQuestionSetModel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    let raf1 = 0;
    let raf2 = 0;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    if (itemName) {
      setDisplayItemName(itemName);
      setVisible(false);
      setOpenQuestion(null);
      document.body.style.overflow = "hidden";

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      document.body.style.overflow = originalOverflow;

      closeTimer = setTimeout(() => {
        setDisplayItemName(null);
        setQuestionSet(null);
      }, 300);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (closeTimer) clearTimeout(closeTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [itemName]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!displayItemName) return;

      try {
        setLoading(true);
        setQuestionSet(null);

        const q = query(
          collection(db, "productQuestions"),
          where("productName", "==", displayItemName),
          where("isActive", "==", true)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setQuestionSet(null);
          return;
        }

        const data = ProductQuestionSetModel.fromMap(
          snapshot.docs[0].data(),
          snapshot.docs[0].id
        );

        const sortedItems = data.items
          .filter((item) => item.isActive)
          .sort((a, b) => a.order - b.order);

        setQuestionSet(data.copyWith({ items: sortedItems }));
      } catch (error) {
        console.error("제품 질문 불러오기 실패:", error);
        setQuestionSet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [displayItemName]);

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!displayItemName) return null;

  const questions = questionSet?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-hidden">
      <div
        className={`h-screen w-full max-w-[700px] transform-gpu overflow-hidden bg-[#f7f7f7] transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <header className="relative flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ←
          </button>

          <h2 className="absolute left-1/2 max-w-[calc(100%-120px)] -translate-x-1/2 truncate text-xl font-extrabold text-black">
            {displayItemName}
          </h2>

          <button
            type="button"
            onClick={onMenu}
            className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ☰
          </button>
        </header>

        <div className="h-[calc(100vh-76px)] overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="rounded-2xl bg-white px-5 py-6 text-center text-sm font-bold text-gray-500 shadow-sm">
              질문을 불러오는 중입니다.
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl bg-white px-5 py-6 text-center text-sm font-bold text-gray-500 shadow-sm">
              등록된 제품 질문이 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-8">
              {questions.map((qa) => {
                const isOpen = openQuestion === qa.id;

                return (
                  <div
                    key={qa.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenQuestion((prev) =>
                          prev === qa.id ? null : qa.id
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left"
                    >
                      <span className="text-base font-bold text-black">
                        {qa.question}
                      </span>

                      <span
                        className={`shrink-0 text-2xl transition-all duration-300 ${
                          isOpen
                            ? "scale-110 rotate-180 text-black"
                            : "text-gray-400"
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="whitespace-pre-line border-t border-gray-100 px-5 py-4 text-sm leading-6 text-gray-600">
                          {qa.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}