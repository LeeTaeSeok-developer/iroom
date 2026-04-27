"use client";

import { useEffect } from "react";
import { Brush, Maximize2, Bed, Sparkles } from "lucide-react";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  manual?: ManualEntryModel | null;
};

function getIcon(title: string) {
  if (title.includes("틈새")) return <Maximize2 size={16} strokeWidth={1.8} />;
  if (title.includes("침구")) return <Bed size={16} strokeWidth={1.8} />;
  return <Brush size={16} strokeWidth={1.8} />;
}

function getIconStyle(title: string) {
  if (title.includes("틈새")) return "bg-[#eefcf3] text-[#22c55e]";
  if (title.includes("침구")) return "bg-[#fff4f4] text-[#ef4444]";
  return "bg-[#eef4ff] text-[#2f63df]";
}

export default function AccessoriesPage({
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

  const accessories = [...(manual?.accessories ?? [])].sort(
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
                액세서리
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
            <div className="mb-5 px-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f63df] shadow-sm">
                  <Sparkles size={16} strokeWidth={1.8} />
                </div>

                <p className="text-[22px] font-extrabold tracking-[-0.02em] text-[#1f2937]">
                  액세서리 안내
                </p>
              </div>

              <p className="mt-2 text-[14px] leading-6 text-[#6b7280]">
                {itemName}에 사용할 수 있는 액세서리를 확인할 수 있습니다.
              </p>
            </div>

            {accessories.length === 0 ? (
              <div className="rounded-[24px] bg-white p-6 text-center shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
                <p className="text-[15px] font-bold text-gray-700">
                  등록된 액세서리가 없습니다.
                </p>
                <p className="mt-2 text-[13px] text-gray-400">
                  관리자 페이지에서 매뉴얼 액세서리를 등록해주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {accessories.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${getIconStyle(
                            item.title
                          )}`}
                        >
                          {getIcon(item.title)}
                        </div>

                        <h3 className="text-[18px] font-extrabold tracking-[-0.02em] text-[#1f2937]">
                          {item.title}
                        </h3>
                      </div>

                      {item.separatePurchase ? (
                        <span className="shrink-0 rounded-full bg-[#fff4e8] px-3 py-1 text-[12px] font-bold text-[#e38b1a]">
                          별도구매
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <div className="aspect-square w-full max-w-[220px] overflow-hidden rounded-[20px] bg-[#f7f8fb] p-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-center text-[13px] font-semibold text-gray-400">
                            이미지 없음
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-[14px] leading-6 text-gray-600">
                      {item.description}
                    </p>
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