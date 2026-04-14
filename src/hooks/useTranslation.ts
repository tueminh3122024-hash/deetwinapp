import { useHealthStore } from '../store/useHealthStore';
import { TRANSLATIONS, Language } from '../constants/translations';

export const useTranslation = () => {
  const language = useHealthStore((state) => state.language);
  
  const t = (key: keyof typeof TRANSLATIONS.vn): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.vn[key];
  };

  return { t, language };
};
