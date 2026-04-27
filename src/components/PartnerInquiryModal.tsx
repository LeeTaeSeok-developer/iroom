"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PartnerInquiryModal({ open, onClose }: Props) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <>
      {/* 배경 */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[79] bg-black/60 backdrop-blur-[6px] transition duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* 팝업 */}
      <div
        className={`fixed inset-0 z-[80] flex items-center justify-center px-5 transition duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`relative w-full max-w-[360px] overflow-hidden rounded-[24px] border border-white/12 bg-[#07152d] shadow-[0_20px_80px_rgba(0,0,0,0.55)] transition duration-300 sm:max-w-[430px] ${
            open ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
          }`}
        >
          {/* 배경 그라데이션 */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,160,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(55,120,255,0.16),transparent_32%),linear-gradient(180deg,#243247_0%,#08142b_58%,#031024_100%)]" />

          {/* 은은한 테두리 광 */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/6" />

          <div className="relative px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-8">
            {/* 헤더 */}
            <div className="mb-5 text-center sm:mb-7">
              <h2 className="text-[16px] font-extrabold tracking-[-0.02em] text-white sm:text-[18px]">
                제휴 및 협력 문의
              </h2>

              <p className="mt-3 text-[13px] leading-6 text-white/58 sm:mt-4 sm:text-[15px] sm:leading-7">
                함께 성장할 파트너를 기다립니다.
                <br />
                내용을 작성하시면 담당자에게 전달됩니다.
              </p>
            </div>

            {/* 입력 영역 */}
            <div className="flex flex-col gap-4 sm:gap-5">
              <Field
                label="성함 / 업체명"
                placeholder="문의하시는 분 성함 또는 회사명을 입력해주세요."
              />
              <Field
                label="연락처 / 이메일"
                placeholder="답변 받으실 연락처를 입력해주세요."
              />
              <Field
                label="문의 제목"
                placeholder="문의하실 내용을 요약해주세요."
              />
              <Field
                label="상세 내용"
                placeholder="제휴 내용, 협력 제안 등을 상세히 적어주시면 빠른 확인이 가능합니다."
                textarea
              />
            </div>

            {/* 버튼 */}
            <div className="mt-6 sm:mt-8">
              <button
                type="button"
                className="w-full rounded-[15px] bg-[linear-gradient(135deg,#5ea2ff_0%,#3f7dff_42%,#315dff_70%,#5a49ff_100%)] py-3.5 text-[14px] font-extrabold text-white shadow-[0_10px_30px_rgba(60,110,255,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:rounded-[18px] sm:py-4 sm:text-[16px]"
              >
                전송하기
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full py-1.5 text-[14px] font-semibold text-white/38 transition hover:text-white/65 sm:mt-5 sm:py-2 sm:text-[15px]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  placeholder,
  textarea = false,
}: {
  label: string;
  placeholder: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold text-white/75 sm:text-[15px]">
        {label}
      </label>

      {textarea ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          className="w-full resize-none rounded-[15px] border border-white/14 bg-white/[0.07] px-4 py-3.5 text-[13px] leading-6 text-white placeholder:text-white/28 outline-none backdrop-blur-sm transition focus:border-[#6ba2ff] focus:bg-white/[0.10] focus:shadow-[0_0_0_3px_rgba(70,120,255,0.14)] sm:rounded-[18px] sm:px-5 sm:py-4 sm:text-[15px] sm:leading-7"
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          className="h-[46px] w-full rounded-[15px] border border-white/14 bg-white/[0.07] px-4 text-[13px] text-white placeholder:text-white/28 outline-none backdrop-blur-sm transition focus:border-[#6ba2ff] focus:bg-white/[0.10] focus:shadow-[0_0_0_3px_rgba(70,120,255,0.14)] sm:h-[52px] sm:rounded-[18px] sm:px-5 sm:text-[15px]"
        />
      )}
    </div>
  );
}