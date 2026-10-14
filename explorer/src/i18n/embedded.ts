import { loader } from '@monaco-editor/react';
import { uiLanguage } from './index';

// Serve the editor and its native language resources from the same installation.
// Monaco 0.55.1's AMD locale module is named nls.messages.zh-cn.js.
// The loader forwards AMD options; its declared shape only lists common options.
const monacoConfig = {
  baseUrl: new URL(`${import.meta.env.BASE_URL}assets/monaco/`, window.location.origin).href,
  paths: { vs: new URL(`${import.meta.env.BASE_URL}assets/monaco/vs`, window.location.origin).href },
  'vs/nls': { availableLanguages: { '*': uiLanguage === 'zh-CN' ? 'zh-cn.js' : 'en' } },
};
loader.config(monacoConfig);
