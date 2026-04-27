"use client";

import { PiRobot } from "react-icons/pi";

type Props = {
  onClick: () => void;
};

export default function SmartConsultCard({ onClick }: Props) {
  return (
    <section className="px-6 pt-4">
      <button
        type="button"
        onClick={onClick}
        className="w-full cursor-pointer overflow-hidden rounded-[34px] 
        bg-gradient-to-b from-[#3a3a3a] to-[#111111]
        px-6 py-10 text-white 
        shadow-[0_12px_30px_rgba(0,0,0,0.35)]
        transition active:scale-[0.98]"
      >
        <div className="flex flex-col items-center justify-center">
          
          {/* 움직이는 아이콘 */}
          <div className="smart-bot-float mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-[22px] 
          border border-white/10 bg-white/5 backdrop-blur-sm">
            <PiRobot size={34} className="text-white" />
          </div>

          <h3 className="text-[28px] font-extrabold leading-none">
            Chat Bot 스마트 상담
          </h3>

          <p className="mt-4 text-[15px] text-gray-300">
            궁금한 점을 물어보시면 도와이 답변해 드립니다.
          </p>

          <div className="mt-8 inline-flex min-w-[230px] items-center justify-center gap-2 
          rounded-[20px] bg-white px-6 py-3 text-[16px] font-bold text-black">
            <span>상담 시작하기</span>
            <span className="text-[20px]">›</span>
          </div>

        </div>
      </button>
    </section>
  );
}