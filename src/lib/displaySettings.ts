export interface ClockSettings {
  visible: boolean;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  size: number;
  color: string;
  followThemeColor: boolean;
  opacity: number;
}

export interface ShortcutSettings {
  playPause: string;
  prevSong: string;
  nextSong: string;
}

export interface DisplaySettings {
  showLeftIcon: boolean;
  showRightIcon: boolean;
  showBottomPlayer: boolean;
  showLyrics: boolean;
  showCover: boolean;
  clock: ClockSettings;
  shortcuts: ShortcutSettings;
}

import { getSiteConfig } from './siteConfig';

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showLeftIcon: false,
  showRightIcon: false,
  showBottomPlayer: true,
  showLyrics: true,
  showCover: true,
  clock: {
    visible: false,
    position: 'top-center',
    size: 200,
    color: '#f50000',
    followThemeColor: true,
    opacity: 0.7,
  },
  shortcuts: {
    playPause: 'Space',
    prevSong: 'Ctrl+ArrowLeft',
    nextSong: 'Ctrl+ArrowRight',
  }
};

const STORAGE_KEY = 'sonic_topography_display_settings';
// 一次性迁移标记：旧版本里左右菜单开关（showLeftIcon/showRightIcon）曾默认开启，
// 现已改为默认关闭。为避免旧 localStorage 里的 true 继续覆盖代码默认值，读取时复位一次并打标。
const SIDE_ICON_RESET_KEY = 'sonic_topography_display_side_icon_reset_v1';

function applyOneTimeMigrations(parsed: Partial<DisplaySettings>): Partial<DisplaySettings> {
  let result = parsed;
  try {
    if (typeof window !== 'undefined' && !window.localStorage.getItem(SIDE_ICON_RESET_KEY)) {
      result = { ...parsed, showLeftIcon: false, showRightIcon: false };
      window.localStorage.setItem(SIDE_ICON_RESET_KEY, '1');
    }
  } catch {
    // localStorage 不可用时忽略迁移，仅保留代码默认值行为
  }
  return result;
}

// 三层合并：代码内置默认 ← 站点配置（site-config.json5） ← 个人 localStorage。
// 嵌套对象（clock / shortcuts）做深合并，标量字段后者覆盖前者。
function mergeDisplaySettings(base: DisplaySettings, override?: Partial<DisplaySettings> | null): DisplaySettings {
  if (!override || typeof override !== 'object') return base;
  return {
    ...base,
    ...override,
    clock: { ...base.clock, ...(override.clock || {}) },
    shortcuts: { ...base.shortcuts, ...(override.shortcuts || {}) },
  };
}

export function readDisplaySettingsStorage(): DisplaySettings {
  // 站点配置作为部署默认（介于代码默认与 localStorage 之间）。
  const site = getSiteConfig()?.displaySettings;
  const withSite = mergeDisplaySettings(DEFAULT_DISPLAY_SETTINGS, site);

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = applyOneTimeMigrations(JSON.parse(stored));
      return mergeDisplaySettings(withSite, parsed);
    }
  } catch (e) {
    console.error('Failed to read display settings from storage', e);
  }
  return withSite;
}

export function writeDisplaySettingsStorage(settings: DisplaySettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to write display settings to storage', e);
  }
}
