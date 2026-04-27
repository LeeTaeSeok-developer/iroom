"use client";

import { useEffect } from "react";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  manual?: ManualEntryModel | null;
};

export default function ComponentsGuidePage({
  open,
  onClose,
  itemName,
  manual,
}: Props) {
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

  const componentImageUrl = manual?.componentImageUrl ?? "";
  const componentNotice =
    manual?.componentNotice || "등록된 구성품 안내 문구가 없습니다.";

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
                구성품 안내
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
            <div className="rounded-[26px] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
              <h3 className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.02em] text-[#1f2937]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f63df]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-[16px] w-[16px]">
                    <path
                      d="M12 3 19 7v10l-7 4-7-4V7l7-4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3v6m0 0 7-2M12 9 5 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                구성품 리스트
              </h3>

              <p className="mt-2 text-[14px] font-medium text-[#6b7280]">
                {itemName}의 구성품을 확인하세요
              </p>

              <div className="mt-5 flex justify-center">
                <div className="flex aspect-square w-full max-w-[500px] items-center justify-center overflow-hidden rounded-[22px] bg-[#f7f8fb] p-4">
                  {componentImageUrl ? (
                    <img
                      src={componentImageUrl}
                      alt={`${itemName} 구성품`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-[14px] font-semibold text-gray-400">
                      등록된 구성품 이미지가 없습니다.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-[#dbe4ff] bg-[#eef4ff] px-4 py-4">
                <p className="whitespace-pre-line text-[14px] leading-6 text-[#3558a8]">
                  {componentNotice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}