"use client";

import { useEffect } from "react";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
  onOpenAI: () => void;
  onOpenFAQ: () => void;
  onScrollToBrand: () => void;
  onScrollToProduct: () => void;
  onOpenAS: () => void;
  onOpenReturn: () => void;
  onOpenPartner: () => void;
  onOpenStore: () => void;
  onOpenAdminLogin: () => void;
};

type MenuItem = {
  title: string;
  desc: string;
  icon: string;
  onClick: () => void;
};

export default function SideMenu({
  open,
  onClose,
  onOpenAI,
  onOpenFAQ,
  onScrollToBrand,
  onScrollToProduct,
  onOpenAS,
  onOpenReturn,
  onOpenPartner,
  onOpenStore,
  onOpenAdminLogin,
}: SideMenuProps) {
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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const menuItems: MenuItem[] = [
    {
      title: "AI 스마트 상담",
      desc: "도우봇으로 빠르게 해결하기",
      icon: "💬",
      onClick: () => {
        onOpenAI();
        onClose();
      },
    },
    {
      title: "자주 묻는 질문",
      desc: "많이 찾는 질문 바로 보기",
      icon: "❓",
      onClick: () => {
        onOpenFAQ();
        onClose();
      },
    },
    {
      title: "브랜드로 찾기",
      desc: "브랜드별 제품 바로 찾기",
      icon: "🏷️",
      onClick: () => {
        onScrollToBrand();
        onClose();
      },
    },
    {
      title: "상품으로 찾기",
      desc: "도움이 필요한 상품 선택",
      icon: "🧹",
      onClick: () => {
        onScrollToProduct();
        onClose();
      },
    },
    {
      title: "A/S 정책",
      desc: "수리 및 보증 안내 보기",
      icon: "🛠️",
      onClick: () => {
        onOpenAS();
        onClose();
      },
    },
    {
      title: "교환 / 반품 정책",
      desc: "교환·반품 기준 확인",
      icon: "📦",
      onClick: () => {
        onOpenReturn();
        onClose();
      },
    },
    {
      title: "제휴문의",
      desc: "협력 및 제안 문의하기",
      icon: "🤝",
      onClick: () => {
        onOpenPartner();
        onClose();
      },
    },
    {
      title: "공식 스토어 바로가기",
      desc: "공식 판매처로 이동",
      icon: "🛍️",
      onClick: () => {
        onOpenStore();
        onClose();
      },
    },
    {
      title: "관리자 로그인",
      desc: "관리자 페이지로 이동",
      icon: "🔐",
      onClick: () => {
        onOpenAdminLogin();
        onClose();
      },
    },
  ];

  return (
    <>
      {/* 배경 */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[3px] transition-all duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* 메뉴 */}
      <aside
        className={`fixed right-0 top-0 z-[9999] h-screen w-[88vw] max-w-[390px] overflow-hidden
        bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_20px_70px_rgba(0,0,0,0.22)]
        transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <div className="relative overflow-hidden border-b border-black/5 bg-[linear-gradient(135deg,#111827_0%,#1f2937_45%,#374151_100%)] px-5 pb-5 pt-6 text-white">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 left-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-[0.24em] text-white/60">
                  IROOM SUPPORT
                </p>
                <h2 className="mt-2 text-[24px] font-extrabold tracking-[-0.03em]">
                  빠른 메뉴
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  필요한 기능으로 바로 이동해보세요.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="메뉴 닫기"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20 active:scale-95"
              >
                ✕
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.onClick}
                  className="group flex w-full cursor-pointer items-center gap-4 rounded-[24px] border border-black/5 bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-[1px] hover:border-black/10 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)] active:scale-[0.985]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f3f4f6_0%,#ffffff_100%)] text-[24px] shadow-inner">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-extrabold tracking-[-0.02em] text-black">
                      {item.title}
                    </div>
                    <div className="mt-1 text-[12px] leading-5 text-gray-500">
                      {item.desc}
                    </div>
                  </div>

                  <div className="shrink-0 text-[20px] text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600">
                    ›
                  </div>
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-black/5 bg-white/80 px-4 py-4 backdrop-blur">
            <div className="rounded-[22px] bg-[linear-gradient(135deg,#111827_0%,#1f2937_100%)] px-4 py-4 text-white shadow-[0_10px_28px_rgba(17,24,39,0.24)]">
              <p className="text-sm font-bold">고객센터 운영시간</p>
              <p className="mt-1 text-sm text-white/70">평일 (월~목) : 10:00~ 17:00</p>
              <p className="mt-1 text-sm text-white/70">평일 (금) : 10:00~16:00</p>
              <p className="mt-1 text-sm text-white/70">전화번호 : 1566-4027</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}