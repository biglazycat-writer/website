"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AppWindow,
  ArrowRight,
  BookOpen,
  Brush,
  ChevronDown,
  Compass,
  Feather,
  FileSearch,
  HardDrive,
  ImagePlus,
  Keyboard,
  Link2,
  ListTree,
  Map,
  MonitorSmartphone,
  PenLine,
  Plug,
  Puzzle,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "../lib/use-translation";
import { BUILTIN_THEMES } from "../lib/builtin-themes";
import { BrushDivider } from "./PortalArt";
import styles from "./PortalFeatures.module.css";

/** 能力网格的键前缀，与 portal 语言包 features.caps.* 一一对应。 */
type CapabilityKey =
  | "localfirst"
  | "ai"
  | "vim"
  | "platforms"
  | "markdown"
  | "outline"
  | "flow"
  | "bilink"
  | "tags"
  | "search"
  | "mindmap"
  | "canvas"
  | "pdf"
  | "image"
  | "browser"
  | "wechat"
  | "book"
  | "multiwindow"
  | "mcp"
  | "plugins"
  | "export";

/** 产品截图的键前缀，与 portal 语言包 features.shots.* 一一对应。 */
type ShotKey = "dual" | "pdf" | "mindmap" | "canvas";

interface Capability {
  icon: LucideIcon;
  /** features.caps.<key> 下的文案键前缀 */
  key: CapabilityKey;
}

/** 产品场景：桌面端真实使用场景，整行交错排布。宽高一并写出来，图片加载前也先占好位。 */
const SHOTS: { key: ShotKey; src: string; width: number; height: number }[] = [
  { key: "dual", src: `${import.meta.env.BASE_URL}portal/screenshots/dual-column.webp`, width: 1917, height: 1014 },
  { key: "pdf", src: `${import.meta.env.BASE_URL}portal/screenshots/pdf-reading.webp`, width: 1917, height: 1008 },
  { key: "mindmap", src: `${import.meta.env.BASE_URL}portal/screenshots/mindmap-reading.webp`, width: 1916, height: 1017 },
  { key: "canvas", src: `${import.meta.env.BASE_URL}portal/screenshots/canvas-architecture.webp`, width: 1912, height: 1013 },
];

/**
 * 倾斜展开的主题样张：挑四套气质差异最大的内置主题（原 PortalThemes 栏并入场景区）。
 * 样张是预渲染好的真实图片素材（public/portal/themes/*.webp，由编辑器同源的主题 CSS 渲染成图）。
 */
const FAN_THEME_IDS = ["chineseTraditional", "darkTech", "qingfengMagazine", "latexAcademic"] as const;

const FAN_THEMES = FAN_THEME_IDS.map((id) => {
  const theme = BUILTIN_THEMES.find((item) => item.id === id) ?? BUILTIN_THEMES[0];
  return { id: theme.id, name: theme.name };
});

const CAPABILITIES: Capability[] = [
  { icon: HardDrive, key: "localfirst" },
  { icon: Sparkles, key: "ai" },
  { icon: Keyboard, key: "vim" },
  { icon: MonitorSmartphone, key: "platforms" },
  { icon: PenLine, key: "markdown" },
  { icon: ListTree, key: "outline" },
  { icon: Feather, key: "flow" },
  { icon: Link2, key: "bilink" },
  { icon: Tags, key: "tags" },
  { icon: Search, key: "search" },
  { icon: Map, key: "mindmap" },
  { icon: Brush, key: "canvas" },
  { icon: FileSearch, key: "pdf" },
  { icon: ImagePlus, key: "image" },
  { icon: Compass, key: "browser" },
  { icon: Send, key: "wechat" },
  { icon: BookOpen, key: "book" },
  { icon: AppWindow, key: "multiwindow" },
  { icon: Plug, key: "mcp" },
  { icon: Puzzle, key: "plugins" },
  { icon: RefreshCw, key: "export" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const headingReveal = {
  initial: { opacity: 0, y: 32, filter: "blur(12px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.8, ease: EASE },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {t("features.hero.sloganLead")}
            <em>{t("features.hero.sloganEm")}</em>
          </motion.h1>
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0 }}
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
            <img
              className={styles.heroDesktop}
              src={`${import.meta.env.BASE_URL}portal/screenshots/hero-desktop.webp`}
              alt={t("features.hero.alt")}
              width={1968}
              height={1128}
              decoding="async"
            />
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

      {/* 第二项：能力总览网格 */}
      <div className={styles.gridHead} id="capabilities">
        <motion.div className={styles.heading} {...headingReveal}>
          <h2 className={styles.gridTitle}>{t("features.title")}</h2>
          <BrushDivider />
          <p className={styles.gridSubtitle}>{t("features.subtitle")}</p>
        </motion.div>
        <motion.div
          className={styles.capabilityGrid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
        >
          {CAPABILITIES.map((capability) => {
            const Icon = capability.icon;
            return (
              <motion.article key={capability.key} className={styles.capabilityCard} variants={item}>
                <span className={styles.capabilityIcon}>
                  <Icon size={17} />
                </span>
                <h3>{t(`features.caps.${capability.key}.title`)}</h3>
                <p>{t(`features.caps.${capability.key}.desc`)}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {/* 第三项：产品场景，不设区块标题；五条全宽色带（双栏 → 主题 → PDF → 导图 → 画布）黑白交替，滚动时逐行浮现 */}
      <div className={styles.shotsBand}>
        {SHOT_BANDS.map((variant) => {
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
