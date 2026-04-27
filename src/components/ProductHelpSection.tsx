"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductModel } from "@/model/firebase/product_model";

type Props = {
  onSelect: (hashtag: string) => void;
};

type CategoryGroup = {
  name: string;
  hashtags: string[];
};

export default function ProductHelpSection({ onSelect }: Props) {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "products"), orderBy("category", "asc"));
        const snapshot = await getDocs(q);

        const list = snapshot.docs
          .map((doc) => ProductModel.fromMap(doc.data(), doc.id))
          .filter((product) => product.isActive);

        setProducts(list);
      } catch (error) {
        console.error("상품 카테고리 불러오기 실패:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, Set<string>>();

    products.forEach((product) => {
      const category = product.category.trim();
      const hashtag = product.hashtag.replaceAll("#", "").trim();

      if (!category || !hashtag) return;

      if (!map.has(category)) {
        map.set(category, new Set<string>());
      }

      map.get(category)?.add(hashtag);
    });

    return Array.from(map.entries()).map(([name, hashtagSet]) => ({
      name,
      hashtags: Array.from(hashtagSet),
    }));
  }, [products]);

  return (
    <section className="px-6 py-8">
      <div className="mb-5">
        <p className="text-sm font-bold text-gray-400">PRODUCT</p>
        <h2 className="mt-1 text-2xl font-extrabold text-black">
          상품으로 찾기
        </h2>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white px-5 py-6 text-center text-sm font-bold text-gray-400 shadow-sm">
          상품 카테고리를 불러오는 중입니다.
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl bg-white px-5 py-6 text-center text-sm font-bold text-gray-400 shadow-sm">
          등록된 상품 카테고리가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const isOpen = openCategory === category.name;

            return (
              <div
                key={category.name}
                className="overflow-hidden rounded-[28px] bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategory((prev) =>
                      prev === category.name ? null : category.name
                    )
                  }
                  className="flex w-full items-center justify-between px-5 py-5 text-left active:scale-[0.99]"
                >
                  <span className="text-base font-extrabold text-black">
                    {category.name}
                  </span>

                  <span
                    className={`text-lg text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 px-5 pb-5 pt-4">
                      {category.hashtags.map((hashtag) => (
                        <button
                          key={`${category.name}-${hashtag}`}
                          type="button"
                          onClick={() => onSelect(hashtag)}
                          className="cursor-pointer rounded-2xl bg-[#f7f7f7] px-4 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-100 active:scale-95"
                        >
                          #{hashtag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}