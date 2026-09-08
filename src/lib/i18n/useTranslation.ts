import { useLocaleStore } from '@/stores/locale.store';
import { idDictionary, Dictionary } from './dictionaries/id';
import { enDictionary } from './dictionaries/en';
import { SupportedLocale } from '@/lib/constants/locales';

const dictionaries: Record<SupportedLocale, Dictionary> = {
  'id-ID': idDictionary,
  'en-US': enDictionary,
};

export function getTranslation(locale: SupportedLocale): Dictionary {
  return dictionaries[locale] || dictionaries['id-ID'];
}

export function useTranslation() {
  const { uiLocale, setUiLocale, contentLocale, setContentLocale } = useLocaleStore();

  const dictionary = dictionaries[uiLocale] || dictionaries['id-ID'];

  return {
    t: dictionary,
    uiLocale,
    setUiLocale,
    contentLocale,
    setContentLocale,
    isIndonesian: uiLocale === 'id-ID',
    isEnglish: uiLocale === 'en-US',

    // Helper for formatting currency according to UI locale
    formatCurrency: (amount: number, currency = 'IDR') => {
      try {
        return new Intl.NumberFormat(uiLocale === 'id-ID' ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `${currency} ${amount.toLocaleString()}`;
      }
    },

    // Helper for formatting number
    formatNumber: (value: number) => {
      return new Intl.NumberFormat(uiLocale === 'id-ID' ? 'id-ID' : 'en-US').format(value);
    },
  };
}
