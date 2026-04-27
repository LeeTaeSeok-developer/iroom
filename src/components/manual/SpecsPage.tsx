"use client";

import { useEffect } from "react";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  open: boolean;
  onClose: () => void;
  manual?: ManualEntryModel | null;
};

export default function SpecsPage({ open, onClose, manual }: Props) {
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

  const specItems = [...(manual?.specs ?? [])].sort(
    (a, b) => a.order - b.order
  );

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
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur">
            <header className="relative flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
              >
                ←
              </button>

              <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold text-black">
                제품 사양
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {specItems.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <p className="text-[15px] font-bold text-gray-700">
                  등록된 제품 사양이 없습니다.
                </p>
                <p className="mt-2 text-[13px] text-gray-400">
                  관리자 페이지에서 매뉴얼 제품 사양을 등록해주세요.
                </p>
              </div>
            ) : (
              specItems.map((section) => (
                <div
                  key={section.id}
                  className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  <h3 className="mb-3 flex items-center gap-2 text-[16px] font-extrabold text-[#2f63df]">
                    ⚡ {section.title}
                  </h3>

                  <div className="divide-y divide-gray-100">
                    {section.data.map((item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className="flex items-start justify-between gap-4 py-2 text-[13px]"
                      >
                        <span className="shrink-0 text-gray-400">
                          {item.label}
                        </span>

                        <span className="max-w-[65%] text-right font-medium text-gray-700">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}