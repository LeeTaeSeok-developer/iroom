"use client";

import { useEffect, useMemo } from "react";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  open: boolean;
  onClose: () => void;
  manual?: ManualEntryModel | null;
};

export default function UsageGuidePage({ open, onClose, manual }: Props) {
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

  const usageGuideItems = useMemo(() => {
    return [...(manual?.usageGuides ?? [])]
      .filter((item) => item.title || item.description || item.image)
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
        className={`fixed inset-y-0 left-1/2 z-[121] w-full max-w-[450px] -translate-x-1/2 bg-[#f5f7fb] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur">
            <header className="relative flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <button
                type="button"
                onClick={onClose}
                className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
              >
                ←
              </button>

              <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold text-black">
                사용 방법
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
            {usageGuideItems.length === 0 ? (
              <div className="mt-10 rounded-[24px] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <p className="text-[15px] font-bold text-gray-800">
                  등록된 사용 방법이 없습니다.
                </p>
                <p className="mt-2 text-[13px] text-gray-400">
                  관리자 페이지에서 사용 방법을 추가해주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {usageGuideItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                  >
                    <h3 className="flex items-center gap-2 text-[19px] font-extrabold tracking-[-0.02em] text-[#2f63df]">
                      <span className="text-[16px]">▷</span>
                      {item.title}
                    </h3>

                    {item.image && (
                      <div className="mt-4 flex justify-center rounded-[20px] bg-[#f7f8fb] px-4 py-5">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="max-h-[220px] w-auto max-w-full object-contain"
                        />
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="text-[16px] font-extrabold text-[#2f2f2f]">
                        {item.title}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-[14px] leading-6 text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}