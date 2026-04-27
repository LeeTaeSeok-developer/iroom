"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

export default function FloatingActionButtons() {
  const [partsHover, setPartsHover] = useState(false);
  const [kakaoHover, setKakaoHover] = useState(false);

  return (
    <>
      {/* 카카오 오픈채팅 버튼 */}
      <a
        href="https://pf.kakao.com/_uxchxfj/chat"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(370px)",
          top: "40px",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={() => setKakaoHover(true)}
        onMouseLeave={() => setKakaoHover(false)}
      >
        <img
          src="/kakao.png"
          alt="카카오톡 오픈채팅"
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "9999px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            cursor: "pointer",
            transition: "0.2s",
            transform: kakaoHover ? "scale(1.1)" : "scale(1)",
          }}
        />

        <div
          style={{
            marginLeft: "10px",
            opacity: kakaoHover ? 1 : 0,
            transform: kakaoHover ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.15s ease",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            borderRadius: "9999px",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          카카오톡으로 이동
        </div>
      </a>

      {/* 부속품 구매 버튼 */}
      <a
        href="https://smartstore.naver.com/iroom24h"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(370px)",
          top: "130px",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={() => setPartsHover(true)}
        onMouseLeave={() => setPartsHover(false)}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "9999px",
            backgroundColor: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            cursor: "pointer",
            transition: "0.2s",
            transform: partsHover ? "scale(1.1)" : "scale(1)",
          }}
        >
          <ShoppingCart size={28} color="white" />
        </div>

        <div
          style={{
            marginLeft: "10px",
            opacity: partsHover ? 1 : 0,
            transform: partsHover ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.15s ease",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            borderRadius: "9999px",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 700,
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          부속품 구매 페이지로 이동
        </div>
      </a>
    </>
  );
}