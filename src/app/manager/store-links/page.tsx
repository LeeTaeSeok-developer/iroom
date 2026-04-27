"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { StoreLinkModel } from "@/model/firebase/store_link_model";
import {
  ArrowLeft,
  LogOut,
  Plus,
  Save,
  Trash2,
  Pencil,
  X,
  ShoppingBag,
} from "lucide-react";

type FormState = {
  id: string;
  name: string;
  url: string;
  order: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  id: "",
  name: "",
  url: "",
  order: "0",
  isActive: true,
};

export default function ManagerStoreLinksPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [links, setLinks] = useState<StoreLinkModel[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => a.order - b.order);
  }, [links]);

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
      fetchStoreLinks();
    }
  }, [checking]);

  const fetchStoreLinks = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, "storeLinks"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((item) =>
        StoreLinkModel.fromMap(item.data(), item.id)
      );

      setLinks(list);
    } catch (error) {
      console.error("스토어 링크 불러오기 실패:", error);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
  };

  const handleEdit = (item: StoreLinkModel) => {
    setForm({
      id: item.id,
      name: item.name,
      url: item.url,
      order: String(item.order),
      isActive: item.isActive,
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const url = form.url.trim();
    const order = Number(form.order);

    if (!name) {
      alert("스토어 이름을 입력해주세요.");
      return;
    }

    if (!url) {
      alert("스토어 URL을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);

      if (editing && form.id) {
        const model = new StoreLinkModel(
          form.id,
          name,
          url,
          Number.isNaN(order) ? 0 : order,
          form.isActive
        );

        await setDoc(doc(db, "storeLinks", form.id), model.toMap());
      } else {
        const ref = await addDoc(collection(db, "storeLinks"), {
          id: "",
          name,
          url,
          order: Number.isNaN(order) ? 0 : order,
          isActive: form.isActive,
        });

        await setDoc(doc(db, "storeLinks", ref.id), {
          id: ref.id,
          name,
          url,
          order: Number.isNaN(order) ? 0 : order,
          isActive: form.isActive,
        });
      }

      resetForm();
      await fetchStoreLinks();
    } catch (error) {
      console.error("스토어 링크 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 스토어 링크를 삭제할까요?")) return;

    try {
      await deleteDoc(doc(db, "storeLinks", id));
      await fetchStoreLinks();
    } catch (error) {
      console.error("스토어 링크 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/manager/login");
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-[28px] bg-white px-6 py-5 text-sm font-bold text-slate-500 shadow-sm">
            관리자 인증 확인 중...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_45%,#f4f7fb_100%)] px-5 pb-10 pt-5 text-slate-900">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/manager")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm"
        >
          <ArrowLeft size={16} />
          관리자 홈
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>

      <section className="mt-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-[11px] font-black tracking-[0.18em] text-blue-700">
          <ShoppingBag size={14} />
          STORE LINKS
        </div>

        <h1 className="mt-5 text-[32px] font-black tracking-[-0.04em]">
          스토어 링크 관리
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          공식 스토어 바로가기 모달에 보여줄 링크를 관리합니다.
        </p>
      </section>

      <section className="mt-7 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">
          {editing ? "스토어 링크 수정" : "스토어 링크 생성"}
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">
              스토어 이름
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="예: 네이버 스마트스토어"
              className="mt-2 h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">URL</label>
            <input
              value={form.url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://..."
              className="mt-2 h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              노출 순서
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, order: e.target.value }))
              }
              className="mt-2 h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
            }
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              form.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {form.isActive ? "노출 중" : "숨김"}
          </button>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] bg-white text-sm font-black text-slate-900 shadow-md border border-slate-200"
            >
              {editing ? <Save size={17} /> : <Plus size={17} />}
              {saving ? "저장 중..." : editing ? "수정 저장" : "새로 생성"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-100 text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        {loading ? (
          <div className="rounded-[26px] bg-white px-5 py-6 text-center text-sm font-bold text-slate-400 shadow-sm">
            스토어 링크를 불러오는 중입니다.
          </div>
        ) : sortedLinks.length === 0 ? (
          <div className="rounded-[26px] bg-white px-5 py-6 text-center text-sm font-bold text-slate-400 shadow-sm">
            등록된 스토어 링크가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLinks.map((item) => (
              <div
                key={item.id}
                className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-black text-slate-900">
                        {item.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {item.isActive ? "노출" : "숨김"}
                      </span>
                    </div>

                    <p className="mt-2 break-all text-sm leading-6 text-slate-500">
                      {item.url}
                    </p>

                    <p className="mt-2 text-xs font-bold text-slate-400">
                      순서 {item.order}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}