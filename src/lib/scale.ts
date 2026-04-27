export const BASE_WIDTH = 390;
export const BASE_HEIGHT = 844;

// 가로 기준
export function scaleX(size: number, screenWidth: number) {
  return (size * screenWidth) / BASE_WIDTH;
}

// 세로 기준
export function scaleY(size: number, screenHeight: number) {
  return (size * screenHeight) / BASE_HEIGHT;
}

// 전체 비율 (폰트, radius 등)
export function scale(size: number, screenWidth: number, screenHeight: number) {
  const widthScale = screenWidth / BASE_WIDTH;
  const heightScale = screenHeight / BASE_HEIGHT;

  return size * Math.min(widthScale, heightScale);
}