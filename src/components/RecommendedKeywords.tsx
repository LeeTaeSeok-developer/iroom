"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { RecommendedKeywordModel } from "../model/firebase/recommended_keyword_model";

type Props = {
  onSelect: (keyword: string) => void;
};

export default function RecommendedKeywords({ onSelect }: Props) {
  const [keywords, setKeywords] = useState<RecommendedKeywordModel[]>([]);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const q = query(
          collection(db, "recommendedKeywords"),
          orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);

        const items = snapshot.docs
          .map((doc) => RecommendedKeywordModel.fromMap(doc.data(), doc.id))
          .filter((item) => item.isActive && item.keyword.trim() !== "");

        setKeywords(items);
      } catch (error) {
        console.error("추천검색어 불러오기 실패:", error);
      }
    };

    fetchKeywords();
  }, []);

  if (keywords.length === 0) return null;

  return (
    <section className="px-6 pt-2">
      <div className="flex items-center gap-2">
        <p className="whitespace-nowrap text-sm font-bold text-gray-700">
          추천검색어
        </p>

        <div className="flex flex-wrap gap-2">
          {keywords.map((item) => {
            const keyword = item.keyword.startsWith("#")
              ? item.keyword
              : `# ${item.keyword}`;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(keyword)}
                className="cursor-pointer rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-500 shadow-sm transition hover:border-black hover:text-black active:scale-95"
              >
                {keyword}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}