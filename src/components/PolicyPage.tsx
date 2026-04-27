"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PolicyModel, PolicyType } from "@/model/firebase/policy_model";

type Props = {
  type: "as" | "return" | null;
  onClose: () => void;
};

const fallbackTitle: Record<"as" | "return", string> = {
  as: "A/S 정책",
  return: "교환 / 반품 정책",
};

export default function PolicyPage({ type, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [policy, setPolicy] = useState<PolicyModel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    let raf1 = 0;
    let raf2 = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (type) {
      setMounted(true);
      setVisible(false);
      document.body.style.overflow = "hidden";

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      document.body.style.overflow = originalOverflow;

      timer = setTimeout(() => {
        setMounted(false);
        setPolicy(null);
      }, 300);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
    };
  }, [type]);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!type) return;

      try {
        setLoading(true);
        setPolicy(null);

        const snap = await getDoc(doc(db, "policies", type));

        if (!snap.exists()) {
          setPolicy(null);
          return;
        }

        const data = PolicyModel.fromMap(snap.data(), snap.id);

        if (!data.isActive) {
          setPolicy(null);
          return;
        }

        setPolicy(data);
      } catch (error) {
        console.error("정책 불러오기 실패:", error);
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [type]);

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!mounted || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-hidden bg-black/30">
      <div
        className={`h-screen w-full max-w-[700px] transform-gpu overflow-hidden bg-[#f7f7f7] transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ←
          </button>

          <h2 className="text-lg font-extrabold text-black">
            {policy?.title || fallbackTitle[type]}
          </h2>

          <div className="h-11 w-11" />
        </header>

        <div className="h-[calc(100vh-76px)] overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="rounded-3xl bg-white px-5 py-6 text-center text-sm font-bold text-gray-400 shadow-sm">
              정책을 불러오는 중입니다.
            </div>
          ) : !policy ? (
            <div className="rounded-3xl bg-white px-5 py-6 text-center text-sm font-bold text-gray-400 shadow-sm">
              등록된 정책이 없습니다.
            </div>
          ) : (
            <section className="rounded-3xl bg-white px-5 py-6 shadow-sm">
              <h3 className="text-xl font-black text-black">
                {policy.title || fallbackTitle[type]}
              </h3>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-600">
                {policy.content}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}