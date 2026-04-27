"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { PolicyType } from "@/model/firebase/policy_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Save,
  FileText,
} from "lucide-react";

const VALID_POLICY_TYPES: PolicyType[] = ["as", "return", "caution", "warranty"];

const typeLabelMap: Record<PolicyType, string> = {
  as: "A/S 정책",
  return: "교환 / 반품 정책",
  caution: "주의사항",
  warranty: "제품 보증",
};

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();

  const type = useMemo(() => {
    const raw = params.type;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return VALID_POLICY_TYPES.includes(value as PolicyType)
      ? (value as PolicyType)
      : null;
  }, [params.type]);

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

        if (!type) {
          alert("잘못된 정책 타입이에요.");
          router.replace("/manager/policies");
          return;
        }

        setChecking(false);
        await loadPolicy(type);
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router, type]);

  const loadPolicy = async (policyType: PolicyType) => {
    try {
      setLoading(true);

      const snapshot = await getDoc(doc(db, "policies", policyType));

      if (!snapshot.exists()) {
        setTitle(typeLabelMap[policyType]);
        setContent("");
        setIsActive(true);
        return;
      }

      const data = snapshot.data();
      setTitle(data.title ?? typeLabelMap[policyType]);
      setContent(data.content ?? "");
      setIsActive(data.isActive ?? true);
    } catch (error) {
      alert("정책 정보를 불러오지 못했어요.");
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

  const handleSave = async () => {
    if (!type) return;

    if (!title.trim()) {
      alert("정책 제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("정책 내용을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      await setDoc(doc(db, "policies", type), {
        type,
        title: title.trim(),
        content: content.trim(),
        isActive,
      });

      alert("정책이 저장되었어요.");
      router.push("/manager/policies");
    } catch (error) {
      alert("정책 저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
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

  if (!type) {
    return null;
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
            onClick={() => router.push("/manager/policies")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            정책 관리
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
            Policy Editor
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            {typeLabelMap[type]} 수정
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            이 정책은 종류별로 1개만 저장됩니다. 저장하면 기존 내용이 덮어써져요.
          </p>
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
              정책 정보를 불러오는 중...
            </div>
          ) : (
            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-6">
              <div className="mb-6 flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 18px 36px rgba(37,99,235,0.24)",
                  }}
                >
                  <FileText size={22} />
                </div>

                <div className="pt-1">
                  <h2 className="text-[26px] font-black tracking-[-0.03em] text-slate-900">
                    정책 정보
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    제목, 내용, 노출 여부를 수정할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    정책 종류
                  </label>
                  <div className="flex h-13 items-center rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800">
                    {typeLabelMap[type]}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    정책 제목
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="정책 제목을 입력하세요"
                    className="h-14 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    정책 내용
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="정책 내용을 입력하세요"
                    rows={14}
                    className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                  />
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">사용 여부</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        비활성화하면 프론트에서 숨김 처리할 때 쓰기 좋아요.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-5 w-5"
                    />
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/manager/policies")}
                    className="rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-[18px] px-5 py-3 text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 16px 30px rgba(37,99,235,0.22)",
                    }}
                  >
                    <Save size={16} />
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}