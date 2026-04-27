"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { RecommendedKeywordModel } from "@/model/firebase/recommended_keyword_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Search,
  Plus,
  ChevronRight,
  Trash2,
  Hash,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";


export default function ManagerRecommendedKeywordsPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [keywords, setKeywords] = useState<RecommendedKeywordModel[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/manager/login");
        return;
      }

      try {
        const adminRef = doc(db, "admin_users", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists() || adminSnap.data().role !== "manager") {
          await signOut(auth);
          router.replace("/manager/login");
          return;
        }

        setChecking(false);
        loadKeywords();
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadKeywords = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "recommendedKeywords"));

      const items = snapshot.docs
        .map((item) => RecommendedKeywordModel.fromMap(item.data(), item.id))
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return (a.keyword ?? "").localeCompare(b.keyword ?? "", "ko");
        });

      setKeywords(items);
    } catch (error) {
      alert("추천 키워드 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/manager/login");
    } catch (error) {
      alert("로그아웃 중 오류가 발생했어요.");
    }
  };

  const handleDelete = async (item: RecommendedKeywordModel) => {
    const ok = window.confirm(
      `'${item.keyword}' 추천 키워드를 삭제할까요?\n삭제 후 되돌릴 수 없어요.`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "recommendedKeywords", item.id));
      setKeywords((prev) => prev.filter((keyword) => keyword.id !== item.id));
    } catch (error) {
      alert("추천 키워드 삭제 중 오류가 발생했어요.");
    }
  };

  const filteredKeywords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return keywords;

    return keywords.filter((item) =>
      (item.keyword ?? "").toLowerCase().includes(keyword)
    );
  }, [keywords, search]);

  const activeCount = keywords.filter((item) => item.isActive).length;

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
            onClick={() => router.push("/manager")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            관리자 홈
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
            Recommended Keywords
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            추천 키워드 관리
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            메인 추천 검색어와 노출 순서를 관리할 수 있어요.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">전체 키워드</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {keywords.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">사용 중</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">검색 결과</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {filteredKeywords.length}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[360px]">
                <Search
                    size={18}
                    className="pointer-events-none absolute text-slate-400"
                    style={{
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    }}
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="추천 키워드 검색"
                    className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 pr-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                    style={{ paddingLeft: "44px" }}
                />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadKeywords}
                className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                새로고침
              </button>

              <button
                type="button"
                onClick={() => router.push("/manager/recommended-keywords/new")}
                className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
                }}
              >
                <Plus size={16} />
                추천 키워드 추가
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
              추천 키워드 목록 불러오는 중...
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Hash size={24} />
              </div>
              <p className="mt-4 text-[16px] font-bold text-slate-800">
                표시할 추천 키워드가 없어요
              </p>
              <p className="mt-2 text-sm text-slate-500">
                새 추천 키워드를 추가해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKeywords.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_52px_rgba(15,23,42,0.10)] sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
                          <Hash size={12} />
                          추천 키워드
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                          순서 {item.order}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                          {item.isActive ? "노출 중" : "숨김"}
                        </span>
                      </div>

                      <h2 className="mt-3 text-[22px] font-black tracking-[-0.03em] text-slate-900">
                        {item.keyword || "키워드 없음"}
                      </h2>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/manager/recommended-keywords/${item.id}`)
                        }
                        className="inline-flex items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        수정
                        <ChevronRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center gap-2 rounded-[16px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}