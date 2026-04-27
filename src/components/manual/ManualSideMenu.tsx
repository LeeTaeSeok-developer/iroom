"use client";

import {
  Video,
  BookOpen,
  ShoppingCart,
  Package,
  Brush,
  AlertTriangle,
  HelpCircle,
  List,
  ShieldCheck,
  Download,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  itemName: string;

  onOpenVideoGuide?: () => void;
  onOpenUsage?: () => void;
  onOpenConsumableShop?: () => void;
  onOpenComponents?: () => void;
  onOpenAccessories?: () => void;
  onOpenCaution?: () => void;
  onOpenFaq?: () => void;
  onOpenSpecs?: () => void;
  onOpenWarranty?: () => void;
  onOpenDownload?: () => void;
};

type MenuItem = {
  id: number;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

export default function ManualSideMenu({
  open,
  onClose,
  itemName,
  onOpenVideoGuide,
  onOpenUsage,
  onOpenConsumableShop,
  onOpenComponents,
  onOpenAccessories,
  onOpenCaution,
  onOpenFaq,
  onOpenSpecs,
  onOpenWarranty,
  onOpenDownload,
}: Props) {
  // ✅ 제품명 파싱
  const parts = itemName?.split(" ") || [];

  const brand = parts[0] ?? "";
  const model = parts.slice(1, -1).join(" ") || parts[1] || "";
  const modelNumber = parts[parts.length - 1] ?? "";

  const menuItems: MenuItem[] = [
    {
      id: 1,
      label: "비디오 가이드",
      icon: <Video size={18} />,
      onClick: onOpenVideoGuide,
    },
    {
      id: 2,
      label: "사용 방법",
      icon: <BookOpen size={18} />,
      onClick: onOpenUsage,
    },
    {
      id: 3,
      label: "소모품 구매",
      icon: <ShoppingCart size={18} />,
      onClick: onOpenConsumableShop,
    },
    {
      id: 4,
      label: "구성품 안내",
      icon: <Package size={18} />,
      onClick: onOpenComponents,
    },
    {
      id: 5,
      label: "액세서리",
      icon: <Brush size={18} />,
      onClick: onOpenAccessories,
    },
    {
      id: 6,
      label: "주의사항",
      icon: <AlertTriangle size={18} />,
      onClick: onOpenCaution,
    },
    {
      id: 7,
      label: "자주 묻는 질문",
      icon: <HelpCircle size={18} />,
      onClick: onOpenFaq,
    },
    {
      id: 8,
      label: "제품 사양",
      icon: <List size={18} />,
      onClick: onOpenSpecs,
    },
    {
      id: 9,
      label: "제품 보증 (AS 관련)",
      icon: <ShieldCheck size={18} />,
      onClick: onOpenWarranty,
    },
    {
      id: 10,
      label: "매뉴얼 다운로드",
      icon: <Download size={18} />,
      onClick: onOpenDownload,
    },
  ];

  const handleMenuClick = (action?: () => void) => {
    onClose();
    action?.();
  };

  return (
    <>
      {/* 배경 */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[88] bg-black/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* 메뉴 */}
      <aside
        className={`fixed top-0 right-0 z-[89] flex h-screen w-[86%] max-w-[360px] flex-col bg-white shadow-[-14px_0_40px_rgba(0,0,0,0.18)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 상단 */}
        <div className="border-b border-gray-100 bg-gradient-to-b from-[#5f89eb] via-[#2f63df] to-[#224bbb] px-5 pb-6 pt-6 text-white">
          <div className="flex items-start justify-between">
            <div className="pr-4">
              <p className="text-[13px] font-medium tracking-[0.18em] text-white/75 uppercase">
                {brand}
              </p>

              <h2 className="mt-3 text-[26px] font-black leading-tight">
                {model}
                <br />
                {modelNumber}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/12 text-2xl text-white transition hover:bg-white/20 active:scale-95"
            >
              ×
            </button>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMenuClick(item.onClick)}
                className="group flex w-full cursor-pointer items-center justify-between rounded-[18px] bg-[#f6f8fc] px-4 py-[15px] transition hover:bg-[#eef4ff] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#2f63df] shadow-sm">
                    {item.icon}
                  </div>

                  <span className="text-[15px] font-semibold text-[#1f2a37]">
                    {item.label}
                  </span>
                </div>

                <span className="text-[18px] text-[#9aa4b2] transition group-hover:text-[#2f63df]">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}