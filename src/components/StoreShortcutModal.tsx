"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StoreLinkModel } from "@/model/firebase/store_link_model";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function StoreShortcutModal({ open, onClose }: Props) {
  const [stores, setStores] = useState<StoreLinkModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!open) return;

      try {
        setLoading(true);

        const q = query(collection(db, "storeLinks"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);

        const list = snapshot.docs
          .map((doc) => StoreLinkModel.fromMap(doc.data(), doc.id))
          .filter((store) => store.isActive && store.url.trim());

        setStores(list);
      } catch (error) {
        console.error("스토어 링크 불러오기 실패:", error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [open]);

  const handleMove = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[79] bg-black/60 backdrop-blur-[6px] transition duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed inset-0 z-[80] flex items-center justify-center px-4 transition duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`relative w-full max-w-[430px] overflow-hidden rounded-[30px] border border-white/12 bg-[#07152d] shadow-[0_20px_80px_rgba(0,0,0,0.55)] transition duration-300 ${
            open ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,160,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(55,120,255,0.16),transparent_32%),linear-gradient(180deg,#243247_0%,#08142b_58%,#031024_100%)]" />

          <div className="pointer-events-none absolute inset-[1px] rounded-[29px] border border-white/6" />

          <div className="relative px-6 pb-6 pt-8">
            <div className="mb-7 text-center">
              <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-white">
                공식 스토어 바로가기
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-white/58">
                방문하실 스토어를 선택하세요.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="rounded-[18px] border border-white/14 bg-white/[0.07] px-5 py-4 text-center text-[14px] font-bold text-white/60">
                  스토어를 불러오는 중입니다.
                </div>
              ) : stores.length === 0 ? (
                <div className="rounded-[18px] border border-white/14 bg-white/[0.07] px-5 py-4 text-center text-[14px] font-bold text-white/60">
                  등록된 스토어가 없습니다.
                </div>
              ) : (
                stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => handleMove(store.url)}
                    className="w-full rounded-[18px] border border-white/14 bg-white/[0.07] px-5 py-4 text-left text-[15px] font-bold text-white backdrop-blur-sm transition hover:border-[#6ba2ff] hover:bg-white/[0.10] hover:shadow-[0_0_0_3px_rgba(70,120,255,0.10)] active:scale-[0.98]"
                  >
                    {store.name}
                  </button>
                ))
              )}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[18px] bg-[linear-gradient(135deg,#5ea2ff_0%,#3f7dff_42%,#315dff_70%,#5a49ff_100%)] py-4 text-[16px] font-extrabold text-white shadow-[0_10px_30px_rgba(60,110,255,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:brightness-110 active:scale-[0.98]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}