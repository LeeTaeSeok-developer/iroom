"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { AIQuestionModel } from "@/model/firebase/ai_question_model";
import {
  ArrowLeft,
  LogOut,
  Plus,
  Save,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default function ManagerAIPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AIQuestionModel[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/manager/login");
        return;
      }

      setChecking(false);
      fetchItems();
    });

    return () => unsubscribe();
  }, [router]);

  const fetchItems = async () => {
    setLoading(true);

    const q = query(collection(db, "aiQuestions"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((item) =>
      AIQuestionModel.fromMap(item.data(), item.id)
    );

    setItems(data);
    setLoading(false);
  };

  const currentItems = useMemo(() => {
    return items
      .filter((item) => item.parentId === selectedParentId)
      .sort((a, b) => a.order - b.order);
  }, [items, selectedParentId]);

  const selectedParent = useMemo(() => {
    if (!selectedParentId) return null;
    return items.find((item) => item.id === selectedParentId) ?? null;
  }, [items, selectedParentId]);

  const childCountMap = useMemo(() => {
    const map: Record<string, number> = {};

    items.forEach((item) => {
      if (!item.parentId) return;
      map[item.parentId] = (map[item.parentId] ?? 0) + 1;
    });

    return map;
  }, [items]);

  const handleAdd = async () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    if (!answer.trim()) {
      alert("답변을 입력해주세요.");
      return;
    }

    const ref = await addDoc(collection(db, "aiQuestions"), {
      id: "",
      parentId: selectedParentId,
      question: question.trim(),
      answer: answer.trim(),
      order,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "aiQuestions", ref.id), {
      id: ref.id,
    });

    setQuestion("");
    setAnswer("");
    setOrder(0);
    await fetchItems();
  };

  const handleUpdate = async (item: AIQuestionModel) => {
    await updateDoc(doc(db, "aiQuestions", item.id), {
      parentId: item.parentId,
      question: item.question,
      answer: item.answer,
      order: item.order,
      isActive: item.isActive,
      updatedAt: serverTimestamp(),
    });

    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    const hasChildren = items.some((item) => item.parentId === id);

    if (hasChildren) {
      alert("하위 질문이 있는 질문은 먼저 하위 질문을 삭제해주세요.");
      return;
    }

    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;

    await deleteDoc(doc(db, "aiQuestions", id));
    await fetchItems();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/manager/login");
  };

  const handleBackDepth = () => {
    if (!selectedParent) {
      router.push("/manager");
      return;
    }

    setSelectedParentId(selectedParent.parentId);
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        관리자 인증 확인 중...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 text-slate-900">
      <div className="mx-auto max-w-[980px]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBackDepth}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm"
          >
            <ArrowLeft size={16} />
            {selectedParent ? "상위 질문으로" : "관리자 홈"}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        <section className="mt-7">
          <p className="text-sm font-bold text-blue-600">AI Question Tree</p>
          <h1 className="mt-2 text-[32px] font-black tracking-[-0.04em]">
            AI 상담 질문 관리
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            처음 질문은 parentId가 없는 질문이고, 질문을 누르면 그 질문의 하위
            질문을 관리할 수 있어요.
          </p>

          {selectedParent && (
            <div className="mt-4 rounded-[20px] border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold text-blue-600">현재 상위 질문</p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {selectedParent.question}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">질문 추가</h2>

          <div className="mt-4 grid gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                selectedParent
                  ? "하위 질문 입력 예: 전원이 안 켜져요"
                  : "처음 질문 입력 예: 어떤 도움이 필요하세요?"
              }
              className="h-12 rounded-[16px] border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="사용자가 이 질문을 눌렀을 때 AI가 보여줄 답변"
              rows={4}
              className="resize-none rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />

            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              placeholder="노출 순서"
              className="h-12 rounded-[16px] border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
            />

            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-4 text-sm font-bold text-slate-900 border border-slate-300 hover:bg-slate-200"
            >
              <Plus size={16} />
              질문 추가
            </button>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">
              {selectedParent ? "하위 질문 목록" : "처음 질문 목록"}
            </h2>
            <span className="text-sm font-bold text-slate-400">
              {currentItems.length}개
            </span>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
              불러오는 중...
            </div>
          ) : currentItems.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
              등록된 질문이 없어요.
            </div>
          ) : (
            <div className="grid gap-4">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-3">
                    <input
                      value={item.question}
                      onChange={(e) => {
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === item.id
                              ? x.copyWith({ question: e.target.value })
                              : x
                          )
                        );
                      }}
                      className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white"
                    />

                    <textarea
                      value={item.answer}
                      onChange={(e) => {
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === item.id
                              ? x.copyWith({ answer: e.target.value })
                              : x
                          )
                        );
                      }}
                      rows={3}
                      className="resize-none rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={item.order}
                        onChange={(e) => {
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === item.id
                                ? x.copyWith({ order: Number(e.target.value) })
                                : x
                            )
                          );
                        }}
                        className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
                      />

                      <select
                        value={item.isActive ? "true" : "false"}
                        onChange={(e) => {
                          setItems((prev) =>
                            prev.map((x) =>
                              x.id === item.id
                                ? x.copyWith({
                                    isActive: e.target.value === "true",
                                  })
                                : x
                            )
                          );
                        }}
                        className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
                      >
                        <option value="true">노출</option>
                        <option value="false">숨김</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(item)}
                        className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-blue-100 px-4 text-sm font-bold text-blue-700 border border-blue-300 hover:bg-blue-200"
                      >
                        <Save size={15} />
                        저장
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedParentId(item.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-slate-100 px-4 text-sm font-bold text-slate-900 border border-slate-300 hover:bg-slate-200"
                      >
                        하위 질문 관리
                        <ChevronRight size={15} />
                        {childCountMap[item.id] ? childCountMap[item.id] : 0}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-red-100 px-4 text-sm font-bold text-red-700 border border-red-300 hover:bg-red-200"
                      >
                        <Trash2 size={15} />
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