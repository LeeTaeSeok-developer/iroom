"use client";

import { useEffect, useState } from "react";
import { Brush, Maximize2, Bed, Sparkles } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ManualEntryModel } from "@/model/firebase/manual_entry_model";
import { PolicyModel } from "@/model/firebase/policy_model";

type Props = {
  open: boolean;
  onClose: () => void;
  itemName: string;
  manual?: ManualEntryModel | null;
  onOpenAI?: () => void;
};

function getAccessoryIcon(title: string) {
  if (title.includes("틈새")) return <Maximize2 size={16} strokeWidth={1.8} />;
  if (title.includes("침구")) return <Bed size={16} strokeWidth={1.8} />;
  return <Brush size={16} strokeWidth={1.8} />;
}

function getAccessoryIconStyle(title: string) {
  if (title.includes("틈새")) return "bg-[#eefcf3] text-[#22c55e]";
  if (title.includes("침구")) return "bg-[#fff4f4] text-[#ef4444]";
  return "bg-[#eef4ff] text-[#2f63df]";
}

function SectionTitle({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f63df] shadow-sm">
          {icon ?? <Sparkles size={18} strokeWidth={1.8} />}
        </div>

        <div>
          <h3 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#1f2937]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[14px] text-[#6b7280]">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ManualDownloadPage({
  open,
  onClose,
  itemName,
  manual,
  onOpenAI,
}: Props) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [cautionPolicy, setCautionPolicy] = useState<PolicyModel | null>(null);
  const [warrantyPolicy, setWarrantyPolicy] = useState<PolicyModel | null>(null);

  const usageGuideItems = [...(manual?.usageGuides ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const consumableItems = [...(manual?.consumables ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const accessoryItems = [...(manual?.accessories ?? [])].sort(
    (a, b) => a.order - b.order
  );

  const faqItems = [...(manual?.faqs ?? [])].sort((a, b) => a.order - b.order);

  const specItems = [...(manual?.specs ?? [])].sort((a, b) => a.order - b.order);

  const componentImageUrl = manual?.componentImageUrl ?? "";
  const componentNotice =
    manual?.componentNotice || "등록된 구성품 안내 문구가 없습니다.";

  const cautionLines = cautionPolicy?.content
    ? cautionPolicy.content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const warrantyLines = warrantyPolicy?.content
    ? warrantyPolicy.content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!open) return;

      try {
        const [cautionSnap, warrantySnap] = await Promise.all([
          getDoc(doc(db, "policies", "caution")),
          getDoc(doc(db, "policies", "warranty")),
        ]);

        if (cautionSnap.exists()) {
          const data = PolicyModel.fromMap(cautionSnap.data(), cautionSnap.id);
          setCautionPolicy(data.isActive ? data : null);
        } else {
          setCautionPolicy(null);
        }

        if (warrantySnap.exists()) {
          const data = PolicyModel.fromMap(warrantySnap.data(), warrantySnap.id);
          setWarrantyPolicy(data.isActive ? data : null);
        } else {
          setWarrantyPolicy(null);
        }
      } catch (error) {
        console.error("정책 불러오기 실패:", error);
        setCautionPolicy(null);
        setWarrantyPolicy(null);
      }
    };

    fetchPolicies();
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[198] bg-black/30 transition duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed inset-0 z-[199] h-screen w-screen overflow-hidden bg-[#f5f7fb] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="sticky top-0 z-30 border-b border-black/5 bg-white/95 backdrop-blur">
            <header className="relative flex items-center justify-between px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
              >
                ←
              </button>

              <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-extrabold text-black sm:text-xl">
                매뉴얼 다운로드
              </h2>

              <div className="h-11 w-11" />
            </header>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-10">
              <section className="mb-6 rounded-[28px] bg-white px-5 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:px-7">
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#2f63df]">
                  IROOM MANUAL
                </p>
                <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-[#1f2937] sm:text-[34px]">
                  {itemName} 매뉴얼 통합 안내
                </h1>
                <p className="mt-3 max-w-[900px] text-[15px] leading-7 text-[#6b7280]">
                  사용 방법, 소모품 구매, 구성품 안내, 액세서리, 주의사항,
                  자주 묻는 질문, 제품 사양, 제품 보증 정보를 한 번에 확인할 수
                  있습니다.
                </p>
              </section>

              <div className="space-y-6">
                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="사용 방법" subtitle="기본 사용법과 관리 방법을 확인하세요." icon={<span>📘</span>} />

                  {usageGuideItems.length === 0 ? (
                    <p className="text-[14px] font-bold text-gray-400">등록된 사용 방법이 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {usageGuideItems.map((item) => (
                        <div key={item.id} className="rounded-[24px] bg-[#f8f9fc] p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
                          <h3 className="text-[19px] font-extrabold text-[#2f63df]">▷ {item.title}</h3>
                          <div className="mt-4 flex justify-center rounded-[20px] bg-white px-4 py-5">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="max-h-[240px] w-auto max-w-full object-contain" />
                            ) : (
                              <div className="py-16 text-[13px] font-bold text-gray-400">이미지 없음</div>
                            )}
                          </div>
                          <p className="mt-4 whitespace-pre-line text-[14px] leading-6 text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="소모품 구매" subtitle="원하시는 상품을 선택하시면 구매 페이지로 이동합니다." icon={<span>🛒</span>} />

                  {consumableItems.length === 0 ? (
                    <p className="text-[14px] font-bold text-gray-400">등록된 소모품이 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                      {consumableItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => item.url && window.open(item.url, "_blank")}
                          className="cursor-pointer overflow-hidden rounded-[22px] bg-[#f8f9fc] p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                        >
                          <div className="flex aspect-square items-center justify-center rounded-[18px] bg-white p-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <span className="text-[12px] font-bold text-gray-400">이미지 없음</span>
                            )}
                          </div>
                          <p className="mt-4 text-[15px] font-bold text-[#20242c]">{item.name}</p>
                          <div className="mt-3 flex h-[42px] w-full items-center justify-center rounded-[14px] bg-[#2f63df] text-[14px] font-bold text-white">
                            구매하기
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="구성품 안내" subtitle={`${itemName}의 구성품을 확인하세요.`} icon={<span>📦</span>} />

                  <div className="rounded-[26px] bg-[#f8f9fc] p-5">
                    <div className="flex justify-center">
                      <div className="w-full max-w-[600px] overflow-hidden rounded-[22px] p-2">
                        {componentImageUrl ? (
                          <img src={componentImageUrl} alt={`${itemName} 구성품`} className="mx-auto h-auto max-h-[600px] w-auto max-w-full object-contain" />
                        ) : (
                          <div className="py-20 text-center text-[14px] font-bold text-gray-400">
                            등록된 구성품 이미지가 없습니다.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 rounded-[18px] border border-[#dbe4ff] bg-[#eef4ff] px-4 py-4">
                      <p className="whitespace-pre-line text-[14px] leading-6 text-[#3558a8]">
                        {componentNotice}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="액세서리" subtitle="청소 환경에 맞는 액세서리를 확인하세요." icon={<Sparkles size={18} strokeWidth={1.8} />} />

                  {accessoryItems.length === 0 ? (
                    <p className="text-[14px] font-bold text-gray-400">등록된 액세서리가 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {accessoryItems.map((item) => (
                        <div key={item.id} className="rounded-[24px] bg-[#f8f9fc] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getAccessoryIconStyle(item.title)}`}>
                                {getAccessoryIcon(item.title)}
                              </div>
                              <h3 className="text-[18px] font-extrabold text-[#1f2937]">{item.title}</h3>
                            </div>

                            {item.separatePurchase ? (
                              <span className="shrink-0 rounded-full bg-[#fff4e8] px-3 py-1 text-[12px] font-bold text-[#e38b1a]">
                                별도구매
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-4 flex justify-center">
                            <div className="aspect-square w-full max-w-[220px] overflow-hidden rounded-[20px] bg-white p-3">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[13px] font-bold text-gray-400">
                                  이미지 없음
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="mt-4 whitespace-pre-line text-[14px] leading-6 text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="주의사항" subtitle="제품을 안전하게 사용하기 위해 아래 내용을 확인해 주세요." icon={<span>⚠️</span>} />

                  <div className="rounded-[24px] bg-[#fff7f7] p-5">
                    <h3 className="text-[20px] font-extrabold text-red-500">
                      {cautionPolicy?.title || "주의사항 안내"}
                    </h3>

                    {cautionLines.length === 0 ? (
                      <p className="mt-4 text-[14px] text-gray-400">등록된 주의사항이 없습니다.</p>
                    ) : (
                      <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-4">
                        <div className="space-y-3">
                          {cautionLines.map((text, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="mt-[3px] text-[12px] font-bold text-red-500">●</span>
                              <p className="text-[14px] leading-6 text-red-700">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="자주 묻는 질문" subtitle="궁금하신 점을 빠르게 확인해보세요." icon={<span>❓</span>} />

                  {faqItems.length === 0 ? (
                    <p className="text-[14px] font-bold text-gray-400">등록된 FAQ가 없습니다.</p>
                  ) : (
                    <div className="space-y-4">
                      {faqItems.map((item, index) => {
                        const isOpen = openedIndex === index;

                        return (
                          <div key={item.id} className="overflow-hidden rounded-[20px] border border-black/5 bg-[#f8f9fc]">
                            <button
                              type="button"
                              onClick={() => setOpenedIndex(isOpen ? null : index)}
                              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left"
                            >
                              <p className="text-[14px] font-bold leading-[1.6] text-[#2b2f38]">
                                <span className="mr-1 text-[#2f63df]">Q.</span>
                                {item.question}
                              </p>
                              <span className={`shrink-0 text-[18px] text-gray-400 transition ${isOpen ? "rotate-180" : ""}`}>
                                ˅
                              </span>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
                              <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                                <p className="whitespace-pre-line text-[14px] leading-6 text-gray-600">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 rounded-[24px] bg-gradient-to-br from-[#23395f] via-[#1d2e4f] to-[#162338] px-5 py-6 text-center text-white">
                    <p className="text-[13px] text-white/65">문제가 해결되지 않으셨나요?</p>
                    <h4 className="mt-2 text-[18px] font-extrabold">AI 상담으로 빠르게 해결하세요!</h4>
                    <button
                      type="button"
                      onClick={onOpenAI}
                      className="mt-5 flex h-[56px] w-full cursor-pointer items-center justify-center rounded-[16px] bg-[#2f63df] text-[16px] font-bold text-white"
                    >
                      도우봇과 채팅 상담 시작하기
                    </button>
                  </div>
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="제품 사양" subtitle="제품의 주요 스펙 정보를 확인하세요." icon={<span>📄</span>} />

                  {specItems.length === 0 ? (
                    <p className="text-[14px] font-bold text-gray-400">등록된 제품 사양이 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {specItems.map((section) => (
                        <div key={section.id} className="rounded-[20px] bg-[#f8f9fc] p-4">
                          <h3 className="mb-3 text-[16px] font-extrabold text-[#2f63df]">
                            ⚡ {section.title}
                          </h3>

                          <div className="divide-y divide-gray-200">
                            {section.data.map((item, index) => (
                              <div key={index} className="flex items-start justify-between gap-4 py-3 text-[13px]">
                                <span className="shrink-0 text-gray-400">{item.label}</span>
                                <span className="max-w-[65%] text-right font-medium text-gray-700">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[30px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] sm:p-7">
                  <SectionTitle title="제품 보증" subtitle="A/S 및 보증 관련 내용을 확인하세요." icon={<span>🛡️</span>} />

                  <div className="rounded-[24px] bg-[#f8f9fc] p-5">
                    <h3 className="flex items-center gap-3 font-extrabold text-blue-600">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        🛡️
                      </span>
                      {warrantyPolicy?.title || "제품 보증 안내"}
                    </h3>

                    {warrantyLines.length === 0 ? (
                      <p className="mt-4 text-[14px] text-gray-400">등록된 제품 보증 정보가 없습니다.</p>
                    ) : (
                      <ul className="mt-4 space-y-2">
                        {warrantyLines.map((desc, i) => (
                          <li key={i} className="flex items-start gap-2 text-[14px] text-gray-600">
                            <span className="mt-[6px] h-[6px] w-[6px] rounded-full bg-gray-400" />
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}