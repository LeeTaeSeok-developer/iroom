"use client";

import { ManualEntryModel } from "@/model/firebase/manual_entry_model";

type Props = {
  manual?: ManualEntryModel | null;
  onOpenUsage?: () => void;
  onOpenFaq?: () => void;
  onOpenConsumableShop?: () => void;
  onOpenCaution?: () => void;
};

type MenuItem = {
  id: "usage" | "faq" | "consumable" | "caution";
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onClick?: () => void;
};

export default function ManualQuickMenuSection({
  manual,
  onOpenUsage,
  onOpenFaq,
  onOpenConsumableShop,
  onOpenCaution,
}: Props) {
  const menus: MenuItem[] = [
    ...(manual?.usageGuides?.length
      ? [
          {
            id: "usage" as const,
            title: "사용 방법",
            subtitle: "전체보기",
            icon: "📘",
            color: "bg-blue-100 text-blue-600",
            onClick: onOpenUsage,
          },
        ]
      : []),

    ...(manual?.faqs?.length
      ? [
          {
            id: "faq" as const,
            title: "자주 묻는 질문",
            subtitle: "전체보기",
            icon: "❓",
            color: "bg-red-100 text-red-500",
            onClick: onOpenFaq,
          },
        ]
      : []),

    ...(manual?.consumables?.length
      ? [
          {
            id: "consumable" as const,
            title: "소모품 구매",
            subtitle: "구매하기",
            icon: "🛒",
            color: "bg-green-100 text-green-600",
            onClick: onOpenConsumableShop,
          },
        ]
      : []),

    {
      id: "caution",
      title: "주의사항",
      subtitle: "안전 관리",
      icon: "⚠️",
      color: "bg-yellow-100 text-yellow-600",
      onClick: onOpenCaution,
    },
  ];

  if (menus.length === 0) return null;

  return (
    <section className="px-5 pb-6">
      <div className="grid grid-cols-2 gap-3">
        {menus.map((menu) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => {
              if (menu.onClick) {
                menu.onClick();
                return;
              }

              alert("이 메뉴는 아직 준비 중입니다.");
            }}
            className="
              cursor-pointer
              rounded-[18px]
              bg-white
              p-4
              text-left
              shadow-[0_6px_16px_rgba(0,0,0,0.06)]
              transition
              active:scale-[0.97]
              active:bg-transparent
              [webkit-tap-highlight-color:transparent]
            "
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${menu.color}`}
            >
              <span className="text-lg">{menu.icon}</span>
            </div>

            <p className="text-[15px] font-bold text-black">{menu.title}</p>

            <p className="mt-1 text-[12px] text-gray-400">
              {menu.subtitle} →
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}