import type { NeteaseSong } from '../types';
import type { PlaybackQualitySettings } from './playbackQuality';
import { getSiteConfig } from './siteConfig';

// 初叶 Meting API（metowolf 衍生实现）。
// 与标准 metowolf 的差异（已实测确认）：
//  - Base 路径为 /api，例如 https://meting.yufish.cn/api
//  - 返回字段是 title / author / url / pic / lrc（非 name / artist）
//  - url / pic / lrc 是“接口自身地址”，加载时会 302 跳转到真实资源
//  - type=lrc 直接返回纯文本歌词（非 JSON）
//  - type=url 返回 302 跳转到真实音频；部分服务端 netease 解析异常会 404
//  - 该实例不支持 br 参数（带 br 会 404），故播放链接不附带码率
export type MetingServer = 'netease' | 'tencent' | 'kugou';

const STORAGE_KEY_BASE = 'sonic-topography:meting-api';
const STORAGE_KEY_SERVER = 'sonic-topography:meting-server';
const STORAGE_KEY_BITRATE = 'sonic-topography:meting-bitrate';

// 该实例 netease 的 type=url 普遍 404，默认走可用的 tencent。
const DEFAULT_SERVER: MetingServer = 'tencent';

let cachedBase: string | null = null;
let configPromise: Promise<string> | null = null;

function normalizeBase(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  // 去掉结尾斜杠，buildUrl 会自行拼接 "?query"
  return trimmed.replace(/\/+$/, '');
}

export function getMetingServer(): MetingServer {
  if (typeof window === 'undefined') return DEFAULT_SERVER;
  const fromStorage = window.localStorage.getItem(STORAGE_KEY_SERVER);
  if (fromStorage) return fromStorage as MetingServer;
  const fromSite = getSiteConfig()?.metingServer;
  if (fromSite) return fromSite as MetingServer;
  return DEFAULT_SERVER;
}

export function setMetingServer(server: MetingServer) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY_SERVER, server);
}

export function getMetingBitrate(): string {
  if (typeof window === 'undefined') return '320';
  const fromStorage = window.localStorage.getItem(STORAGE_KEY_BITRATE);
  if (fromStorage) return fromStorage;
  const fromSite = getSiteConfig()?.metingBitrate;
  if (fromSite) return fromSite;
  return '320';
}

export function setMetingBitrate(br: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY_BITRATE, br);
}

// 保留以便与音质设置联动；注意该 Meting 实例实际不接收 br 参数。
export function metingBrFromSettings(settings: PlaybackQualitySettings): string {
  switch (settings.neteaseBitrate) {
    case '128000':
      return '128';
    case '192000':
      return '192';
    case '320000':
      return '320';
    default:
      return '320';
  }
}

// 解析顺序：
// 1. 设置面板运行时填写（localStorage 覆盖）
// 2. 应用启动前注入的 window.__SONIC_METING_API__
// 3. 随站发布的 public/meting-config.json 的 base 字段
// 4. 构建变量 VITE_METING_API
export async function resolveMetingBase(force = false): Promise<string> {
  if (!force && cachedBase !== null) return cachedBase;
  if (configPromise && !force) return configPromise;
  configPromise = (async () => {
    const override = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_BASE) : null;
    if (override && override.trim()) {
      cachedBase = normalizeBase(override);
      return cachedBase;
    }
    const winBase = typeof window !== 'undefined' ? (window as any).__SONIC_METING_API__ : null;
    if (winBase && winBase.trim()) {
      cachedBase = normalizeBase(winBase);
      return cachedBase;
    }
    try {
      const baseUrl = (import.meta.env as any).BASE_URL || '/';
      const res = await fetch(`${baseUrl}meting-config.json`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const cfg = normalizeBase(json?.base || json?.api || '');
        if (cfg) {
          cachedBase = cfg;
          return cachedBase;
        }
      }
    } catch {
      // 配置文件可选，回退到构建变量默认值
    }
    // 站点级 site-config.json5 的 metingBase（集中管理，优先级低于上面的 meting-config.json）
    const siteBase = normalizeBase(getSiteConfig()?.metingBase || '');
    if (siteBase) {
      cachedBase = siteBase;
      return cachedBase;
    }
    cachedBase = normalizeBase((import.meta.env as any).VITE_METING_API || '');
    return cachedBase;
  })();
  return configPromise;
}

export function setMetingBase(base: string) {
  const v = normalizeBase(base);
  if (typeof window !== 'undefined') {
    if (v) window.localStorage.setItem(STORAGE_KEY_BASE, v);
    else window.localStorage.removeItem(STORAGE_KEY_BASE);
  }
  cachedBase = v;
  configPromise = null;
}

// base 已是完整 origin+path（如 https://meting.yufish.cn/api），直接拼接 "?query"
function buildUrl(base: string, params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${base}?${qs}`;
}

function extractIdFromUrl(url?: string): string {
  if (!url) return '';
  const m = /[?&]id=([^&]+)/.exec(url);
  return m ? decodeURIComponent(m[1]) : '';
}

function mapMetingItem(it: any, server: MetingServer): NeteaseSong {
  return {
    provider: 'meting',
    metingServer: server,
    // 搜索/歌单结果不含顶层 id，从 url 端点里解析
    id: extractIdFromUrl(it.url) || it.id || '',
    name: it.title || 'Unknown',
    artist: it.author || 'Unknown artist',
    album: it.album || '',
    // it.pic 已是 CDN 直链（Meting 侧由 pic_id 直拼 y.gtimg.cn，不再走会降级的 type=pic 端点），可直接作为 <img src>
    cover: it.pic || '',
    // url 是接口端点（302 到真实音频），可直接作为 <audio src>
    url: it.url || '',
    // lrc 是接口端点，按需 fetch 为纯文本歌词
    lyric: it.lrc || '',
    duration: Number(it.duration || 0),
    fee: 0,
  };
}

export async function searchMeting(keywords: string, server: MetingServer = getMetingServer()): Promise<NeteaseSong[]> {
  const base = await resolveMetingBase();
  if (!base) throw new Error('Meting API base 未配置');
  const url = buildUrl(base, { server, type: 'search', id: keywords });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meting 搜索请求失败 (HTTP ${res.status})`);
  const items = await res.json();
  return Array.isArray(items) ? items.map((it: any) => mapMetingItem(it, server)) : [];
}

// 返回 type=url 接口端点（浏览器 media 元素加载时自动跟随 302 到真实音频）。
// 注意：该实例不支持 br，故不附带码率参数（带 br 会 404）。
export async function getMetingSongUrl(id: string | number, server: MetingServer): Promise<string> {
  const base = await resolveMetingBase();
  if (!base) return '';
  return buildUrl(base, { server, type: 'url', id: String(id) });
}

// target 可为：lrc 接口端点 URL（来自 song.lyric），或直接传歌曲 id（自动构造 lrc 端点）。
// type=lrc 直接返回纯文本，故用 res.text() 解析。
export async function getMetingLyric(target: string, server?: MetingServer): Promise<{ lyric: string; translatedLyric: string }> {
  const base = await resolveMetingBase();
  if (!base) return { lyric: '', translatedLyric: '' };
  let url: string;
  if (/^https?:\/\//.test(target)) {
    url = target;
  } else {
    url = buildUrl(base, { server: server || getMetingServer(), type: 'lrc', id: target });
  }
  try {
    const res = await fetch(url);
    if (!res.ok) return { lyric: '', translatedLyric: '' };
    const text = await res.text();
    return { lyric: text || '', translatedLyric: '' };
  } catch {
    return { lyric: '', translatedLyric: '' };
  }
}

export async function getMetingPlaylist(id: string | number, server: MetingServer = getMetingServer()): Promise<NeteaseSong[]> {
  const base = await resolveMetingBase();
  if (!base) throw new Error('Meting API base 未配置');
  const url = buildUrl(base, { server, type: 'playlist', id: String(id) });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meting 歌单请求失败 (HTTP ${res.status})`);
  const items = await res.json();
  const songs = Array.isArray(items) ? items.map((it: any) => mapMetingItem(it, server)) : [];
  // 注意：封面预热不再在「歌单加载时」全量触发，而是改到「播放某首时」预热它周围的歌
  // （见 UI.tsx loadNeteaseSong），避免整张歌单一次性打爆代理。
  return songs;
}

// 封面图片代理：腾讯/QQ 音乐官方图片 CDN（y.gtimg.cn / y.qq.com）不返回
// Access-Control-Allow-Origin，导致 THREE.TextureLoader 跨域读像素被污染、纹理加载失败
// （这正是「播放条封面正常、3D 背景封面不显示」的根因：<img> 不需读像素，WebGL 纹理需要）。
// 解决办法：把缺 CORS 的图片 URL 包一层返回 Access-Control-Allow-Origin: * 的图片代理。
const PIC_PROXY_STORAGE_KEY = 'sonic-topography:meting-pic-proxy';
// 自建图片代理（edgeone /pic，替代第三方 weserv）：回源抓字节并补 Access-Control-Allow-Origin: *
// ⚠️ 路由形态坑（已踩）：Makers 的 catch-all [[default]].js 仅匹配「带子路径段」的请求
//   （官方示例 /api/1024，不命中根路径 /api/）。/qq-lyric 能跑正是因为实际访问 /qq-lyric/lyric/... 带段；
//   而 /pic/?url= 是根路径（空段）→ catch-all 不命中 → 平台 404。
//   故这里必须用 /pic/fetch?url= （带 /fetch 子段）而非 /pic/?url=。函数端读 ?url= 不变。
const DEFAULT_PIC_PROXY = 'https://proxy-api.x1anyu.cn/pic/fetch?url=';

// 需要走代理的、已知缺 CORS 的图片 CDN 主机（腾讯系 + 网易云图片 CDN）。
// 注：Meting 的 pic 端点（meting.yufish.cn/api/?...type=pic，会 302 跳上述 CDN）不在该列表，
// 由下方 resolveCoverUrl 用「含 type=pic」额外兜住。
const CORS_BROKEN_HOSTS = ['y.gtimg.cn', 'y.qq.com', 'qpic.cn', 'music.126.net'];

export function getPicProxy(): string {
  if (typeof window === 'undefined') return DEFAULT_PIC_PROXY;
  const fromStorage = window.localStorage.getItem(PIC_PROXY_STORAGE_KEY);
  // 允许显式设为空字符串来禁用代理（直连）。
  if (fromStorage !== null) return fromStorage;
  const fromSite = getSiteConfig()?.picProxy;
  if (fromSite) return fromSite;
  return DEFAULT_PIC_PROXY;
}

export function setPicProxy(proxy: string) {
  if (typeof window === 'undefined') return;
  if (proxy) window.localStorage.setItem(PIC_PROXY_STORAGE_KEY, proxy);
  else window.localStorage.removeItem(PIC_PROXY_STORAGE_KEY);
}

// 把封面 URL 包装成可被 WebGL 纹理读取的 URL。
// 命中以下任一情况才加代理前缀，其余（同源/CORS 正常/自定义封面上传）原样返回：
//   - 目标主机属于已知缺 CORS 的图片 CDN（腾讯系 / 网易云）；
//   - 目标本身是 Meting 的 pic 端点（含 type=pic，会 302 跳 CDN，由代理侧 follow 吃掉）。
export function resolveCoverUrl(url: string): string {
  const clean = (url || '').trim();
  if (!clean) return '';
  let host = '';
  try {
    host = new URL(clean).hostname.toLowerCase();
  } catch {
    return clean;
  }
  const broken =
    CORS_BROKEN_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ||
    clean.includes('type=pic');
  if (!broken) return clean;
  const proxy = getPicProxy();
  if (!proxy) return clean; // 代理被显式禁用，直连（纹理可能仍无法读取）
  // 整体 encodeURIComponent，避免 CDN URL 自带的 ?/& 破坏外层查询串（修复此前未编码的隐患）
  return `${proxy}${encodeURIComponent(clean)}`;
}

// 封面缓存预热：歌单加载完成后，仅对【前几首】封面触发一次代理回源，把图片填进 EdgeOne 边缘缓存。
// 这样用户从头播时，MapScene 的 THREE.TextureLoader 请求同一 URL 会命中边缘缓存、秒出；
// 切到更后面的歌时，该封面被实际播放请求触发、同样回源一次并写入边缘缓存（TTL 1 天），
// 之后再次切回即秒出——「带缓存缓解」而非「一次性全量预热」，避免整张歌单打爆代理/请求数飙升。
// 用 new Image() 轻量触发（图片元素加载跨域不读像素、不触发 CORS 预检），fire-and-forget，不阻塞 UI。
const COVER_WARM_MAX = 4; // 总共只预热前 N 首（用户要求：不要全量，靠边缘缓存扛其余）
const COVER_WARM_LIMIT = 4; // 并发上限
let coverWarmActive = 0;
const coverWarmQueue: Array<() => void> = [];
function coverWarmDrain() {
  while (coverWarmActive < COVER_WARM_LIMIT && coverWarmQueue.length) {
    const task = coverWarmQueue.shift()!;
    coverWarmActive++;
    Promise.resolve()
      .then(task)
      .finally(() => {
        coverWarmActive--;
        coverWarmDrain();
      });
  }
}
export function warmCoverCache(urls: Array<string | undefined | null>) {
  if (typeof window === 'undefined') return;
  const seen = new Set<string>();
  const selected: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    const proxied = resolveCoverUrl(u);
    if (!/^https?:\/\//.test(proxied)) continue; // 无需代理的（同源/CORS 正常）跳过预热
    if (seen.has(proxied)) continue; // 同封面去重，避免重复打
    seen.add(proxied);
    selected.push(proxied);
    if (selected.length >= COVER_WARM_MAX) break; // 只取前 N 首，其余交给边缘缓存按需命中
  }
  for (const proxied of selected) {
    coverWarmQueue.push(() => new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // 加载失败也放行，不阻塞并发位
      img.src = proxied;
      // 兜底超时：个别图卡住时释放并发位，避免暖机卡死
      setTimeout(() => resolve(), 8000);
    }));
  }
  coverWarmDrain();
}
