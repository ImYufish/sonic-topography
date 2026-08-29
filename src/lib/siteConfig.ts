// 站点级配置文件（随静态站点部署的 public/site-config.json5）。
// 与「网页内设置面板」的区别：这是部署级默认值，改完重新部署站点即对所有访客生效；
// 网页内 localStorage 仅作为个人覆盖（可选），优先级高于本文件。
// 解析优先级统一为：localStorage 覆盖 → site-config.json5 部署默认 → 代码内置默认。
//
// 本文件使用 JSON5 格式：在 JSON 基础上允许写注释（// 行注释 与 /* */ 块注释）、尾逗号等，
// 便于部署时逐条说明每一项是什么。加载时先用 stripJson5 变成合法 JSON 再解析。
// 选 JSON5 而非 YAML/TOML 的原因：它们用 # 表示注释，会和我们大量出现的十六进制色值
// （如 #ffffff、#f21818）冲突；JSON5 的字符串里 # 不受影响，最省心。

import type {
  CustomThemeSettings,
  ThemeRotationSettings,
} from './themes';
import type { LyricsSettings, LyricsStyleType } from './lyricsSettings';
import type { DisplaySettings } from './displaySettings';
import type { PlaybackQualitySettings } from './playbackQuality';
import type { StoredGroundEqSettings } from './groundEqSettings';
import type { GlobalSceneSettings } from './sceneDefaults';

export interface SiteConfig {
  // ===== 音乐 / 音源 =====
  // 启动自动加载的 Meting 歌单 ID 列表（第一个作为启动播放队列）。
  defaultPlaylistIds?: string[];
  // 默认搜索源：meting（Meting 接口）/ qq / netease。网页版实际只建议 meting。
  searchProvider?: 'meting' | 'qq' | 'netease';
  // Meting 接口 Base URL（同 meting-config.json 的 base，集中到本文件便于一处管理）。
  metingBase?: string;
  // 默认音源：tencent（QQ 音乐，实测可用）/ kugou / netease（部分服务端会 404）。
  metingServer?: 'tencent' | 'kugou' | 'netease';
  // 默认码率（字符串，如 "128" / "192" / "320"），仅作展示/联动，Meting 实例实际不接收 br 参数。
  metingBitrate?: string;
  // 封面图片代理地址（留空则回退内置默认 https://proxy-api.x1anyu.cn/pic/?url=）。
  // 用于给腾讯/网易图床补 CORS 头，供 3D 封面纹理读取。
  picProxy?: string;

  // ===== 主题 / 外观 =====
  // 当前主题 id：内置主题 id（如 "wine-signal"）或 "custom"（自定义主题）。
  theme?: string;
  // 自定义主题预设列表（Color 面板里「新建主题」的预设）。留空数组表示不预置自定义主题。
  customThemes?: CustomThemeSettings[];
  // theme === "custom" 时选中的自定义主题 id。
  activeCustomThemeId?: string;
  // 主题轮播设置（Color 面板的「主题轮换」）。
  themeRotation?: ThemeRotationSettings;

  // ===== 歌词 =====
  // 歌词样式设置（Lyrics 面板）：style 决定用哪种样式，songyancai/dynamic-bounce/spatial-wall 各一套参数。
  lyricsSettings?: LyricsSettings;

  // ===== 显示 / 界面 =====
  // 界面显隐与时钟、快捷键设置（Display 面板）。
  displaySettings?: DisplaySettings;

  // ===== 音频质量 =====
  // 播放质量（Audio 面板）：qqQuality（QQ 音源品质）/ neteaseBitrate（网易云码率）。
  playbackQualitySettings?: PlaybackQualitySettings;

  // ===== 地面均衡器 / 漂浮方块 =====
  // 地面均衡器数值（GroundEq 面板）：bands 为 8 段频带增益，其余为动画/地形/漂浮方块数值。
  groundEqSettings?: StoredGroundEqSettings;

  // ===== 全局场景 =====
  // 全局场景旋转速度（场景设置面板里的 rotationSpeed，数值越大转得越快）。
  globalSceneSettings?: GlobalSceneSettings;

  // ===== 移动端专属默认 =====
  // 仅视口 ≤768px 或触屏设备（matchMedia '(max-width: 768px), (pointer: coarse)'）生效的覆盖项。
  // 用于给手机/平板单独定一套默认值，不影响桌面端。
  mobile?: MobileSiteConfig;
}

// 移动端专属默认（仅小屏/触屏设备生效）。
export interface MobileSiteConfig {
  // 移动端首次访问（尚未在本地自定义过歌词样式）时的默认歌词样式。
  // 默认 'spatial-wall'（3D 环绕，适合小屏）；可改 'songyancai' / 'dynamic-bounce'。
  lyricsStyle?: LyricsStyleType;
}

let loadPromise: Promise<SiteConfig | null> | null = null;
let resolved: SiteConfig | null = null;

// 把 JSON5 变成合法 JSON：剥离 // 与 /* */ 注释，并去掉尾逗号（, 紧邻 } 或 ] 之前）。
// 字符串内的 //、/* 、逗号、# 都不会被误伤（因为字符串整体跳过）。
function stripJson5(input: string): string {
  let out = '';
  let inString = false;
  let quote = '';
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      out += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        inString = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === '/' && input[i + 1] === '/') {
      while (i < input.length && input[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && input[i + 1] === '*') {
      i += 2;
      while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) i++;
      i++; // 跳过结尾的 /
      continue;
    }
    out += ch;
  }
  // 去掉尾逗号：仅在 , 后紧跟空白再遇到 } 或 ] 时删除该逗号。
  return out.replace(/,(\s*[}\]])/g, '$1');
}

// 站点启动时调用一次（main.tsx 会在首屏渲染前 await 它）；之后 getSiteConfig() 同步读取已解析结果。
export function loadSiteConfig(force = false): Promise<SiteConfig | null> {
  if (!force && loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const baseUrl = (import.meta.env as any).BASE_URL || '/';
      const controller = new AbortController();
      // 最多等 3 秒，避免配置文件缺失/网络异常时卡住首屏。
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${baseUrl}site-config.json5`, { cache: 'no-store', signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const text = await res.text();
      const json = JSON.parse(stripJson5(text));
      if (json && typeof json === 'object') {
        resolved = json as SiteConfig;
        return resolved;
      }
      return null;
    } catch {
      return null;
    }
  })();
  return loadPromise;
}

// 同步读取（需在 loadSiteConfig 完成后调用才有值；取不到时返回 null，由调用方回退内置默认）
export function getSiteConfig(): SiteConfig | null {
  return resolved;
}
