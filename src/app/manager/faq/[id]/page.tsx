"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { FAQCategoryModel, FAQItemModel } from "@/model/firebase/faq_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  MessageCircleQuestion,
  Eye,
  EyeOff,
  Hash,
} from "lucide-react";


type DraftFaqItem = {
  id: string;
  question: string;
  answer: string;
  tagsText: string;
  order: number;
  isActive: boolean;
};

function createEmptyItem(index: number): DraftFaqItem {
  return {
    id: `faq-item-${Date.now()}-${index}`,
    question: "",
    answer: "",
    tagsText: "",
    order: index,
    isActive: true,
  };
}

export default function ManagerFaqEditPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const faqId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<DraftFaqItem[]>([]);

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
        await loadFaq();
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router, faqId]);

  const loadFaq = async () => {
    if (!faqId) {
      alert("잘못된 FAQ 경로예요.");
      router.replace("/manager/faq");
      return;
    }

    try {
      setLoading(true);

      const snapshot = await getDoc(doc(db, "faqCategories", faqId));

      if (!snapshot.exists()) {
        alert("FAQ를 찾을 수 없어요.");
        router.replace("/manager/faq");
        return;
      }

      const faq = FAQCategoryModel.fromMap(snapshot.data(), snapshot.id);

      setLabel(faq.label ?? "");
      setOrder(faq.order ?? 0);
      setIsActive(faq.isActive ?? true);
      setItems(
        (faq.items ?? []).length > 0
          ? faq.items.map((item, index) => ({
              id: item.id || `faq-item-${Date.now()}-${index}`,
              question: item.question ?? "",
              answer: item.answer ?? "",
              tagsText: (item.tags ?? []).join(", "),
              order: item.order ?? index,
              isActive: item.isActive ?? true,
            }))
          : [createEmptyItem(0)]
      );
    } catch (error) {
      alert("FAQ 정보를 불러오지 못했어요.");
      router.replace("/manager/faq");
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

  const updateItem = (
    targetId: string,
    key: keyof DraftFaqItem,
    value: string | number | boolean
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === targetId ? { ...item, [key]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem(prev.length)]);
  };

  const removeItem = (targetId: string) => {
    if (items.length === 1) {
      alert("질문은 최소 1개 이상 있어야 해요.");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== targetId));
  };

  const parsedPreview = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
      tags: item.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }));
  }, [items]);

  const validate = () => {
    if (!label.trim()) {
      alert("카테고리명을 입력해주세요.");
      return false;
    }

    const validItems = items.filter(
      (item) => item.question.trim() || item.answer.trim()
    );

    if (validItems.length === 0) {
      alert("질문/답변을 최소 1개 이상 입력해주세요.");
      return false;
    }

    for (const item of validItems) {
      if (!item.question.trim()) {
        alert("질문이 비어 있는 항목이 있어요.");
        return false;
      }

      if (!item.answer.trim()) {
        alert("답변이 비어 있는 항목이 있어요.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!faqId) return;

    try {
      setSaving(true);

      const faqItems = items
        .filter((item) => item.question.trim() && item.answer.trim())
        .map(
          (item, index) =>
            new FAQItemModel(
              item.id,
              item.question.trim(),
              item.answer.trim(),
              item.tagsText
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              Number.isFinite(Number(item.order)) ? Number(item.order) : index,
              item.isActive
            )
        );

      const payload = new FAQCategoryModel(
        faqId,
        label.trim(),
        Number.isFinite(Number(order)) ? Number(order) : 0,
        isActive,
        faqItems
      ).toMap();

      await updateDoc(doc(db, "faqCategories", faqId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });

      alert("FAQ가 수정되었어요.");
      router.push("/manager/faq");
    } catch (error) {
      alert("FAQ 저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  };

  if (checking || loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_42%,#f4f7fb_100%)] px-5 py-8 text-slate-900">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
            {checking ? "관리자 인증 확인 중..." : "FAQ 정보 불러오는 중..."}
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
            onClick={() => router.push("/manager/faq")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            FAQ 관리
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
            FAQ Editor
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            FAQ 수정
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            기존 FAQ 카테고리와 질문/답변을 수정할 수 있어요.
          </p>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                카테고리명
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="예: 제품 사용 / 충전 / 청소 / AS"
                className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                정렬 순서
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="0"
                className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Eye size={16} />
              사용
            </button>

            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                !isActive
                  ? "bg-slate-200 text-slate-700 ring-1 ring-slate-300"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <EyeOff size={16} />
              숨김
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-black tracking-[-0.03em] text-slate-900">
                질문 목록
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                질문, 답변, 태그를 수정해 주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
              }}
            >
              <Plus size={16} />
              질문 추가
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
                    <MessageCircleQuestion size={16} />
                    질문 {index + 1}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(item.id, "isActive", !item.isActive)
                      }
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      {item.isActive ? "사용" : "숨김"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                      삭제
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      질문
                    </label>
                    <input
                      value={item.question}
                      onChange={(e) =>
                        updateItem(item.id, "question", e.target.value)
                      }
                      placeholder="예: 제품이 충전되지 않아요."
                      className="h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      답변
                    </label>
                    <textarea
                      value={item.answer}
                      onChange={(e) =>
                        updateItem(item.id, "answer", e.target.value)
                      }
                      placeholder="예: 충전기 연결 상태, 충전 단자 오염 여부, 배터리 상태를 확인해 주세요."
                      rows={5}
                      className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        태그
                      </label>

                      <div className="flex items-center rounded-[18px] border border-slate-200 bg-white px-3">
                        <Hash size={16} className="shrink-0 text-slate-400" />
                        <input
                          value={item.tagsText}
                          onChange={(e) =>
                            updateItem(item.id, "tagsText", e.target.value)
                          }
                          placeholder="충전, 배터리, 전원"
                          className="h-12 w-full bg-transparent pl-3 pr-2 text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        쉼표(,)로 구분해서 입력
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        정렬 순서
                      </label>
                      <input
                        type="number"
                        value={item.order}
                        onChange={(e) =>
                          updateItem(item.id, "order", Number(e.target.value))
                        }
                        className="h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-[14px] text-slate-900 outline-none transition focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <h2 className="text-[22px] font-black tracking-[-0.03em] text-slate-900">
            미리보기
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            저장되면 대략 이런 느낌으로 보여요.
          </p>

          <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                FAQ 카테고리
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isActive ? "사용 중" : "숨김"}
              </span>
            </div>

            <h3 className="mt-3 text-[20px] font-black text-slate-900">
              {label.trim() || "카테고리명이 여기에 표시돼요"}
            </h3>

            <div className="mt-4 space-y-3">
              {parsedPreview
                .filter((item) => item.question.trim() || item.answer.trim())
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[18px] border border-slate-200 bg-white p-4"
                  >
                    <p className="text-[14px] font-bold text-slate-800">
                      Q. {item.question || "질문 내용"}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-slate-600">
                      {item.answer || "답변 내용"}
                    </p>

                    {!!item.tags.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <span
                            key={`${item.id}-${tag}-${index}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {parsedPreview.filter(
                (item) => item.question.trim() || item.answer.trim()
              ).length === 0 && (
                <div className="rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-semibold text-slate-400">
                  입력한 질문이 여기에 미리 보여요.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/manager/faq")}
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
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
            }}
          >
            <Save size={16} />
            {saving ? "저장 중..." : "FAQ 저장"}
          </button>
        </section>
      </div>
    </main>
  );
}