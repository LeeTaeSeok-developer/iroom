"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { RecommendedKeywordModel } from "@/model/firebase/recommended_keyword_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Hash,
  Eye,
  EyeOff,
  Save,
  Trash2,
} from "lucide-react";


export default function RecommendedKeywordDetailPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

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
        loadKeyword();
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router, id]);

  const loadKeyword = async () => {
    if (!id || typeof id !== "string") {
      alert("잘못된 접근이에요.");
      router.replace("/manager/recommended-keywords");
      return;
    }

    try {
      setLoading(true);

      const snapshot = await getDoc(doc(db, "recommendedKeywords", id));

      if (!snapshot.exists()) {
        alert("추천 키워드를 찾을 수 없어요.");
        router.replace("/manager/recommended-keywords");
        return;
      }

      const item = RecommendedKeywordModel.fromMap(snapshot.data(), snapshot.id);

      setKeyword(item.keyword ?? "");
      setOrder(String(item.order ?? 0));
      setIsActive(item.isActive ?? true);
    } catch (error) {
      alert("추천 키워드 정보를 불러오지 못했어요.");
      router.replace("/manager/recommended-keywords");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || typeof id !== "string") return;

    const trimmedKeyword = keyword.trim();
    const parsedOrder = Number(order);

    if (!trimmedKeyword) {
      alert("추천 키워드를 입력해주세요.");
      return;
    }

    if (Number.isNaN(parsedOrder)) {
      alert("노출 순서는 숫자로 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, "recommendedKeywords", id), {
        keyword: trimmedKeyword,
        order: parsedOrder,
        isActive,
      });

      alert("추천 키워드가 수정되었어요.");
      router.push("/manager/recommended-keywords");
    } catch (error) {
      alert("추천 키워드 수정 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || typeof id !== "string") return;

    const ok = window.confirm(
      `'${keyword || "이 키워드"}'를 삭제할까요?\n삭제 후 되돌릴 수 없어요.`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "recommendedKeywords", id));
      alert("추천 키워드가 삭제되었어요.");
      router.push("/manager/recommended-keywords");
    } catch (error) {
      alert("추천 키워드 삭제 중 오류가 발생했어요.");
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_42%,#f4f7fb_100%)] px-5 py-8 text-slate-900">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
            추천 키워드 정보 불러오는 중...
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
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/manager/recommended-keywords")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            추천 키워드 관리
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
            Edit Keyword
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            추천 키워드 수정
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            추천 검색어 문구, 노출 순서, 노출 여부를 수정할 수 있어요.
          </p>
        </section>

        <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                추천 키워드
              </label>
              <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4">
                <Hash size={18} className="text-slate-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 무선청소기"
                  className="h-14 w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                노출 순서
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                className="h-14 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                노출 여부
              </label>
              <button
                type="button"
                onClick={() => setIsActive((prev) => !prev)}
                className={`inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                {isActive ? "노출 중" : "숨김"}
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={16} />
                삭제하기
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/manager/recommended-keywords")}
                  className="h-14 rounded-[22px] border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] px-5 text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 18px 34px rgba(37,99,235,0.24)",
                  }}
                >
                  <Save size={16} />
                  {saving ? "저장 중..." : "수정 저장"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}