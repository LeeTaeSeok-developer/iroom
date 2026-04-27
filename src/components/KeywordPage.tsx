"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductModel } from "@/model/firebase/product_model";

type Props = {
  keyword?: string | null;
  brand?: string | null;
  onClose: () => void;
  onMenu: () => void;
  onQuestion: (itemName: string) => void;
  onManual: (itemName: string) => void;
};

const PRODUCT_COLLECTION = "products";

function cleanText(value: string) {
  return value.replaceAll("#", "").trim().toLowerCase();
}

function getHeaderTitle(keyword?: string | null, brand?: string | null) {
  if (brand) return brand;
  if (!keyword) return "";
  return keyword.replace("#", "").trim();
}

function KeywordItemCard({
  item,
  onManual,
  onQuestion,
}: {
  item: ProductModel;
  onManual: (item: ProductModel) => void;
  onQuestion: (item: ProductModel) => void;
}) {
  const mainHashtag =
    item.hashtag ||
    item.hashtags[0] ||
    item.category ||
    "제품";

  return (
    <article className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-blue-50 p-4 shadow-sm">
      <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
            이미지 없음
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="mb-2 inline-block w-fit rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600">
          {mainHashtag.replace("#", "").trim()}
        </div>

        <p className="text-xs font-medium text-gray-400">
          {item.brandName || "브랜드 없음"}
        </p>

        <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-snug text-black">
          {item.name}
        </h3>

        <div className="mt-4 flex gap-2">
          {item.manualEnabled && (
            <button
              type="button"
              onClick={() => onManual(item)}
              className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black active:scale-95"
            >
              메뉴얼
            </button>
          )}

          {item.questionEnabled && (
            <button
              type="button"
              onClick={() => onQuestion(item)}
              className="flex-1 cursor-pointer rounded-xl bg-black py-3 text-sm font-semibold text-white transition active:scale-95"
            >
              질문
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function KeywordPage({
  keyword = null,
  brand = null,
  onClose,
  onMenu,
  onQuestion,
  onManual,
}: Props) {
  const router = useRouter();

  const [displayTitle, setDisplayTitle] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(false);

  const openValue = brand ?? keyword;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const snapshot = await getDocs(collection(db, PRODUCT_COLLECTION));

        const items = snapshot.docs
          .map((doc) => ProductModel.fromMap(doc.data(), doc.id))
          .filter((item) => item.isActive)
          .sort((a, b) => a.name.localeCompare(b.name, "ko"));

        setProducts(items);
      } catch (error) {
        console.error("상품 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    let raf1 = 0;
    let raf2 = 0;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    if (openValue) {
      setDisplayTitle(openValue);
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

      closeTimer = setTimeout(() => {
        setDisplayTitle(null);
      }, 300);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (closeTimer) clearTimeout(closeTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [openValue]);

  const handleClose = () => {
    setVisible(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleManual = (item: ProductModel) => {
    onManual(item.name);
    router.push(`/manual/${encodeURIComponent(item.name)}`);
  };

  const items = useMemo(() => {
    if (brand) {
      return products.filter((item) => item.brandName === brand);
    }

    if (keyword) {
      const searchText = cleanText(keyword);

      return products.filter((item) => {
        const searchableTexts = [
          item.name,
          item.brandName,
          item.category,
          item.hashtag,
          ...item.hashtags,
          ...item.searchKeywords,
        ].map(cleanText);

        return searchableTexts.some((text) => text.includes(searchText));
      });
    }

    return [];
  }, [products, keyword, brand]);

  if (!displayTitle) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-center overflow-hidden">
      <div
        className={`h-screen w-full max-w-[700px] transform-gpu overflow-hidden bg-[#f7f7f7] transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-[100vw]"
        }`}
      >
        <header className="relative flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ←
          </button>

          <h2 className="absolute left-1/2 -translate-x-1/2 text-xl font-extrabold text-black">
            {getHeaderTitle(keyword, brand)}
          </h2>

          <button
            type="button"
            onClick={onMenu}
            className="z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          >
            ☰
          </button>
        </header>

        <div className="h-[calc(100vh-76px)] overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center">
              <p className="text-base font-semibold text-black">
                상품을 불러오는 중이에요
              </p>
            </div>
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-4 pb-8">
              {items.map((item) => (
                <KeywordItemCard
                  key={item.id}
                  item={item}
                  onManual={handleManual}
                  onQuestion={(product) => onQuestion(product.name)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
              <p className="text-base font-semibold text-black">
                표시할 상품이 없어요
              </p>
              <p className="mt-2 text-sm text-gray-500">
                해당 조건에 맞는 상품 데이터를 추가하면 여기에 보여요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}