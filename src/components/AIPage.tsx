"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { PiRobot } from "react-icons/pi";
import { db } from "@/lib/firebase";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

type AIQuestion = {
  id: string;
  question: string;
  answer: string;
  parentId: string;
  order: number;
  isActive: boolean;
};

export default function AIPage({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [currentParentId, setCurrentParentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const visibleQuestions = useMemo(() => {
    return questions
      .filter((item) => item.isActive && item.parentId === currentParentId)
      .sort((a, b) => a.order - b.order);
  }, [questions, currentParentId]);

  const typeBotMessage = (text: string, speed = 18) => {
    let index = 0;
    let current = "";
    const id = Date.now() + Math.random();

    setMessages((prev) => [...prev, { id, sender: "bot", text: "" }]);

    const interval = setInterval(() => {
      current += text[index] ?? "";
      index++;

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: current } : m))
      );

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), sender: "user", text },
    ]);
  };

  const loadQuestions = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, "aiQuestions"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      const items: AIQuestion[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            question: data.question ?? "",
            answer: data.answer ?? "",
            parentId: data.parentId ?? "",
            order: data.order ?? 0,
            isActive: data.isActive ?? true,
          };
        })
        .filter((item) => item.question.trim() !== "");

      setQuestions(items);
    } catch (error) {
      console.error("AI 질문 불러오기 실패:", error);
      typeBotMessage("질문을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open || confirmOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open, confirmOpen]);

  useEffect(() => {
    if (!open) return;

    setMessages([]);
    setCurrentParentId("");
    setConfirmOpen(false);

    setTimeout(() => {
      typeBotMessage("안녕하세요 🙂");
    }, 200);

    setTimeout(() => {
      typeBotMessage("궁금한 질문을 선택해주세요.");
    }, 700);

    loadQuestions();
  }, [open]);

  const handleQuestion = (item: AIQuestion) => {
    addUserMessage(item.question);

    if (item.answer.trim()) {
      setTimeout(() => {
        typeBotMessage(item.answer);
      }, 250);
    }

    const children = questions.filter(
      (q) => q.isActive && q.parentId === item.id
    );

    if (children.length > 0) {
      setCurrentParentId(item.id);

      setTimeout(() => {
        typeBotMessage("추가로 궁금한 내용을 선택해주세요.");
      }, item.answer.trim() ? 900 : 300);
    }
  };

  const handleBackToFirst = () => {
    setCurrentParentId("");
    addUserMessage("처음 질문으로 돌아가기");

    setTimeout(() => {
      typeBotMessage("처음 질문 목록으로 돌아왔어요.");
    }, 200);
  };

  const handleAskClose = () => {
    setConfirmOpen(true);
  };

  const handleCancelClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed left-1/2 top-0 z-40 h-screen w-full max-w-[700px] -translate-x-1/2 bg-[#f5f5f5] transition-transform duration-500 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
              <PiRobot size={20} />
            </div>
            <span className="text-[17px] font-bold text-black">AI상담</span>
          </div>

          <button
            type="button"
            onClick={handleAskClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[22px] text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ✕
          </button>
        </header>

        <div className="h-[calc(100%-72px)] space-y-3 overflow-y-auto p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-[14px] leading-6 ${
                  m.sender === "user"
                    ? "bg-black text-white"
                    : "bg-white text-black shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          <div className="mt-4 flex flex-wrap gap-3">
            {loading ? (
              <div className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-500 shadow-sm">
                질문을 불러오는 중...
              </div>
            ) : (
              <>
                {currentParentId !== "" && (
                  <button
                    type="button"
                    onClick={handleBackToFirst}
                    className="flex cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-4 text-[14px] font-bold text-black shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                  >
                    처음 질문으로 돌아가기
                  </button>
                )}

                {visibleQuestions.length > 0 ? (
                  visibleQuestions.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuestion(item)}
                      className="flex min-w-[140px] max-w-[48%] cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 text-left text-black shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[13px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-[14px] font-bold leading-6">
                        {item.question}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-gray-500 shadow-sm">
                    표시할 질문이 없습니다.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        onClick={handleCancelClose}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[3px] transition duration-300 ${
          confirmOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-[61] w-[calc(100%-40px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition duration-300 ${
          confirmOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <h3 className="mt-4 text-center text-[20px] font-extrabold text-[#1f2937]">
          채팅을 종료할까요?
        </h3>

        <p className="mt-2 text-center text-[14px] leading-6 text-gray-500">
          진행 중인 도우봇 채팅이 종료됩니다.
          <br />
          정말 닫으시겠어요?
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCancelClose}
            className="flex h-[52px] cursor-pointer items-center justify-center rounded-[16px] bg-[#f3f4f6] text-[15px] font-bold text-gray-700 transition hover:bg-[#eaecef] active:scale-[0.98]"
          >
            계속하기
          </button>

          <button
            type="button"
            onClick={handleConfirmClose}
            className="flex h-[52px] cursor-pointer items-center justify-center rounded-[16px] bg-[#111827] text-[15px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            종료하기
          </button>
        </div>
      </div>
    </>
  );
}