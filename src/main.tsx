import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { loadSiteConfig } from './lib/siteConfig';
import './index.css';

// 首屏渲染前先拉取站点级配置文件（public/site-config.json5），
// 这样 App 初次渲染时所有 readXxxStorage 读取都能拿到「部署默认」而非仅代码内置默认。
// loadSiteConfig 内部带 3 秒超时，配置缺失/网络异常也不会卡住首屏。
async function bootstrap() {
  await loadSiteConfig();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
