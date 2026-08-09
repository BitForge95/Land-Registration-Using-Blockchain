import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <div className="language-switcher">
      <span className="language-icon">🌐</span>
      <select
        className="language-select"
        value={i18n.resolvedLanguage || i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        aria-label={t('language.label')}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  );
}
