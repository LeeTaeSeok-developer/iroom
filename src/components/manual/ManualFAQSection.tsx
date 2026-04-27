"use client";

import { useMemo, useState } from "react";
import { ManualFaqItemModel } from "@/model/firebase/manual_entry_model";

type Props = {
  faqs?: ManualFaqItemModel[];
};

export default function ManualFAQSection({ faqs = [] }: Props) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  const faqItems = useMemo(() => {
    return faqs
      .filter((item) => item.question.trim() && item.answer.trim())
      .sort((a, b) => a.order - b.order);
  }, [faqs]);

  if (faqItems.length === 0) return null;

  return (
    <section className="px-5 pb-8 pt-2">
      <h3 className="mb-3 flex items-center gap-2 text-[17px] font-extrabold text-black">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[13px] font-bold text-white">
          ?
        </span>
        자주 묻는 질문
      </h3>

      <div className="space-y-2">
        {faqItems.map((item, index) => {
          const open = openedIndex === index;

          return (
            <div
              key={item.id || index}
              className="overflow-hidden rounded-[14px] bg-gray-50"
            >
              <button
                type="button"
                onClick={() => setOpenedIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <p className="flex items-start gap-2 text-[14px] font-semibold text-black">
                  <span className="shrink-0 font-bold text-blue-500">Q.</span>
                  <span>{item.question}</span>
                </p>

                <span
                  className={`shrink-0 text-gray-500 transition duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ⌄
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open ? "max-h-[240px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 text-[13px] leading-6 text-gray-600">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}