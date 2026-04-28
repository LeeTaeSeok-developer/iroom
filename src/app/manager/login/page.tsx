"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Sparkles,
} from "lucide-react";

export default function ManagerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/invalid-email":
        return "이메일 형식이 올바르지 않습니다.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "이메일 또는 비밀번호를 다시 확인해주세요.";
      case "auth/too-many-requests":
        return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.";
      case "auth/network-request-failed":
        return "네트워크 연결 상태를 확인해주세요.";
      case "auth/operation-not-allowed":
        return "Firebase 콘솔에서 이메일/비밀번호 로그인이 활성화되지 않았습니다.";
      default:
        return "로그인 중 오류가 발생했습니다.";
    }
  };

  const saveAdminUser = async (uid: string, email: string) => {
    const adminRef = doc(db, "admin_users", uid);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        id: uid,
        email,
        role: "manager",
        createdAt: serverTimestamp(),
      });
      return;
    }

    await setDoc(
      adminRef,
      {
        email,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !pw.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        pw
      );

      const adminRef = doc(db, "admin_users", result.user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        setError("관리자 계정만 로그인할 수 있습니다.");
        return;
      }

      const adminData = adminSnap.data();

      if (adminData.role !== "manager") {
        setError("관리자 권한이 없습니다.");
        return;
      }

      await setDoc(
        adminRef,
        {
          email: result.user.email ?? email.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push("/manager");
    } catch (err: any) {
      setError(getErrorMessage(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #eef6ff 0%, #f8fbff 42%, #f4f7fb 100%)",
        color: "#0f172a",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 top-[-10px] h-52 w-52 rounded-full blur-3xl"
          style={{ background: "rgba(96, 165, 250, 0.22)" }}
        />
        <div
          className="absolute right-[-30px] top-[110px] h-56 w-56 rounded-full blur-3xl"
          style={{ background: "rgba(125, 211, 252, 0.20)" }}
        />
        <div
          className="absolute left-1/2 top-[270px] h-36 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "rgba(191, 219, 254, 0.22)" }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-5 pb-10 pt-5 sm:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: "#ffffff",
              color: "#334155",
              border: "1px solid #dbe3ee",
            }}
          >
            <ArrowLeft size={16} />
            홈으로 돌아가기
          </button>

          <div
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold sm:inline-flex"
            style={{
              backgroundColor: "rgba(255,255,255,0.72)",
              color: "#475569",
              border: "1px solid rgba(203,213,225,0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Sparkles size={14} />
            Secure Access
          </div>
        </div>

        <section className="mt-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-[0.18em] uppercase"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            }}
          >
            <ShieldCheck size={14} />
            Admin Only
          </div>

          <h1
            className="mt-5 text-[36px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[44px]"
            style={{ color: "#0f172a" }}
          >
            관리자 로그인
          </h1>

          <p
            className="mt-3 max-w-[560px] text-[15px] leading-7"
            style={{ color: "#475569" }}
          >
            제품, FAQ, 정책, 제휴문의 등 관리자 기능을 이용하려면
            관리자 계정으로 로그인해주세요.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div
            className="rounded-[24px] px-4 py-4 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
              border: "1px solid #dbeafe",
            }}
          >
            <p
              className="text-[12px] font-semibold"
              style={{ color: "#64748b" }}
            >
              서비스
            </p>
            <p
              className="mt-1.5 text-[15px] font-extrabold"
              style={{ color: "#0f172a" }}
            >
              IROOM Admin
            </p>
          </div>

          <div
            className="rounded-[24px] px-4 py-4 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <p
              className="text-[12px] font-semibold"
              style={{ color: "#64748b" }}
            >
              접근
            </p>
            <p
              className="mt-1.5 text-[15px] font-extrabold"
              style={{ color: "#0f172a" }}
            >
              관리자 전용
            </p>
          </div>
        </section>

        <section className="mt-7">
          <div
            className="overflow-hidden rounded-[32px] p-[1px] shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(219,234,254,0.95) 100%)",
            }}
          >
            <div
              className="rounded-[31px] px-5 py-6 sm:px-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div className="mb-6 flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 18px 36px rgba(37,99,235,0.28)",
                    color: "#ffffff",
                  }}
                >
                  <LockKeyhole size={23} />
                </div>

                <div className="pt-1">
                  <h2
                    className="text-[28px] font-black tracking-[-0.03em]"
                    style={{ color: "#0f172a" }}
                  >
                    로그인
                  </h2>
                  <p
                    className="mt-1 text-sm leading-6"
                    style={{ color: "#64748b" }}
                  >
                    관리자 이메일과 비밀번호를 입력해 주세요.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: "#334155" }}
                  >
                    이메일
                  </label>

                  <div
                    className="flex items-center gap-3 rounded-[22px] px-4 shadow-sm transition"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <UserRound size={18} style={{ color: "#94a3b8" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="관리자 이메일을 입력하세요"
                      className="h-14 w-full bg-transparent text-[15px] outline-none"
                      style={{ color: "#0f172a" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-bold"
                    style={{ color: "#334155" }}
                  >
                    비밀번호
                  </label>

                  <div
                    className="flex items-center gap-3 rounded-[22px] px-4 shadow-sm transition"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <LockKeyhole size={18} style={{ color: "#94a3b8" }} />
                    <input
                      type="password"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="h-14 w-full bg-transparent text-[15px] outline-none"
                      style={{ color: "#0f172a" }}
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className="rounded-[18px] px-4 py-3 text-sm font-semibold"
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-14 w-full items-center justify-center rounded-[22px] text-[15px] font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 18px 34px rgba(37,99,235,0.24)",
                  }}
                >
                  {loading ? "로그인 중..." : "로그인"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}