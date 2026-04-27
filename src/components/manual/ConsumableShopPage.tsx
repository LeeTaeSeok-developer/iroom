"use client";

import { useEffect, useMemo } from "react";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  open: boolean;
  onClose: () => void;
  manual?: ManualEntryModel | null;
};

export default function ConsumableShopPage({
  open,
  onClose,
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

  const consumableItems = useMemo(() => {
    return [...(manual?.consumables ?? [])]
      .filter((item) => item.name || item.image || item.url)
      .sort((a, b) => a.order - b.order);
  }, [manual]);

  const handleMove = (url: string) => {
    if (!url) {
      alert("구매 링크가 등록되어 있지 않습니다.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

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
                소모품 구매
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
            <div className="mb-5 rounded-[24px] bg-white px-5 py-6 text-black shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
              <p className="text-[13px] font-semibold text-gray-500">
                정품 소모품 안내
              </p>
              <h3 className="mt-2 text-[21px] font-extrabold tracking-[-0.03em] text-black">
                필요한 소모품을 바로 확인하세요
              </h3>
              <p className="mt-2 text-[13px] leading-5 text-gray-500">
                제품에 맞는 소모품만 표시됩니다.
              </p>
            </div>

            {consumableItems.length === 0 ? (
              <div className="rounded-[24px] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <p className="text-[15px] font-bold text-gray-800">
                  등록된 소모품이 없습니다.
                </p>
                <p className="mt-2 text-[13px] text-gray-400">
                  관리자 페이지에서 소모품을 추가해주세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {consumableItems.map((item, index) => (
                  <button
                    key={item.id || index}
                    type="button"
                    onClick={() => handleMove(item.url)}
                    className="rounded-[22px] bg-white p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition active:scale-[0.97]"
                  >
                    <div className="flex h-[130px] items-center justify-center rounded-[18px] bg-[#f7f8fb] p-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[34px]">🛒</span>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 min-h-[40px] text-[14px] font-extrabold leading-5 text-black">
                      {item.name || "이름 없는 소모품"}
                    </p>

                    <p
                      className={`mt-2 text-[12px] font-bold ${
                        item.url ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {item.url ? "구매하러 가기 →" : "링크 미등록"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}