"use client";

import { FiSearch } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { ProductModel } from "../model/firebase/product_model";

type Props = {
  onSearch: (keyword: string) => void;
};

export default function HeroSection({ onSearch }: Props) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductModel[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const items = snapshot.docs
          .map((doc) => ProductModel.fromMap(doc.data(), doc.id))
          .filter((item) => item.isActive);

        setProducts(items);
      } catch (error) {
        console.error("HeroSection 제품 불러오기 실패:", error);
      }
    };

    fetchProducts();
  }, []);

  const recommendKeywords = useMemo(() => {
    const words = products.flatMap((product) => [
      product.name,
      product.brandName,
      product.category,
      product.hashtag,
      ...product.hashtags,
      ...product.searchKeywords,
    ]);

    return Array.from(
      new Set(
        words
          .map((word) => word?.trim())
          .filter((word): word is string => Boolean(word))
      )
    ).slice(0, 6);
  }, [products]);

  const placeholder = "제품을 검색해 보세요";

  const handleSearch = (value: string) => {
    const keyword = value.trim();
    if (!keyword) return;
    onSearch(keyword);
  };

  return (
    <section className="bg-[#f7f7f7] px-6 py-8 text-center">
      <h2 className="text-[30px] font-extrabold leading-snug">
        고객지원센터
      </h2>

      <p className="mt-2 text-base font-semibold text-gray-500">
        무엇을 도와드릴까요?
      </p>

      <div className="relative mt-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 drop-shadow-sm">
          <FiSearch size={20} />
        </span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(search);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border-2 border-black bg-white py-4 pl-12 pr-4 text-lg outline-none shadow-md transition focus:border-black focus:shadow-lg placeholder:text-gray-400"
        />
      </div>
    </section>
  );
}