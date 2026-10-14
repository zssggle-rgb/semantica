import { loader } from '@monaco-editor/react';
import { uiLanguage } from './index';

// Serve the editor and its native language resources from the same installation.
// Pin the compatible native AMD distribution, including its Chinese resources.
loader.config({
  paths: { vs: new URL(`${import.meta.env.BASE_URL}assets/monaco/vs`, window.location.origin).href },
  'vs/nls': { availableLanguages: { '*': uiLanguage === 'zh-CN' ? 'zh-cn' : 'en' } },
});
