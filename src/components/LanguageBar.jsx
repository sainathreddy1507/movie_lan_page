import { LANGUAGES } from '../api/omdb';

export default function LanguageBar({ activeLang, onSelect }) {
  return (
    <div className="language-bar-wrapper">
      <div className="language-bar">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            className={`language-bar__btn ${activeLang === lang.id ? 'active' : ''}`}
            onClick={() => onSelect(lang.id)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
