"use client";

import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  manual?: ManualEntryModel | null;
  onOpenComponents?: () => void;
  onOpenAccessories?: () => void;
  onOpenSpecs?: () => void;
  onOpenWarranty?: () => void;
  onOpenDownload?: () => void;
};

export default function ManualInfoListSection({
  manual,
  onOpenComponents,
  onOpenAccessories,
  onOpenSpecs,
  onOpenWarranty,
  onOpenDownload,
}: Props) {
  const hasComponents =
    !!manual?.componentImageUrl || !!manual?.componentNotice;

  const hasAccessories = (manual?.accessories ?? []).length > 0;
  const hasSpecs = (manual?.specs ?? []).length > 0;

  const menus = [
    {
      id: 1,
      title: "구성품 안내",
      enabled: hasComponents,
      onClick: onOpenComponents,
      icon: "📦",
    },
    {
      id: 2,
      title: "액세서리",
      enabled: hasAccessories,
      onClick: onOpenAccessories,
      icon: "🧩",
    },
    {
      id: 3,
      title: "제품 사양",
      enabled: hasSpecs,
      onClick: onOpenSpecs,
      icon: "📄",
    },
    {
      id: 4,
      title: "제품 보증 (AS 관련)",
      enabled: true,
      onClick: onOpenWarranty,
      icon: "🛡️",
    },
    {
      id: 5,
      title: "매뉴얼 다운로드",
      enabled: true,
      onClick: onOpenDownload,
      icon: "⬇️",
    },
  ];

  return (
    <section className="px-5 pb-8">
      <div className="rounded-[22px] border border-black/5 bg-white p-3 shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
        <div className="space-y-2">
          {menus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              disabled={!menu.enabled}
              onClick={() => menu.enabled && menu.onClick?.()}
              className={`
                group flex w-full items-center justify-between rounded-[18px] px-3 py-3 transition
                ${
                  menu.enabled
                    ? "cursor-pointer active:scale-[0.98]"
                    : "cursor-not-allowed opacity-35"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#ececef] text-[18px]">
                  {menu.icon}
                </div>

                <span className="text-[14px] font-semibold text-[#4b5563]">
                  {menu.title}
                </span>
              </div>

              <span className="text-[20px] leading-none text-[#cfd3db]">
                ›
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}