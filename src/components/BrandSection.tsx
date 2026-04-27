"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BrandModel } from "@/model/firebase/brand_model";

type Props = {
  onSelect: (brandName: string) => void;
};

export default function BrandSection({ onSelect }: Props) {
  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, "brands"), orderBy("priority", "asc"));
        const snapshot = await getDocs(q);

        const list = snapshot.docs
          .map((doc) => BrandModel.fromMap(doc.data(), doc.id))
          .filter((brand) => brand.isActive);

        setBrands(list);
      } catch (error) {
        console.error("브랜드 불러오기 실패:", error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="px-6 py-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-gray-400">BRAND</p>
          <h2 className="mt-1 text-2xl font-extrabold text-black">
            브랜드로 찾기
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-gray-50 px-5 py-6 text-center text-sm font-bold text-gray-400">
          브랜드를 불러오는 중입니다.
        </div>
      ) : brands.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 px-5 py-6 text-center text-sm font-bold text-gray-400">
          등록된 브랜드가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => onSelect(brand.name)}
              className="flex flex-col items-center justify-center py-3 transition active:scale-95"
            >
              {/* 아이콘 박스 */}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
                {brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="h-14 w-14 cursor-pointer object-contain"
                  />
                ) : (
                  <span className="text-3xl font-black text-gray-300">
                    {brand.name.slice(0, 1)}
                  </span>
                )}
              </div>

              {/* 브랜드 이름 */}
              <span className="mt-3 text-center text-sm font-semibold text-gray-800">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}