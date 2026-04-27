"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PolicyModel } from "@/model/firebase/policy_model";
import { StoreLinkModel } from "@/model/firebase/store_link_model";

type Props = {
  onOpenAsPolicy: () => void;
  onOpenReturnPolicy: () => void;
  onOpenPartnerInquiry: () => void;
  onOpenStoreShortcut: () => void;
};

type InfoButtonKey = "as" | "return" | "partner" | "store";

type InfoButton = {
  label: string;
  onKey: InfoButtonKey;
};

export default function InfoSection({
  onOpenAsPolicy,
  onOpenReturnPolicy,
  onOpenPartnerInquiry,
  onOpenStoreShortcut,
}: Props) {
  const [asPolicy, setAsPolicy] = useState<PolicyModel | null>(null);
  const [returnPolicy, setReturnPolicy] = useState<PolicyModel | null>(null);
  const [hasStoreLinks, setHasStoreLinks] = useState(false);

  useEffect(() => {
    const fetchInfoData = async () => {
      try {
        const [asSnap, returnSnap, storeSnap] = await Promise.all([
          getDoc(doc(db, "policies", "as")),
          getDoc(doc(db, "policies", "return")),
          getDocs(collection(db, "storeLinks")),
        ]);

        if (asSnap.exists()) {
          const policy = PolicyModel.fromMap(asSnap.data(), asSnap.id);
          setAsPolicy(policy.isActive ? policy : null);
        } else {
          setAsPolicy(null);
        }

        if (returnSnap.exists()) {
          const policy = PolicyModel.fromMap(returnSnap.data(), returnSnap.id);
          setReturnPolicy(policy.isActive ? policy : null);
        } else {
          setReturnPolicy(null);
        }

        const activeStoreLinks = storeSnap.docs
          .map((item) => StoreLinkModel.fromMap(item.data(), item.id))
          .filter((item) => item.isActive && item.url.trim());

        setHasStoreLinks(activeStoreLinks.length > 0);
      } catch (error) {
        console.error("정보 섹션 불러오기 실패:", error);
        setAsPolicy(null);
        setReturnPolicy(null);
        setHasStoreLinks(false);
      }
    };

    fetchInfoData();
  }, []);

  const buttons = useMemo<InfoButton[]>(() => {
    const list: InfoButton[] = [];

    if (asPolicy) {
      list.push({
        label: asPolicy.title || "A/S 정책",
        onKey: "as",
      });
    }

    if (returnPolicy) {
      list.push({
        label: returnPolicy.title || "교환 / 반품 정책",
        onKey: "return",
      });
    }

    list.push({
      label: "제휴문의",
      onKey: "partner",
    });

    if (hasStoreLinks) {
      list.push({
        label: "공식 스토어 바로가기",
        onKey: "store",
      });
    }

    return list;
  }, [asPolicy, returnPolicy, hasStoreLinks]);

  const handleClick = (key: InfoButtonKey) => {
    if (key === "as") onOpenAsPolicy();
    if (key === "return") onOpenReturnPolicy();
    if (key === "partner") onOpenPartnerInquiry();
    if (key === "store") onOpenStoreShortcut();
  };

  return (
    <section className="mt-10 bg-black px-6 pb-10 pt-8 text-white">
      <div className="mb-4">
        <h2 className="text-left text-xl font-extrabold">정보</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {buttons.map((button) => (
          <button
            key={button.onKey}
            type="button"
            onClick={() => handleClick(button.onKey)}
            className="flex cursor-pointer min-h-[92px] items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-4 text-center text-sm font-bold text-white transition hover:bg-white hover:text-black active:scale-95"
          >
            {button.label}
          </button>
        ))}
      </div>
    </section>
  );
}