"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { BrandModel } from "@/model/firebase/brand_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Search,
  Plus,
  ChevronRight,
  ImageIcon,
  Trash2,
} from "lucide-react";

export default function ManagerBrandsPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError("");

      const q = query(collection(db, "brands"), orderBy("priority", "asc"));
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((doc) =>
        BrandModel.fromMap(doc.data(), doc.id)
      );

      setBrands(items);
    } catch (err) {
      console.error("브랜드 불러오기 실패:", err);
      setError("브랜드 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/manager/login");
        return;
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!checking) {
      fetchBrands();
    }
  }, [checking]);

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return brands;

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(keyword)
    );
  }, [brands, search]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/manager/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(`'${name}' 브랜드를 삭제하시겠습니까?`);
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, "brands", id));
      await fetchBrands();
    } catch (err) {
      console.error("브랜드 삭제 실패:", err);
      setError("브랜드 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_42%,#f4f7fb_100%)] px-5 py-8 text-slate-900">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
            관리자 인증 확인 중...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden px-5 pb-10 pt-5 sm:px-6"
      style={{
        background:
          "linear-gradient(180deg, #eef6ff 0%, #f8fbff 42%, #f4f7fb 100%)",
        color: "#0f172a",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-16 top-[-10px] h-52 w-52 rounded-full blur-3xl"
          style={{ background: "rgba(96, 165, 250, 0.18)" }}
        />
        <div
          className="absolute right-[-30px] top-[120px] h-56 w-56 rounded-full blur-3xl"
          style={{ background: "rgba(125, 211, 252, 0.16)" }}
        />
        <div
          className="absolute left-1/2 top-[320px] h-40 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "rgba(191, 219, 254, 0.18)" }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/manager")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            관리자 홈
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        <section className="mt-7">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-[0.18em] uppercase"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            }}
          >
            <ShieldCheck size={14} />
            Brand Manager
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            브랜드 관리
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            브랜드를 검색하고, 생성하고, 수정하거나 삭제할 수 있어요.
          </p>
        </section>

        <section className="mt-7">
          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="브랜드명을 검색하세요"
                className="h-14 w-full rounded-[22px] border border-slate-200 bg-slate-50 pl-12 pr-4 text-[15px] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => router.push("/manager/brands/create")}
              className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-[22px] text-[15px] font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 18px 34px rgba(37,99,235,0.24)",
              }}
            >
              <Plus size={18} />
              생성하기
            </button>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  브랜드 목록을 불러오는 중...
                </div>
              ) : error ? (
                <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-8 text-center text-sm font-semibold text-red-500">
                  {error}
                </div>
              ) : filteredBrands.length === 0 ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/manager/brands/${brand.id}`)}
                      className="group flex min-w-0 flex-1 items-center gap-4 text-left"
                    >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center p-1 rounded-[20px] border border-slate-200 bg-slate-50">
                    {brand.imageUrl ? (
                        <img
                        src={brand.imageUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain"
                        />
                    ) : (
                        <ImageIcon size={24} className="text-slate-300" />
                    )}
                    </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[16px] font-black tracking-[-0.03em] text-slate-900">
                          {brand.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[12px]">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 font-bold ${
                              brand.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {brand.isActive ? "활성" : "비활성"}
                          </span>
                          <span className="text-slate-400">
                            priority {brand.priority}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(brand.id, brand.name)}
                      disabled={deletingId === brand.id}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-60"
                      aria-label={`${brand.name} 삭제`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}