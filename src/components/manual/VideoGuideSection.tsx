"use client";

import { useMemo, useRef } from "react";
import { VideoGuideItemModel } from "@/model/firebase/manual_entry_model";

type Props = {
  videos?: VideoGuideItemModel[];
};

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([^?&/]+)/);
  return match ? match[1] : "";
}

function VideoCard({ item }: { item: VideoGuideItemModel }) {
  const videoId = getYoutubeId(item.url);
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";

  return (
    <button
      type="button"
      onClick={() => {
        if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
      }}
      className="group min-w-[240px] overflow-hidden rounded-[20px] bg-white/80 text-left shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-[0.97] cursor-pointer"
    >
      <div className="relative h-[140px] overflow-hidden rounded-t-[20px] bg-slate-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
            영상 준비중
          </div>
        )}

        <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" />

        <div className="absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-[#2f63df] shadow transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
          ▶
        </div>
      </div>

      <div className="p-4 text-left">
        <p className="font-bold text-[#2b2b2b]">{item.title}</p>
        <p className="mt-2 text-sm text-gray-500">{item.subtitle}</p>
      </div>
    </button>
  );
}

export default function VideoGuideSection({ videos = [] }: Props) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const videoItems = useMemo(() => {
    return videos
      .filter((item) => item.title.trim() || item.url.trim())
      .sort((a, b) => a.order - b.order);
  }, [videos]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDownRef.current || !sliderRef.current) return;
    e.preventDefault();

    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const scrollByAmount = (direction: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative z-20 -mt-[10px] px-4 pb-6">
      <div className="rounded-[28px] border border-white/30 bg-white/1 px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-[2px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[22px] text-[#ff5a4f]">▷</span>
            <h2 className="text-[26px] font-extrabold text-[#2b2b2b]">
              비디오 가이드
            </h2>
          </div>
        </div>

        {videoItems.length === 0 ? (
          <div className="rounded-[20px] bg-white/70 px-4 py-8 text-center text-sm font-semibold text-gray-500">
            등록된 비디오 가이드가 없습니다.
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg text-gray-700 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg text-gray-700 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
            >
              ›
            </button>

            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none scroll-smooth"
            >
              {videoItems.map((item) => (
                <VideoCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}