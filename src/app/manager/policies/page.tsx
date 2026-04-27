"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { PolicyModel, PolicyType } from "@/model/firebase/policy_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  FileText,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";


const policyTypes: PolicyType[] = ["as", "return", "caution", "warranty"];

const typeLabelMap: Record<PolicyType, string> = {
  as: "A/S 정책",
  return: "교환 / 반품 정책",
  caution: "주의사항",
  warranty: "제품 보증",
};

const typeDescMap: Record<PolicyType, string> = {
  as: "수리, 보증, 서비스 기준 안내",
  return: "교환 및 반품 접수 기준 안내",
  caution: "공통 주의사항 문구 관리",
  warranty: "제품 보증 공통 문구 관리",
};

const typeBadgeClassMap: Record<PolicyType, string> = {
  as: "bg-blue-50 text-blue-700",
  return: "bg-amber-50 text-amber-700",
  caution: "bg-rose-50 text-rose-700",
  warranty: "bg-emerald-50 text-emerald-700",
};

export default function ManagerPoliciesPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Record<PolicyType, PolicyModel | null>>({
    as: null,
    return: null,
    caution: null,
    warranty: null,
  });

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
        loadPolicies();
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadPolicies = async () => {
    try {
      setLoading(true);

      const results = await Promise.all(
        policyTypes.map(async (type) => {
          const snapshot = await getDoc(doc(db, "policies", type));

          if (!snapshot.exists()) {
            return [type, null] as const;
          }

          return [type, PolicyModel.fromMap(snapshot.data(), snapshot.id)] as const;
        })
      );

      setPolicies({
        as: results.find(([type]) => type === "as")?.[1] ?? null,
        return: results.find(([type]) => type === "return")?.[1] ?? null,
        caution: results.find(([type]) => type === "caution")?.[1] ?? null,
        warranty: results.find(([type]) => type === "warranty")?.[1] ?? null,
      });
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

  const activeCount = policyTypes.filter((type) => policies[type]?.isActive).length;

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
            Policy Manager
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            정책 관리
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            정책은 종류별로 1개씩만 관리돼요. 필요한 항목을 눌러 바로 수정하면 됩니다.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">전체 정책 종류</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">4</p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">등록 완료</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {policyTypes.filter((type) => !!policies[type]).length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">사용 중</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {activeCount}
            </p>
          </div>
        </section>

        <section className="mt-5">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
              정책 목록 불러오는 중...
            </div>
          ) : (
            <div className="space-y-4">
              {policyTypes.map((type) => {
                const policy = policies[type];

                return (
                  <div
                    key={type}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_52px_rgba(15,23,42,0.10)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${typeBadgeClassMap[type]}`}
                          >
                            {typeLabelMap[type]}
                          </span>

                          {policy ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                policy.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {policy.isActive ? (
                                <>
                                  <Eye size={12} />
                                  사용 중
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} />
                                  숨김
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                              아직 없음
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-[20px] font-black tracking-[-0.03em] text-slate-900">
                          {policy?.title?.trim() || typeLabelMap[type]}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {typeDescMap[type]}
                        </p>

                        <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-[14px] leading-7 text-slate-600">
                          {policy?.content?.trim() || "아직 등록된 내용이 없습니다."}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/manager/policies/${type}`)}
                          className="inline-flex items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <FileText size={16} />
                          수정
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}