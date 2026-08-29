import { createNeteaseCookieHeaders } from './neteaseCookie';
import { createQQCookieHeaders } from './qqCookie';
import type { CloudPlaylistSummary, MusicProvider, NeteaseSong, SavedPlaylist } from '../types';
import {
  buildNeteasePlaybackUrl,
  buildQQPlaybackUrl,
  type PlaybackQualitySettings,
} from './playbackQuality';
import {
  PLAYLIST_STORAGE_KEY,
  createDefaultPlaylists,
  normalizeSavedPlaylists,
} from './uiStorage';

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface SongListPayload {
  songs?: NeteaseSong[];
  playlists?: CloudPlaylistSummary[];
  status?: string;
  fallback?: boolean;
  rawCount?: number;
  loadedCount?: number;
  totalCount?: number;
  rawTrackCount?: number;
  playlist?: { trackCount?: number };
  error?: string;
}

// ── API 代理 base 解析 ──
// 优先级：localStorage `sonic-topography:api-proxy` → VITE_API_PROXY 环境变量 → ''（同源）
// 网页版静态部署时，把 base 指向你的 EdgeOne Makers 代理域名（例如 https://sonic-proxy.edgeone.app）
const API_PROXY_STORAGE_KEY = 'sonic-topography:api-proxy';
let cachedApiBase: string | null = null;

export function getApiProxyStorage(): string {
  if (typeof window === 'undefined') return '';
  return (window.localStorage.getItem(API_PROXY_STORAGE_KEY) || '').trim();
}

export function setApiProxyStorage(value: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (trimmed) window.localStorage.setItem(API_PROXY_STORAGE_KEY, trimmed);
  else window.localStorage.removeItem(API_PROXY_STORAGE_KEY);
  cachedApiBase = null;
}

export function resolveApiBase(): string {
  if (cachedApiBase !== null) return cachedApiBase;
  const fromStorage = getApiProxyStorage();
  const fromEnv = (import.meta.env.VITE_API_PROXY as string | undefined)?.trim().replace(/\/+$/, '') || '';
  const base = (fromStorage || fromEnv).replace(/\/+$/, '');
  cachedApiBase = base;
  return base;
}

export function api(path: string): string {
  const base = resolveApiBase();
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, init);
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json() as T,
  };
}

export function providerCookieHeaders(provider: MusicProvider, cookie: string) {
  return provider === 'qq' ? createQQCookieHeaders(cookie) : createNeteaseCookieHeaders(cookie);
}

export function syncNeteaseProxyCookie(cookie: string) {
  return requestJson<{ valid?: boolean }>(api('/sonic/netease/cookie'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cookie }),
  });
}

export function syncQQProxyCookie(cookie: string) {
  return requestJson<{ loggedIn?: boolean }>(api('/sonic/qq/login/cookie'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cookie }),
  });
}

export async function logoutQQProxy() {
  await fetch(api('/sonic/qq/logout'));
}

export function loadServerPlaylists() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(PLAYLIST_STORAGE_KEY) : null;
    const playlists = raw ? normalizeSavedPlaylists(JSON.parse(raw)) : createDefaultPlaylists();
    return Promise.resolve({ ok: true, status: 200, data: { playlists } });
  } catch {
    return Promise.resolve({ ok: true, status: 200, data: { playlists: createDefaultPlaylists() } });
  }
}

export function saveServerPlaylists(playlists: SavedPlaylist[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlists));
  }
  return Promise.resolve({ ok: true, status: 200, data: { playlists } });
}

export function loadCloudPayload<T = SongListPayload>(url: string, provider: MusicProvider, cookie: string) {
  return requestJson<T>(url, { headers: providerCookieHeaders(provider, cookie) });
}

export function buildMusicSearchUrl(provider: MusicProvider, keywords: string, hasCookie: boolean) {
  const encoded = encodeURIComponent(keywords);
  if (provider === 'qq') return api(`/sonic/qq/search?keywords=${encoded}&limit=30`);
  return api(`/sonic/netease/search?keywords=${encoded}${hasCookie ? '&limit=30' : ''}`);
}

export function searchCloudMusic(provider: MusicProvider, keywords: string, cookie: string) {
  return loadCloudPayload(
    buildMusicSearchUrl(provider, keywords, Boolean(cookie)),
    provider,
    cookie,
  );
}

export function loadSongLyrics(song: NeteaseSong, neteaseCookie: string, qqCookie: string) {
  const provider = song.provider || 'netease';
  if (provider === 'qq') {
    const mid = song.mid || song.songmid || String(song.id);
    return loadCloudPayload<{ lyric?: string; translatedLyric?: string; tlyric?: string; qrc?: string }>(
      api(`/sonic/qq/lyric?mid=${encodeURIComponent(mid)}&id=${encodeURIComponent(String(song.qqId || ''))}`),
      provider,
      qqCookie,
    );
  }
  return loadCloudPayload<{ lyric?: string; translatedLyric?: string; tlyric?: string; qrc?: string }>(
    api(`/sonic/netease/lyric?id=${encodeURIComponent(String(song.id))}`),
    provider,
    neteaseCookie,
  );
}

export async function loadSongPlaybackResources(
  song: NeteaseSong,
  settings: PlaybackQualitySettings,
  neteaseCookie: string,
  qqCookie: string,
) {
  const provider = song.provider || 'netease';
  if (provider === 'qq') {
    const mid = song.mid || song.songmid || String(song.id);
    const qqSong = { mid, mediaMid: song.mediaMid || '' };
    const [playback, lyrics] = await Promise.all([
      loadCloudPayload<{ url?: string; message?: string }>(
        buildQQPlaybackUrl(api('/sonic/qq/song/url'), qqSong, settings), provider, qqCookie,
      ),
      loadSongLyrics(song, neteaseCookie, qqCookie),
    ]);
    return { provider, qqSong, urlData: playback.data, lyricData: lyrics.data };
  }
  const [playback, lyrics] = await Promise.all([
    loadCloudPayload<{ url?: string; message?: string }>(
      buildNeteasePlaybackUrl(api('/sonic/netease/url'), song.id, settings), provider, neteaseCookie,
    ),
    loadSongLyrics(song, neteaseCookie, qqCookie),
  ]);
  return { provider, urlData: playback.data, lyricData: lyrics.data };
}
