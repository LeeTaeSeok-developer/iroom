"use client";

import { useEffect, useMemo, useState } from "react";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenAI: () => void;
  manual?: ManualEntryModel | null;
};

export default function ManualFaqPage({
  open,
  onClose,
  onOpenAI,
  manual,
}: Props) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setOpenedIndex(null);
    }
  }, [open]);

  const faqItems = useMemo(() => {
    return [...(manual?.faqs ?? [])]
      .filter((item) => item.question || item.answer)
      .sort((a, b) => a.order - b.order);
  }, [manual]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[120] transition duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed inset-y-0 left-1/2 z-[121] w-full max-w-[450px] -translate-x-1/2 bg-[#f3f4f7] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-20 bg-blue-300 backdrop-blur">
            <header className="relative flex items-center justify-between px-4 py-4">
              <button
                type="button"
                onClick={onClose}
                className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-white/70 active:scale-95"
              >
                ←
              </button>

              <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold text-black">
                자주 묻는 질문
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
            <div className="pb-6 text-center">
              <p className="text-[13px] font-medium text-[#6b7280]">
                고객 지원 센터
              </p>

              <h3 className="mt-2 text-[17px] font-extrabold tracking-[-0.02em] text-[#1f2937]">
                궁금하신 점이 있나요?
              </h3>

              <p className="mt-1 text-[17px] font-extrabold tracking-[-0.02em] text-[#1f2937]">
                자주 묻는 질문을 확인해보세요.
              </p>
            </div>

            {faqItems.length === 0 ? (
              <div className="rounded-[24px] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <p className="text-[15px] font-bold text-gray-800">
                  등록된 질문이 없습니다.
                </p>
                <p className="mt-2 text-[13px] text-gray-400">
                  관리자 페이지에서 FAQ를 추가해주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqItems.map((item, index) => {
                  const isOpen = openedIndex === index;

                  return (
                    <div
                      key={item.id || index}
                      className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenedIndex(isOpen ? null : index)}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left"
                      >
                        <p className="text-[13px] font-bold leading-[1.5] tracking-[-0.02em] text-[#2b2f38]">
                          <span className="mr-1 text-[#2f63df]">Q.</span>
                          {item.question}
                        </p>

                        <span
                          className={`shrink-0 text-[18px] text-gray-400 transition duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          ˅
                        </span>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen
                            ? "max-h-[300px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                          <p className="whitespace-pre-line text-[14px] leading-6 text-gray-600">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 rounded-[24px] bg-gradient-to-br from-[#23395f] via-[#1d2e4f] to-[#162338] px-5 py-6 text-center text-white shadow-[0_16px_30px_rgba(14,23,40,0.28)]">
              <p className="text-[13px] text-white/65">
                문제가 해결되지 않으셨나요?
              </p>

              <h4 className="mt-2 text-[17px] font-extrabold">
                AI 상담으로 빠르게 해결하세요!
              </h4>

              <p className="mt-2 text-[13px] text-white/60">
                24시간 언제든 이용 가능합니다.
              </p>

              <button
                type="button"
                onClick={onOpenAI}
                className="mt-5 flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-[#2f63df] text-[16px] font-bold text-white transition hover:brightness-105 active:scale-[0.98]"
              >
                도우봇과 채팅 상담 시작하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}