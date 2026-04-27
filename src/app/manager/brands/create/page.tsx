"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { uploadImage } from "@/lib/uploadImage";
import { BrandModel } from "@/model/firebase/brand_model";
import {
  ArrowLeft,
  ShieldCheck,
  Save,
  ImageIcon,
  Type,
  Hash,
  Upload,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function ManagerBrandCreatePage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [priority, setPriority] = useState("0");
  const [isActive, setIsActive] = useState(true);

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

  const previewName = useMemo(() => {
    return name.trim() || "브랜드 이름 미리보기";
  }, [name]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("브랜드 이름을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      let uploadedImageUrl = imageUrl.trim();

      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile, "brands");
      }

      const brandRef = doc(collection(db, "brands"));

      const brand = new BrandModel(
        brandRef.id,
        name.trim(),
        uploadedImageUrl,
        Number(priority) || 0,
        isActive
      );

      await setDoc(brandRef, brand.toMap());

      router.push("/manager/brands");
    } catch (err) {
      console.error("브랜드 생성 실패:", err);
      setError("브랜드 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_45%,#f4f7fb_100%)] px-5 py-8 text-slate-900">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm font-bold text-slate-600 shadow-sm">
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
        <div className="absolute -left-16 top-[-10px] h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-[-30px] top-[120px] h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute left-1/2 top-[320px] h-40 w-80 -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/manager/brands")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
        >
          <ArrowLeft size={16} />
          브랜드 목록
        </button>

        <section className="mt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
            <ShieldCheck size={14} />
            Brand Create
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            브랜드 생성
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            브랜드명, 이미지, 정렬 순서를 입력하고 저장할 수 있어요.
          </p>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  브랜드 이름
                </label>
                <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white">
                  <Type size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 아이룸"
                    className="h-14 w-full bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  브랜드 이미지
                </label>

                <label className="group flex cursor-pointer items-center gap-4 rounded-[24px] border border-dashed border-blue-200 bg-blue-50/50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white text-blue-600 shadow-sm">
                    <Upload size={20} />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setImageFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                      setImageUrl("");
                    }}
                    className="hidden"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-black text-slate-800">
                      {imageFile ? imageFile.name : "컴퓨터에서 이미지 선택"}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-slate-500">
                      PNG, JPG, WEBP 이미지를 업로드할 수 있어요.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  정렬 순서
                </label>
                <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-400 focus-within:bg-white">
                  <Hash size={18} className="text-slate-400" />
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="0"
                    className="h-14 w-full bg-transparent text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div
                style={{
                  backgroundColor: isActive ? "#16a34a" : "#dc2626",
                  borderColor: isActive ? "#15803d" : "#b91c1c",
                }}
                className="flex items-center justify-between rounded-[24px] border px-4 py-5 my-6 transition"
              >
                <div>
                  <p className="text-[15px] font-black text-slate-900">
                    사용 여부
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-slate-500">
                    비활성화하면 사용자 화면에서 숨길 수 있어요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white transition active:scale-[0.98] ${
                    isActive ? "bg-blue-600" : "bg-slate-400"
                  }`}
                >
                  {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  {isActive ? "ON" : "OFF"}
                </button>
              </div>

              {error && (
                <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] text-[15px] font-black text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 18px 34px rgba(37,99,235,0.24)",
                }}
              >
                <Save size={18} />
                {loading ? "저장 중..." : "브랜드 생성"}
              </button>
            </form>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
            <div className="flex items-center gap-2">
              <Eye size={17} className="text-blue-600" />
              <p className="text-[14px] font-black text-slate-700">미리보기</p>
            </div>

            <div className="mt-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex w-full items-center gap-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-left shadow-sm">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                  {previewUrl || imageUrl.trim() ? (
                    <img
                      src={previewUrl || imageUrl}
                      alt={previewName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={28} className="text-slate-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[18px] font-black tracking-[-0.03em] text-slate-900">
                    {previewName}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-slate-500">
                    priority: {Number(priority) || 0}
                  </div>

                  <div
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-[12px] font-black ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isActive ? "사용 중" : "숨김"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-blue-100 bg-blue-50 px-4 py-4">
              <p className="text-[13px] font-bold leading-6 text-blue-700">
                저장하면 선택한 이미지는 Firebase Storage의 brands 폴더에
                업로드되고, Firestore에는 이미지 주소가 저장돼요.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}