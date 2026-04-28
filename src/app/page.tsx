"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDevice } from "../lib/useDevice";
import SideMenu from "../components/SideMenu";
import RecommendedKeywords from "../components/RecommendedKeywords";
import KeywordPage from "../components/KeywordPage";
import SmartConsultCard from "../components/SmartConsultCard";
import FAQSection from "../components/FAQSection";
import AIPage from "../components/AIPage";
import FAQPage from "../components/FAQPage";
import ProductHelpSection from "../components/ProductHelpSection";
import BrandSection from "../components/BrandSection";
import InfoSection from "../components/InfoSection";
import PolicyPage from "../components/PolicyPage";
import PartnerInquiryModal from "../components/PartnerInquiryModal";
import StoreShortcutModal from "../components/StoreShortcutModal";
import ItemQuestionPage from "../components/ItemQuestionPage";
import HeroSection from "../components/HeroSection";
import FloatingActionButtons from "../components/FloatingActionButtons";

export default function Home() {



  const router = useRouter();
  const device = useDevice();

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [policyType, setPolicyType] = useState<"as" | "return" | null>(null);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [selectedQuestionItem, setSelectedQuestionItem] = useState<string | null>(null);
  const [selectedManualItem, setSelectedManualItem] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen bg-[#f7f7f7] text-black">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-white/95 px-6 py-4 backdrop-blur">
        <img
          src="brands\iroom.png"
          alt="IROOM"
          className="h-11 w-auto object-contain"
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
        >
          ☰
        </button>
      </header>

      <HeroSection
        onSearch={(value) => {
          setBrand(null);
          setKeyword(value.trim());
        }}
      />
      

      <RecommendedKeywords
        onSelect={(selectedKeyword) => {
          setBrand(null);
          setKeyword(selectedKeyword);
        }}
      />

      <SmartConsultCard onClick={() => setAiOpen(true)} />

      <FAQSection onMore={() => setFaqOpen(true)} />

      <SideMenu
        open={open}
        onClose={() => setOpen(false)}
        onOpenAI={() => setAiOpen(true)}
        onOpenFAQ={() => setFaqOpen(true)}
        onScrollToBrand={() => {
          document.getElementById("brand-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        onScrollToProduct={() => {
          document.getElementById("product-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        onOpenAS={() => setPolicyType("as")}
        onOpenReturn={() => setPolicyType("return")}
        onOpenPartner={() => setPartnerOpen(true)}
        onOpenStore={() => setStoreOpen(true)}
        onOpenAdminLogin={() => {
          setOpen(false);
          router.push("/manager/login");
        }}
      />

      <KeywordPage
        keyword={keyword}
        brand={brand}
        onClose={() => {
          setKeyword(null);
          setBrand(null);
        }}
        onMenu={() => setOpen(true)}
        onQuestion={(itemName) => setSelectedQuestionItem(itemName)}
        onManual={(itemName: string) => setSelectedManualItem(itemName)}
      />

      {/*검색하면 나오는 제품에서 질문 누르면 나오는 페이지 */}
      <ItemQuestionPage
        itemName={selectedQuestionItem}
        onClose={() => setSelectedQuestionItem(null)}
        onMenu={() => setOpen(true)}
      />

      <AIPage open={aiOpen} onClose={() => setAiOpen(false)} />

      {/*자주묻는 질문 더보기에 들어가면 나오는 페이지 */}
      <FAQPage
        open={faqOpen}
        onClose={() => setFaqOpen(false)}
        onMenu={() => setOpen(true)}
      />

      {/*브랜드로 상품찾기 부분 */}
      <div id="brand-section">
        <BrandSection
          onSelect={(selectedBrand) => {
            setKeyword(null);
            setBrand(selectedBrand);
          }}
        />
      </div>

      {/*도움이 필요한 상품을 선택하세요 섹션 */}
      <div id="product-section">
        <ProductHelpSection
          onSelect={(item) => {
            setBrand(null);
            setKeyword(`# ${item}`);
          }}
        />
      </div>

      {/*맨아래 4개의 버튼이 있는 부분 */}
      <InfoSection
        onOpenAsPolicy={() => setPolicyType("as")}
        onOpenReturnPolicy={() => setPolicyType("return")}
        onOpenPartnerInquiry={() => setPartnerOpen(true)}
        onOpenStoreShortcut={() => setStoreOpen(true)}
      />

      {/*맨아래 AS누르면 나오는 페이지 */}
      <PolicyPage type={policyType} onClose={() => setPolicyType(null)} />

      {/*제휴 문의 팝업 */}
      <PartnerInquiryModal
        open={partnerOpen}
        onClose={() => setPartnerOpen(false)}
      />

      {/*공식 사이트 팝업 */}
      <StoreShortcutModal
        open={storeOpen}
        onClose={() => setStoreOpen(false)}
      />

      <div className="fixed bottom-2 right-2 z-[10000] rounded bg-white/90 px-2 py-1 text-xs text-gray-500 shadow">
        {device}
      </div>

      {/*오른쪽 동그라미 버튼 2개 섹션*/}
      <FloatingActionButtons />
    </main>
  );
}