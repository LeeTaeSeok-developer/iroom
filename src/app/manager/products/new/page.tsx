"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { uploadImage } from "@/lib/uploadImage";
import { BrandModel } from "@/model/firebase/brand_model";
import { ProductQuestionItemMap } from "@/model/firebase/product_question_model";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Save,
  PackagePlus,
  ImageIcon,
  Tag,
  Search,
  FolderKanban,
  Boxes,
  CheckCircle2,
  Plus,
  Trash2,
  MessageCircleQuestion,
  Upload,
  X,
} from "lucide-react";


function splitByComma(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTag(tag: string) {
  const cleaned = tag.trim().replace(/^#\s*/, "").replace(/^#/, "");
  return cleaned ? `#${cleaned}` : "";
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createEmptyQuestion(order = 0): ProductQuestionItemMap {
  return {
    id: makeId(),
    question: "",
    answer: "",
    order,
    isActive: true,
  };
}

export default function ManagerProductCreatePage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [error, setError] = useState("");

  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [category, setCategory] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [searchKeywordsInput, setSearchKeywordsInput] = useState("");

  const [manualEnabled, setManualEnabled] = useState(true);
  const [questionEnabled, setQuestionEnabled] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [questionItems, setQuestionItems] = useState<ProductQuestionItemMap[]>([
    createEmptyQuestion(0),
  ]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
        await loadBrands();
      } catch (error) {
        await signOut(auth);
        router.replace("/manager/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);

      const snapshot = await getDocs(collection(db, "brands"));

      const items = snapshot.docs
        .map((item) => BrandModel.fromMap(item.data(), item.id))
        .sort((a, b) => {
          if ((a.priority ?? 0) !== (b.priority ?? 0)) {
            return (a.priority ?? 0) - (b.priority ?? 0);
          }

          return (a.name ?? "").localeCompare(b.name ?? "", "ko");
        });

      setBrands(items);

      if (items.length > 0) {
        const firstActive = items.find((item) => item.isActive);
        setBrandId(firstActive?.id ?? items[0].id);
      }
    } catch (err) {
      alert("브랜드 목록을 불러오지 못했어요.");
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/manager/login");
    } catch (err) {
      alert("로그아웃 중 오류가 발생했어요.");
    }
  };

  const selectedBrand = useMemo(() => {
    return brands.find((item) => item.id === brandId) ?? null;
  }, [brands, brandId]);

  const parsedHashtags = useMemo(() => {
    const list = splitByComma(hashtagsInput).map(normalizeTag).filter(Boolean);
    const mainTag = normalizeTag(hashtag);

    return Array.from(new Set([mainTag, ...list].filter(Boolean)));
  }, [hashtagsInput, hashtag]);

  const parsedSearchKeywords = useMemo(() => {
    const inputKeywords = splitByComma(searchKeywordsInput);

    const autoKeywords = [
      name.trim(),
      selectedBrand?.name?.trim() ?? "",
      category.trim(),
      ...parsedHashtags.map((item) => item.replace(/^#/, "").trim()),
    ].filter(Boolean);

    return Array.from(new Set([...inputKeywords, ...autoKeywords]));
  }, [searchKeywordsInput, name, selectedBrand, category, parsedHashtags]);

  const cleanQuestionItems = useMemo<ProductQuestionItemMap[]>(() => {
    return questionItems
      .filter((item) => item.question.trim() || item.answer.trim())
      .map((item, index) => ({
        id: item.id || makeId(),
        question: item.question.trim(),
        answer: item.answer.trim(),
        order: index,
        isActive: item.isActive,
      }));
  }, [questionItems]);

  const updateQuestionItem = (
    id: string,
    data: Partial<ProductQuestionItemMap>
  ) => {
    setQuestionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const addQuestionItem = () => {
    setQuestionItems((prev) => [...prev, createEmptyQuestion(prev.length)]);
  };

  const removeQuestionItem = (id: string) => {
    setQuestionItems((prev) => {
      const next = prev.filter((item) => item.id !== id);

      if (next.length === 0) {
        return [createEmptyQuestion(0)];
      }

      return next.map((item, index) => ({
        ...item,
        order: index,
      }));
    });
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있어요.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImageFile(null);
    setPreviewUrl("");
  };

  const validate = () => {
    if (!selectedBrand) return "브랜드를 선택해주세요.";
    if (!name.trim()) return "제품명을 입력해주세요.";
    if (!category.trim()) return "카테고리를 입력해주세요.";
    if (!normalizeTag(hashtag)) return "대표 해시태그를 입력해주세요.";

    const hasIncompleteQuestion = questionItems.some((item) => {
      const hasQuestion = item.question.trim();
      const hasAnswer = item.answer.trim();

      return (hasQuestion && !hasAnswer) || (!hasQuestion && hasAnswer);
    });

    if (hasIncompleteQuestion) {
      return "제품 질문은 질문과 답변을 둘 다 입력해야 저장할 수 있어요.";
    }

    return "";
  };

  const handleSave = async () => {
    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const productRef = doc(collection(db, "products"));
      const productId = productRef.id;
      const normalizedMainTag = normalizeTag(hashtag);

      let uploadedImageUrl = "";

      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile, "products");
      }

      await setDoc(productRef, {
        id: productId,
        hashtag: normalizedMainTag,
        hashtags: parsedHashtags,
        brandId: selectedBrand?.id ?? "",
        brandName: selectedBrand?.name ?? "",
        name: name.trim(),
        imageUrl: uploadedImageUrl,
        category: category.trim(),
        searchKeywords: parsedSearchKeywords,
        manualEnabled,
        questionEnabled,
        isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, "productQuestions", productId), {
        id: productId,
        productId,
        productName: name.trim(),
        items: cleanQuestionItems,
        isActive: questionEnabled && isActive,
      });

      alert("제품과 제품 질문이 같이 추가되었어요.");
      router.replace("/manager/products");
    } catch (err) {
      alert("제품 저장 중 오류가 발생했어요.");
    } finally {
      setSaving(false);
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
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/manager/products")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm"
          >
            <ArrowLeft size={16} />
            제품 관리
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        <section className="mt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">
            <ShieldCheck size={14} />
            Product Create
          </div>

          <h1 className="mt-5 flex items-center gap-3 text-[34px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[42px]">
            <PackagePlus size={34} />
            제품 추가
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            제품 정보와 제품별 질문을 여러 개 함께 저장할 수 있어요.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">
              선택 브랜드
            </p>
            <p className="mt-2 truncate text-[20px] font-black text-slate-900">
              {selectedBrand?.name || "미선택"}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">매뉴얼</p>
            <p className="mt-2 text-[20px] font-black text-slate-900">
              {manualEnabled ? "사용" : "미사용"}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[12px] font-semibold text-slate-500">
              제품 질문
            </p>
            <p className="mt-2 text-[20px] font-black text-slate-900">
              {cleanQuestionItems.length}개
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Boxes size={16} />
                  브랜드
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  disabled={loadingBrands}
                  className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                >
                  <option value="">
                    {loadingBrands ? "브랜드 불러오는 중..." : "브랜드 선택"}
                  </option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                      {brand.isActive ? "" : " (숨김)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <FolderKanban size={16} />
                  카테고리
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="예: 무선청소기"
                  className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                제품명
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 더스트제로 에어 90D"
                className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <ImageIcon size={16} />
                제품 이미지
              </label>

              <label className="group flex cursor-pointer items-center gap-4 rounded-[24px] border border-dashed border-blue-200 bg-blue-50/50 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white text-blue-600 shadow-sm">
                  <Upload size={20} />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
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

              {previewUrl && (
                <div className="mt-4 flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                    <img
                      src={previewUrl}
                      alt="제품 이미지 미리보기"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-800">
                      {imageFile?.name}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      저장하면 Firebase Storage의 products 폴더에 업로드돼요.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-white text-red-500"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Tag size={16} />
                  대표 해시태그
                </label>
                <input
                  value={hashtag}
                  onChange={(e) => setHashtag(e.target.value)}
                  placeholder="#무선청소기"
                  className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Tag size={16} />
                  해시태그 목록
                </label>
                <input
                  value={hashtagsInput}
                  onChange={(e) => setHashtagsInput(e.target.value)}
                  placeholder="무선청소기, 청소기, 스틱청소기"
                  className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Search size={16} />
                검색 키워드
              </label>
              <input
                value={searchKeywordsInput}
                onChange={(e) => setSearchKeywordsInput(e.target.value)}
                placeholder="흡입력, 먼지통, 필터, 더스트제로"
                className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    매뉴얼 사용
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    제품 매뉴얼 노출 여부
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={manualEnabled}
                  onChange={(e) => setManualEnabled(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">문의 사용</p>
                  <p className="mt-1 text-xs text-slate-500">
                    제품 문의 노출 여부
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={questionEnabled}
                  onChange={(e) => setQuestionEnabled(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">사용 상태</p>
                  <p className="mt-1 text-xs text-slate-500">사용 중 / 숨김</p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-[18px] font-black tracking-[-0.03em] text-slate-900">
                <MessageCircleQuestion size={19} />
                제품 질문
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                질문 추가 버튼으로 여러 개 만들 수 있어요.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuestionItem}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[16px] px-4 text-sm font-bold"
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
              }}
            >
              <Plus size={16} color="#ffffff" />
              질문 추가
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {questionItems.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-800">
                    질문 {index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeQuestionItem(item.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={item.question}
                    onChange={(e) =>
                      updateQuestionItem(item.id, {
                        question: e.target.value,
                      })
                    }
                    placeholder="예: 필터는 언제 교체해야 하나요?"
                    className="h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-400"
                  />

                  <textarea
                    value={item.answer}
                    onChange={(e) =>
                      updateQuestionItem(item.id, {
                        answer: e.target.value,
                      })
                    }
                    placeholder="답변을 입력하세요"
                    rows={4}
                    className="w-full resize-none rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-400"
                  />

                  <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) =>
                        updateQuestionItem(item.id, {
                          isActive: e.target.checked,
                        })
                      }
                    />
                    이 질문 사용
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h2 className="text-[18px] font-black tracking-[-0.03em] text-slate-900">
                저장 미리보기
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <span className="font-bold text-slate-800">브랜드:</span>{" "}
                {selectedBrand?.name || "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">제품명:</span>{" "}
                {name.trim() || "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">카테고리:</span>{" "}
                {category.trim() || "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">이미지:</span>{" "}
                {imageFile ? imageFile.name : "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">
                  대표 해시태그:
                </span>{" "}
                {normalizeTag(hashtag) || "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">해시태그:</span>{" "}
                {parsedHashtags.length ? parsedHashtags.join(", ") : "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">검색 키워드:</span>{" "}
                {parsedSearchKeywords.length
                  ? parsedSearchKeywords.join(", ")
                  : "-"}
              </div>
              <div>
                <span className="font-bold text-slate-800">제품 질문:</span>{" "}
                {cleanQuestionItems.length}개
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-[18px] font-black tracking-[-0.03em] text-slate-900">
              저장하기
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              저장하면 이미지는 <b>Firebase Storage/products</b>에 올라가고,{" "}
              <b>products</b>에는 이미지 주소가 저장돼.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] text-sm font-extrabold text-white transition hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 16px 30px rgba(37,99,235,0.22)",
                }}
              >
                <Save size={17} />
                {saving ? "저장 중..." : "제품 저장"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/manager/products")}
                className="h-14 rounded-[20px] border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                취소
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}