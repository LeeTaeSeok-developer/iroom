"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ShoppingBag,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Boxes,
  PackageSearch,
  MessageCircleQuestion,
  BookOpenText,
  FileText,
  Hash,
  LayoutDashboard,
  Users,
  ChevronRight,
} from "lucide-react";

type AdminMenuItem = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
};

const adminMenus: AdminMenuItem[] = [
  {
    title: "브랜드 관리",
    desc: "브랜드 추가, 수정, 노출 여부 관리",
    icon: <Boxes size={22} />,
    href: "/manager/brands",
  },
  {
    title: "제품 관리",
    desc: "제품 정보, 카테고리, 검색 키워드 관리",
    icon: <PackageSearch size={22} />,
    href: "/manager/products",
  },
  {
    title: "FAQ 관리",
    desc: "카테고리별 자주 묻는 질문 관리",
    icon: <MessageCircleQuestion size={22} />,
    href: "/manager/faq",
  },
  {
    title: "매뉴얼 관리",
    desc: "사용법, 소모품, 구성품, FAQ, 사양 정보 관리",
    icon: <BookOpenText size={22} />,
    href: "/manager/manuals",
  },
  {
    title: "정책 관리",
    desc: "A/S, 교환/반품, 주의사항, 제품 보증 관리",
    icon: <FileText size={22} />,
    href: "/manager/policies",
  },
  {
    title: "추천 키워드 관리",
    desc: "메인 추천 검색어 및 노출 순서 관리",
    icon: <Hash size={22} />,
    href: "/manager/recommended-keywords",
  },
  {
    title: "스토어 링크 관리",
    desc: "공식 스토어 링크 추가, 수정, 삭제 관리",
    icon: <ShoppingBag size={22} />,
    href: "/manager/store-links",
  },
  {
    title: "AI 상담 관리",
    desc: "AI 질문 및 답변 데이터 관리",
    icon: <LayoutDashboard size={22} />,
    href: "/manager/ai",
  },
];

export default function ManagerPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/manager/login");
        return;
      }

      setAdminEmail(user.email ?? "");
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/manager/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_42%,#f4f7fb_100%)] px-5 py-8 text-slate-900">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
            관리자 인증 확인 중...
          </div>
        </div>
      </main>
    );
  }

  console.log("현재 로그인 UID:", auth.currentUser?.uid);
  console.log("현재 로그인 이메일:", auth.currentUser?.email);

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-5 sm:px-6"
      style={{
        background:
          "linear-gradient(180deg, #eef6ff 0%, #f8fbff 42%, #f4f7fb 100%)",
        color: "#0f172a",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 top-[-10px] h-52 w-52 rounded-full blur-3xl"
          style={{ background: "rgba(96, 165, 250, 0.18)" }}
        />
        <div
          className="absolute right-[-30px] top-[120px] h-56 w-56 rounded-full blur-3xl"
          style={{ background: "rgba(125, 211, 252, 0.16)" }}
        />
        <div
          className="absolute left-1/2 top-[320px] h-40 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "rgba(191, 219, 254, 0.18)" }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            홈으로 돌아가기
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        <section className="mt-7">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-[0.18em] uppercase"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            }}
          >
            <ShieldCheck size={14} />
            Admin Dashboard
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            관리자 홈
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            필요한 관리 메뉴를 선택해서 브랜드, 제품, FAQ, 매뉴얼, 정책,
            배너 노출 등을 관리할 수 있어요.
          </p>
        </section>

        <section className="mt-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {adminMenus.map((menu) => (
              <button
                key={menu.title}
                type="button"
                onClick={() => router.push(menu.href)}
                className="group rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_24px_55px_rgba(15,23,42,0.12)] active:scale-[0.99]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 16px 32px rgba(37,99,235,0.22)",
                    }}
                  >
                    {menu.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[18px] font-black tracking-[-0.03em] text-slate-900">
                        {menu.title}
                      </h2>

                      <ChevronRight className="mt-0.5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                    </div>

                    <p className="mt-2 text-[13px] leading-6 text-slate-500">
                      {menu.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}