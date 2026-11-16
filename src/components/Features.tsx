import { LanguageContext } from '../lib/use-translation';
import { PortalFeatures } from './PortalFeatures';
export default function Features({ language }: { language: string }) {
  return <LanguageContext.Provider value={language}><PortalFeatures /></LanguageContext.Provider>;
}
