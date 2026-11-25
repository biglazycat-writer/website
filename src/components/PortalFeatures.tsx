"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Feather,
  FileText,
  Globe,
  HardDrive,
  ImagePlus,
  Layers,
  ListTree,
  Network,
  Pause,
  PenLine,
  Play,
  Plus,
  Puzzle,
  Search,
  Shapes,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "../lib/use-translation";
import { BUILTIN_THEMES } from "../lib/builtin-themes";
import { BrushDivider } from "./PortalArt";
import styles from "./PortalFeatures.module.css";

/** 能力网格的键前缀，与 portal 语言包 features.caps.* 一一对应。共十六格。 */
type CapabilityKey =
  | "files"
  | "workspace"
  | "search"
  | "ai"
  | "plugins"
  | "editing"
  | "longform"
  | "pdf"
  | "mindmap"
  | "canvas"
  | "image"
  | "clip"
  | "focus"
  | "rhythm"
  | "publish"
  | "more";

/** 产品截图的键前缀，与 portal 语言包 features.shots.* 一一对应。 */
type ShotKey = "pdf" | "mindmap" | "canvas";

interface Capability {
  icon: LucideIcon;
  /** features.caps.<key> 下的文案键前缀 */
  key: CapabilityKey;
  /** 卡片图标的强调色（浅色调色板，图标底色由它派生） */
  accent: string;
}

/** 产品场景：桌面端真实使用场景，整行交错排布。宽高一并写出来，图片加载前也先占好位。 */
const SHOTS: { key: ShotKey; src: string; width: number; height: number }[] = [
  { key: "pdf", src: `${import.meta.env.BASE_URL}portal/screenshots/pdf-reading.webp`, width: 1917, height: 1008 },
  { key: "mindmap", src: `${import.meta.env.BASE_URL}portal/screenshots/mindmap-reading.webp`, width: 1916, height: 1017 },
  { key: "canvas", src: `${import.meta.env.BASE_URL}portal/screenshots/canvas-architecture.webp`, width: 1912, height: 1013 },
];

/**
 * 双栏演示片：同内容的 GIF 有 38MB，压成 1280 宽的 H.264 只有 1.3MB，
 * 所以这里放视频而不是动图；首帧单独导成 JPG 当封面，preload="none"，
 * 不点就不下载——滚到这一屏也不会白白吃掉流量。
 */
const CLIP = {
  src: `${import.meta.env.BASE_URL}portal/video/dual-column.mp4`,
  poster: `${import.meta.env.BASE_URL}portal/video/dual-column-poster.jpg`,
  width: 1200,
  height: 676,
};

/**
 * 双栏演示：封面先占位，左下角一枚播放按钮引导点击。
 * 播放中按钮淡出，鼠标移上去（或键盘聚焦）才重新出现，方便暂停。
 */
function ClipPlayer({ play, pause }: { play: string; pause: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // 滚出视野就暂停：读者已经滑到下一节，没必要继续解码和耗电
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting && !video.paused) video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      // 用户取消了播放权限或浏览器拦截时静默失败，画面仍停在封面上
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <span className={styles.clipFrame}>
      <video
        ref={videoRef}
        className={styles.clipVideo}
        poster={CLIP.poster}
        width={CLIP.width}
        height={CLIP.height}
        preload="none"
        muted
        playsInline
        disablePictureInPicture
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          // 播完回到封面：load() 会让 poster 重新生效，下一轮从第一帧开始
          const video = videoRef.current;
          if (!video) return;
          video.currentTime = 0;
          video.load();
        }}
      >
        <source src={CLIP.src} type="video/mp4" />
      </video>
      <button
        type="button"
        className={styles.clipToggle}
        data-playing={playing}
        aria-label={playing ? pause : play}
        onClick={toggle}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {!playing && <span>{play}</span>}
      </button>
    </span>
  );
}

/**
 * 倾斜展开的主题样张：挑四套气质差异最大的内置主题（原 PortalThemes 栏并入场景区）。
 * 样张是预渲染好的真实图片素材（public/portal/themes/*.webp，由编辑器同源的主题 CSS 渲染成图）。
 */
const FAN_THEME_IDS = ["chineseTraditional", "darkTech", "qingfengMagazine", "latexAcademic"] as const;

const FAN_THEMES = FAN_THEME_IDS.map((id) => {
  const theme = BUILTIN_THEMES.find((item) => item.id === id) ?? BUILTIN_THEMES[0];
  return { id: theme.id, name: theme.name };
});

/**
 * 能力清单：十六格排成 4 × 4，不做标签切换，一屏看完。
 * 顺序按一天写作的真实路径走：稿件存在哪 → 知识怎么攒 → AI 与插件 → 怎么写 → 读完画完 → 写完怎么发。
 * 三种资料形态各占一格（搜索 / PDF / 剪藏），三种图形各占一格（导图 / 画布 / 图片），都写清具体能做什么。
 * 末格是「更多功能」清单，装不下的 TAB / 双屏 / 主题收在这里。
 */
const CAPABILITIES: Capability[] = [
  { icon: HardDrive, key: "files", accent: "#3b6ff0" },
  { icon: Layers, key: "workspace", accent: "#159a6b" },
  { icon: Search, key: "search", accent: "#4f5bd5" },
  { icon: Sparkles, key: "ai", accent: "#7c5cf7" },
  { icon: Puzzle, key: "plugins", accent: "#d98324" },
  { icon: PenLine, key: "editing", accent: "#3f3f46" },
  { icon: ListTree, key: "longform", accent: "#0e8f96" },
  { icon: FileText, key: "pdf", accent: "#c9506f" },
  { icon: Network, key: "mindmap", accent: "#a8577e" },
  { icon: Shapes, key: "canvas", accent: "#c2410c" },
  { icon: ImagePlus, key: "image", accent: "#5f8c2a" },
  { icon: Globe, key: "clip", accent: "#2c6ea8" },
  { icon: Feather, key: "focus", accent: "#0b7285" },
  { icon: Timer, key: "rhythm", accent: "#9061a8" },
  { icon: BookOpen, key: "publish", accent: "#3b6ff0" },
  { icon: Plus, key: "more", accent: "#8a8a93" },
];

/** 把 #rrggbb 强调色淡化成 10% 透明底色，做图标胶囊的底 */
function tint(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, .1)`;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const headingReveal = {
  initial: { opacity: 0, y: 32, filter: "blur(12px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.8, ease: EASE },
};

/** 十六张卡逐张浮现：一次入场，不再有切组重播 */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/**
 * 场景带顺序：双栏 → 主题 → PDF → 导图 → 画布，黑白交替；每行一种构图与介绍排版：
 * 图左文右（白）→ 文左图右（黑）→ 图左文右（白）→ 图左文右（黑）→ 上图下文居中（白）。
 * key 为 "themes" 的行不渲染整窗截图，而是渲染主题样张扇面 + themes.* 文案（原 PortalThemes 栏）。
 */
const SHOT_BANDS = [
  { key: "dual", band: "bandLight", row: "rowSplit", intro: "introBase" },
  { key: "themes", band: "bandDark", row: "rowSplitReverse", intro: "introRuleDark" },
  { key: "pdf", band: "bandLight", row: "rowSplit", intro: "introRuleLight" },
  { key: "mindmap", band: "bandDark", row: "rowSplit", intro: "introBase" },
  { key: "canvas", band: "bandLight", row: "rowStacked", intro: "introCenter" },
] as const;

// SHOT_BANDS 的 key → SHOTS 数据查找表。（文件顶部 Map 已被 lucide 图标占用，用 Record 而非 Map）
const SHOT_BY_KEY = SHOTS.reduce(
  (acc, shot) => ({ ...acc, [shot.key]: shot }),
  {} as Record<ShotKey, (typeof SHOTS)[number]>,
);

/**
 * 截图逐行浮现：自下而上淡入。
 * 触发挂在每行自己身上（不是整块列表）——否则列表顶部刚露头就整批播完，
 * 等滚到跟前动画已经结束，看起来就像「没有动画」。
 * band 是全宽色带，不做 scale：缩小会出现两侧露底。
 */
const shotReveal = {
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.95, ease: EASE },
};

/** 停顿更久的标点：写到这里换口气，打字机才不像机器。 */
const PAUSE_AFTER = new Set(["，", "。", "、", "；", "：", "——", "！", "？", ",", ".", ";", ":", "!", "?"]);

/**
 * 打字机：逐字显示主张文案，标点处多停一拍，收尾后光标淡出。
 * 整段原文始终以 srOnly 形式留在无障碍树里；减少动效偏好下直接整句呈现。
 */
function Typewriter({ text }: { text: string }) {
  const reduced = useReducedMotion();
  // 按码点切分，避免把 emoji 或组合字符劈成半个
  const chars = useMemo(() => Array.from(text), [text]);
  const [typed, setTyped] = useState(0);
  const done = typed >= chars.length;

  useEffect(() => {
    if (reduced) {
      setTyped(chars.length);
      return;
    }
    setTyped(0);
    // 总时长控制在 2 秒上下：短句慢一点有书写感，长句快一点不让人干等。
    const speed = Math.min(54, Math.max(15, Math.round(2000 / chars.length)));
    let index = 0;
    let timer = 0;
    const step = () => {
      index += 1;
      setTyped(index);
      if (index >= chars.length) return;
      timer = window.setTimeout(step, PAUSE_AFTER.has(chars[index - 1]) ? 220 : speed);
    };
    const start = window.setTimeout(step, 360);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [chars, reduced]);

  return (
    <span className={styles.typedLine} data-done={done ? "true" : "false"}>
      <span aria-hidden="true">{chars.slice(0, typed).join("")}</span>
      <span className={styles.caret} aria-hidden="true" />
      <span className={styles.srOnly}>{text}</span>
    </span>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function PortalFeatures() {
  const { t } = useTranslation("portal");
  const desc = t("features.hero.desc");

  return (
    <section className={styles.section} id="features">
      {/* 第一屏：产品主张 + 整窗截图，正好占满一屏 */}
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <motion.h1
            className={styles.heroTitle}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {t("features.hero.sloganLead")}
            <em>{t("features.hero.sloganEm")}</em>
          </motion.h1>
          <motion.p
            className={styles.heroDesc}
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            {/* 隐形副本撑住整段文字的行高，打字过程中版面不上下跳 */}
            <span className={styles.ghost} aria-hidden="true">
              {desc}
            </span>
            <Typewriter text={desc} />
          </motion.p>
          {/* 主张副标语下的三枚小字提示：小号灰字 + 主色方点轻点，只做原则提示行，不与主 CTA 抢视线 */}
          <p className={styles.heroBadges}>
            {t("features.hero.badges")
              .split("·")
              .map((badge) => badge.trim())
              .filter(Boolean)
              .map((badge, index) => (
                <motion.span
                  key={badge}
                  className={styles.heroBadge}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + index * 0.08, ease: EASE }}
                >
                  <span className={styles.heroBadgeDot} aria-hidden="true" />
                  {badge}
                </motion.span>
              ))}
          </p>
          <motion.a
            href="#download"
            className={styles.heroCta}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            onClick={(e) => {
              e.preventDefault();
              scrollToId("download");
            }}
          >
            {t("cta.startExperience")}
            <ArrowRight size={15} />
          </motion.a>
        </div>
        <motion.div
          className={styles.heroStage}
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.18, ease: EASE }}
        >
          <div className={styles.heroDevices}>
            {/* 优先 AVIF：同体积下细节更实，界面文字在高分屏上更清晰；不支持时回落 WebP */}
            <picture>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}portal/screenshots/hero-desktop.avif`}
              />
              <img
                className={styles.heroDesktop}
                src={`${import.meta.env.BASE_URL}portal/screenshots/hero-desktop.webp`}
                alt={t("features.hero.alt")}
                width={1948}
                height={1069}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
            <img
              className={styles.heroMobile}
              src={`${import.meta.env.BASE_URL}portal/screenshots/hero-mobile.webp`}
              alt={t("features.hero.altMobile")}
              width={1012}
              height={2195}
              decoding="async"
            />
          </div>
        </motion.div>
        {/* 首屏底部滚动提示：截图下沿预留的 48px 空隙正好容纳它 */}
        <motion.a
          href="#capabilities"
          className={styles.heroScroll}
          aria-label={t("features.hero.scrollHint")}
          title={t("features.hero.scrollHint")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          onClick={(e) => {
            e.preventDefault();
            scrollToId("capabilities");
          }}
        >
          <ChevronDown size={19} />
        </motion.a>
      </div>

      {/* 第二项：能力总览——十六格全部平铺，不做标签切换，一屏看完 */}
      <div className={styles.gridHead} id="capabilities">
        <div className={styles.gridTop}>
          <motion.div className={styles.gridHeading} {...headingReveal}>
            <h2 className={styles.gridTitle}>{t("features.title")}</h2>
            <BrushDivider />
            <p className={styles.gridSubtitle}>{t("features.subtitle")}</p>
          </motion.div>
        </div>
        <motion.div
          className={styles.capabilityGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {CAPABILITIES.map((capability) => {
            const Icon = capability.icon;
            return (
              <motion.article key={capability.key} className={styles.capabilityCard} variants={item}>
                <div className={styles.capabilityHead}>
                  <span
                    className={styles.capabilityIcon}
                    style={{ color: capability.accent, background: tint(capability.accent) }}
                  >
                    <Icon size={15} strokeWidth={1.9} />
                  </span>
                  <h3>{t(`features.caps.${capability.key}.title`)}</h3>
                </div>
                <p>{t(`features.caps.${capability.key}.desc`)}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {/* 第三项：产品场景，不设区块标题；五条全宽色带（双栏 → 主题 → PDF → 导图 → 画布）黑白交替，滚动时逐行浮现 */}
      <div className={styles.shotsBand}>
        {SHOT_BANDS.map((variant) => {
          if (variant.key === "dual") {
            return (
              <motion.figure key="dual" className={`${styles.shotBand} ${styles[variant.band]}`} {...shotReveal}>
                <div className={`${styles.shotRow} ${styles[variant.row]}`}>
                  <ClipPlayer play={t("features.shots.dual.play")} pause={t("features.shots.dual.pause")} />
                  <figcaption className={`${styles.shotIntro} ${styles[variant.intro]}`}>
                    <h3>{t("features.shots.dual.title")}</h3>
                    <p>{t("features.shots.dual.desc")}</p>
                  </figcaption>
                </div>
              </motion.figure>
            );
          }
          if (variant.key === "themes") {
            return (
              <motion.figure key="themes" id="themes" className={`${styles.shotBand} ${styles[variant.band]}`} {...shotReveal}>
                <div className={`${styles.shotRow} ${styles[variant.row]}`}>
                  <span className={styles.themeFan}>
                    {FAN_THEMES.map((theme, idx) => (
                      <div key={theme.id} className={`${styles.themeSheet} ${styles[`themeSheet${idx}`] ?? ""}`}>
                        <img
                          className={styles.themePreview}
                          src={`${import.meta.env.BASE_URL}portal/themes/${theme.id}.webp`}
                          alt={t("themes.previewTitle", { name: theme.name })}
                          width={1260}
                          height={1680}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ))}
                  </span>
                  <figcaption className={`${styles.shotIntro} ${styles[variant.intro]}`}>
                    <h3>
                      {t("themes.titleLead")}
                      <em>{t("themes.titleEm")}</em>
                    </h3>
                    <p>{t("themes.desc")}</p>
                    <p className={styles.shotNote}>{t("themes.aiNote")}</p>
                  </figcaption>
                </div>
              </motion.figure>
            );
          }
          const shot = SHOT_BY_KEY[variant.key];
          return (
            <motion.figure
              key={shot.key}
              className={`${styles.shotBand} ${styles[variant.band]}`}
              {...shotReveal}
            >
              <div className={`${styles.shotRow} ${styles[variant.row]}`}>
                <span className={styles.shotFrame}>
                  <img
                    src={shot.src}
                    alt={t(`features.shots.${shot.key}.alt`)}
                    width={shot.width}
                    height={shot.height}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <figcaption className={`${styles.shotIntro} ${styles[variant.intro]}`}>
                  <h3>{t(`features.shots.${shot.key}.title`)}</h3>
                  <p>{t(`features.shots.${shot.key}.desc`)}</p>
                </figcaption>
              </div>
            </motion.figure>
          );
        })}
      </div>
    </section>
  );
}
