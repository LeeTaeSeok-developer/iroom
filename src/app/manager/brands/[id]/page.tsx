"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { BrandModel } from "@/model/firebase/brand_model";
import { uploadImage } from "@/lib/uploadImage";
import {
  ArrowLeft,
  ShieldCheck,
  Save,
  Trash2,
  ImageIcon,
  Type,
  Hash,
  Upload,
  Eye,
} from "lucide-react";

export default function ManagerBrandDetailPage() {
  const router = useRouter();
  const params = useParams();

  const brandId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
    const fetchBrand = async () => {
      if (!brandId) return;

      try {
        setLoading(true);
        setError("");

        const ref = doc(db, "brands", brandId);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          setError("브랜드 정보를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }

        const brand = BrandModel.fromMap(snapshot.data(), snapshot.id);

        setName(brand.name);
        setImageUrl(brand.imageUrl);
        setPriority(String(brand.priority ?? 0));
        setIsActive(brand.isActive);
      } catch (err) {
        console.error("브랜드 조회 실패:", err);
        setError("브랜드 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (!checking) {
      fetchBrand();
    }
  }, [checking, brandId]);

  const previewName = useMemo(() => {
    return name.trim() || "브랜드 이름 미리보기";
  }, [name]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!brandId) return;

    if (!name.trim()) {
      setError("브랜드 이름을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      let uploadedImageUrl = imageUrl.trim();

      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile, "brands");
      }


      await updateDoc(doc(db, "brands", brandId), {
        name: name.trim(),
        imageUrl: uploadedImageUrl,
        priority: Number(priority) || 0,
        isActive,
      });

      router.push("/manager/brands");
    } catch (err) {
      console.error("브랜드 수정 실패:", err);
      setError("브랜드 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!brandId) return;

    const ok = window.confirm("이 브랜드를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setDeleting(true);
      setError("");

      await deleteDoc(doc(db, "brands", brandId));
      router.push("/manager/brands");
    } catch (err) {
      console.error("브랜드 삭제 실패:", err);
      setError("브랜드 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (checking || loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_42%,#f4f7fb_100%)] px-5 py-8 text-slate-900">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
            브랜드 정보 불러오는 중...
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
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/manager/brands")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            브랜드 목록
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
          >
            <Trash2 size={16} />
            {deleting ? "삭제 중..." : "삭제"}
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
            Brand Edit
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            브랜드 수정
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            브랜드 정보를 수정하거나 삭제할 수 있어요.
          </p>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  브랜드 이름
                </label>
                <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4">
                  <Type size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 아이룸"
                    className="h-14 w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
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
                    }}
                    className="hidden"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-black text-slate-800">
                      {imageFile ? imageFile.name : "컴퓨터에서 새 이미지 선택"}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-slate-500">
                      새 이미지를 선택하지 않으면 기존 이미지가 유지돼요.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  정렬 순서
                </label>
                <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4">
                  <Hash size={18} className="text-slate-400" />
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="0"
                    className="h-14 w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <label
                className={`flex cursor-pointer items-center justify-between rounded-[22px] border px-4 py-5 transition ${
                  isActive
                    ? "border-green-400 bg-green-100"
                    : "border-red-400 bg-red-100"
                }`}
              >
                <div>
                  <p className="text-[15px] font-bold text-slate-900">
                    사용 여부
                  </p>
                  <p
                    className={`mt-1 text-[13px] font-bold ${
                      isActive ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isActive ? "활성화됨" : "비활성화됨"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`relative h-9 w-16 rounded-full transition shadow-inner ${
                    isActive
                      ? "bg-green-600 shadow-[0_0_10px_rgba(34,197,94,0.45)]"
                      : "bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.45)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-md transition ${
                      isActive ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </label>

              {error && (
                <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[22px] text-[15px] font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 18px 34px rgba(37,99,235,0.24)",
                }}
              >
                <Save size={18} />
                {saving ? "저장 중..." : "수정 저장"}
              </button>
            </form>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
            <p className="text-[14px] font-bold text-slate-500">미리보기</p>

            <div className="mt-4 rounded-[26px] border border-slate-200 bg-slate-50 p-4">
              <button
                type="button"
                className="flex w-full items-center gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left shadow-sm"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
                  {previewUrl || imageUrl.trim() ? (
                    <img
                      src={previewUrl || imageUrl}
                      alt={previewName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={24} className="text-slate-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px] font-black tracking-[-0.03em] text-slate-900">
                    {previewName}
                  </div>
                  <div className="mt-1 text-[13px] text-slate-500">
                    priority: {Number(priority) || 0}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}