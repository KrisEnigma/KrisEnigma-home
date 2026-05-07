import { ui, defaultLang, showDefaultLang, type Lang, type TranslationKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return (ui[lang] as Record<string, string>)[key] ?? (ui[defaultLang] as Record<string, string>)[key] ?? key;
  };
}

export function getLocalizedPath(lang: Lang, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang && !showDefaultLang) return cleanPath;
  return `/${lang}${cleanPath}`;
}

export function getAlternatePath(currentLang: Lang, currentPath: string): string {
  const alternateLang: Lang = currentLang === 'es' ? 'en' : 'es';
  // Strip current lang prefix if present
  let cleanPath = currentPath;
  if (cleanPath.startsWith(`/${currentLang}/`)) {
    cleanPath = cleanPath.replace(`/${currentLang}`, '');
  } else if (cleanPath === `/${currentLang}`) {
    cleanPath = '/';
  }
  return getLocalizedPath(alternateLang, cleanPath);
}

export function getAllLanguagePaths(currentPath: string, currentLang: Lang) {
  const langs: Lang[] = ['es', 'en'];
  let cleanPath = currentPath;
  // Strip any lang prefix
  for (const lang of langs) {
    if (cleanPath.startsWith(`/${lang}/`)) {
      cleanPath = cleanPath.replace(`/${lang}`, '');
      break;
    } else if (cleanPath === `/${lang}`) {
      cleanPath = '/';
      break;
    }
  }
  return langs.map(lang => ({
    lang,
    path: getLocalizedPath(lang, cleanPath),
    isCurrent: lang === currentLang
  }));
}
