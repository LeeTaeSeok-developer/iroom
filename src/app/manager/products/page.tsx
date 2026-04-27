"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ProductModel } from "@/model/firebase/product_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Search,
  Plus,
  ChevronRight,
  ImageIcon,
  Trash2,
  PackageSearch,
  Tag,
  FolderKanban,
  BookOpen,
  MessageCircleQuestion,
} from "lucide-react";


export default function ManagerProductsPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductModel[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/manager/login");
        return;
      }

      try {
        const adminRef = doc(db, "admin_users", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists() || adminSnap.data().role !== "manager") {
          await signOut(auth);
          router.replace("/manager/login");
          return;
        }

        setChecking(false);
        loadProducts();
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "products"));

      const items = snapshot.docs
        .map((item) => ProductModel.fromMap(item.data(), item.id))
        .sort((a, b) => {
          const brandCompare = (a.brandName ?? "").localeCompare(
            b.brandName ?? "",
            "ko"
          );
          if (brandCompare !== 0) return brandCompare;

          const nameCompare = (a.name ?? "").localeCompare(
            b.name ?? "",
            "ko"
          );
          if (nameCompare !== 0) return nameCompare;

          return (a.category ?? "").localeCompare(b.category ?? "", "ko");
        });

      setProducts(items);
    } catch (error) {
      alert("제품 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/manager/login");
    } catch (error) {
      alert("로그아웃 중 오류가 발생했어요.");
    }
  };

  const handleDelete = async (product: ProductModel) => {
    const ok = window.confirm(
      `'${product.name}' 제품을 삭제할까요?\n삭제 후 되돌릴 수 없어요.`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "products", product.id));
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (error) {
      alert("제품 삭제 중 오류가 발생했어요.");
    }
  };

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((item) => {
      const joined = [
        item.name,
        item.brandName,
        item.category,
        item.hashtag,
        ...(item.hashtags ?? []),
        ...(item.searchKeywords ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return joined.includes(keyword);
    });
  }, [products, search]);

  const activeCount = products.filter((item) => item.isActive).length;
  const manualEnabledCount = products.filter((item) => item.manualEnabled).length;
  const questionEnabledCount = products.filter(
    (item) => item.questionEnabled
  ).length;

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
            Product Manager
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            제품 관리
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            제품 정보, 카테고리, 검색 키워드, 매뉴얼/문의 노출 여부를 관리할 수 있어요.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">전체 제품</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {products.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">사용 중</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">검색 결과</p>
            <p className="mt-2 text-[26px] font-black text-slate-900">
              {filteredProducts.length}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[360px]">
            <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제품명, 브랜드명, 해시태그, 카테고리 검색"
                className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 pl-12 pr-4 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadProducts}
                className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                새로고침
              </button>

              <button
                type="button"
                onClick={() => router.push("/manager/products/new")}
                className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
                }}
              >
                <Plus size={16} />
                제품 추가
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              <BookOpen size={14} />
              매뉴얼 사용 {manualEnabledCount}개
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              <MessageCircleQuestion size={14} />
              문의 사용 {questionEnabledCount}개
            </div>
          </div>
        </section>

        <section className="mt-5">
          {loading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
              제품 목록 불러오는 중...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <PackageSearch size={24} />
              </div>
              <p className="mt-4 text-[16px] font-bold text-slate-800">
                표시할 제품이 없어요
              </p>
              <p className="mt-2 text-sm text-slate-500">
                검색어를 바꾸거나 새 제품을 추가해보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_52px_rgba(15,23,42,0.10)] sm:p-5"
                >
                  <div className="flex gap-4">
                    <div
                    className="flex shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50"
                    style={{ width: "180px", height: "180px" }}
                    >
                    {product.imageUrl ? (
                        <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-contain"
                        style={{ width: "180px", height: "180px" }}
                        />
                    ) : (
                        <ImageIcon size={20} className="text-slate-300" />
                    )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                              {product.brandName || "브랜드 없음"}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                product.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {product.isActive ? "사용 중" : "숨김"}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                product.manualEnabled
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              매뉴얼 {product.manualEnabled ? "ON" : "OFF"}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                product.questionEnabled
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              문의 {product.questionEnabled ? "ON" : "OFF"}
                            </span>
                          </div>

                          <h2 className="mt-3 truncate text-[20px] font-black tracking-[-0.03em] text-slate-900">
                            {product.name || "이름 없는 제품"}
                          </h2>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            {product.category && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-medium">
                                <FolderKanban size={13} />
                                {product.category}
                              </span>
                            )}

                            {product.hashtag && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-medium">
                                <Tag size={13} />
                                {product.hashtag}
                              </span>
                            )}
                          </div>

                          {!!product.hashtags?.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {product.hashtags.slice(0, 6).map((tag, index) => (
                                <span
                                  key={`${product.id}-${tag}-${index}`}
                                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                                >
                                  #{tag.replace(/^#\s*/, "").replace(/^#/, "")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/manager/products/${product.id}`)
                            }
                            className="inline-flex items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            수정
                            <ChevronRight size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            className="inline-flex items-center gap-2 rounded-[16px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}