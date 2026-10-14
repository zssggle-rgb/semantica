import { useTranslation } from 'react-i18next';
import { selectUiLanguage, uiLanguage, type UiLanguage } from './index';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  return (
    <select
      aria-label={t('Interface language', { defaultValue: 'Interface language' })}
      title={t('Interface language', { defaultValue: 'Interface language' })}
      value={uiLanguage}
      onChange={(event) => selectUiLanguage(event.target.value as UiLanguage)}
      style={{ marginTop: 'auto', width: '100%', padding: '6px 2px', background: '#0b1624', color: '#dce8f4', border: '1px solid #263a50', borderRadius: 6, fontSize: 11 }}
    >
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
