"use client";

import styles from "./PortalArt.module.css";

/**
 * 门户首页的艺术装饰件：笔刷分隔线。
 * 全部是纯 CSS / 内联 SVG，不依赖图片资源，供各门户区块复用。
 */

/** 手绘感笔刷分隔线，颜色跟随 currentColor。 */
export function BrushDivider({ className }: { className?: string }) {
  return (
    <svg
      className={`${styles.brush} ${className ?? ""}`}
      viewBox="0 0 140 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M3 6 C 24 2.5, 40 8.5, 62 5 S 104 2.5, 137 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}


