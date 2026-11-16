import { createContext, useContext } from 'react';
import zh from '../data/zh-CN/portal.json';
import en from '../data/en-US/portal.json';

export const LanguageContext = createContext('zh-CN');
export function useTranslation(_namespace: string) {
  const language = useContext(LanguageContext);
  return { t: (key: string, options: Record<string, string> = {}) => {
    const data = language === 'en-US' ? en : zh;
    const value = key.split('.').reduce<any>((node, part) => node?.[part], data);
    return String(value ?? key).replace(/\{\{(\w+)\}\}/g, (_, name) => options[name] ?? '');
  }};
}
