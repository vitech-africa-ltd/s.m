import { useState, useEffect } from 'react';
import { translateText, detectLanguage, TRANSLATION_PROVIDERS, type TranslationResult } from '../utils/aiTranslation';
import { Ic } from './icons';
import { toast } from './ui';

interface AITranslationPanelProps {
  text: string;
  onTranslation?: (translated: string) => void;
  targetLang?: string;
}

export function AITranslationPanel({ text, onTranslation, targetLang = 'fr' }: AITranslationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>('en');
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [showProviders, setShowProviders] = useState(false);

  useEffect(() => {
    if (text && isExpanded) {
      handleTranslate();
    }
  }, [text, targetLang, isExpanded]);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      // Detect language first
      const detection = await detectLanguage(text);
      setDetectedLang(detection.language);

      // Translate
      const result = await translateText(text, targetLang, detection.language, selectedProvider);
      setTranslation(result);

      if (onTranslation) {
        onTranslation(result.translated);
      }
    } catch (error) {
      toast('Translation failed', 'err');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (translation) {
      navigator.clipboard.writeText(translation.translated);
      toast('Translation copied to clipboard');
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cobalt-500 to-cobalt-600 text-white hover:from-cobalt-600 hover:to-cobalt-700 transition-all shadow-lg hover:shadow-xl"
      >
        <Ic n="sparkles" size={16} />
        <span className="text-sm font-semibold">AI Translate</span>
        <Ic n={isExpanded ? "chevU" : "chevD"} size={14} />
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cobalt-500 to-cobalt-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Ic n="sparkles" size={20} />
                <h3 className="font-bold text-lg">AI Translation</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <Ic n="x" size={18} />
              </button>
            </div>
            <p className="text-sm opacity-90">Powered by advanced AI translation</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Provider Selection */}
            <div className="relative">
              <label className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1 block">
                Translation Provider
              </label>
              <button
                onClick={() => setShowProviders(!showProviders)}
                className="w-full flex items-center justify-between px-3 py-2 border border-ink-200 dark:border-ink-700 rounded-lg hover:border-cobalt-400 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {TRANSLATION_PROVIDERS.find(p => p.id === selectedProvider)?.icon}
                  </span>
                  <span className="text-sm font-semibold">
                    {TRANSLATION_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                  </span>
                </span>
                <Ic n={showProviders ? "chevU" : "chevD"} size={14} />
              </button>

              {showProviders && (
                <div className="absolute top-full mt-1 w-full bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg z-10">
                  {TRANSLATION_PROVIDERS.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setShowProviders(false);
                        handleTranslate();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
                    >
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-sm font-semibold">{provider.name}</span>
                      {provider.id === selectedProvider && (
                        <Ic n="check" size={14} className="ml-auto text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Detection */}
            <div className="flex items-center gap-2 p-3 bg-ink-50 dark:bg-ink-800 rounded-lg">
              <Ic n="globe" size={16} className="text-cobalt-500" />
              <span className="text-sm">
                Detected language: <strong className="uppercase">{detectedLang}</strong>
              </span>
            </div>

            {/* Original Text */}
            <div>
              <label className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1 block">
                Original Text
              </label>
              <div className="p-3 bg-ink-50 dark:bg-ink-800 rounded-lg border border-ink-200 dark:border-ink-700">
                <p className="text-sm text-ink-700 dark:text-ink-300 line-clamp-3">{text}</p>
              </div>
            </div>

            {/* Translation Result */}
            {isTranslating ? (
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-cobalt-50 to-cobalt-100 dark:from-cobalt-900/20 dark:to-cobalt-800/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin">
                    <Ic n="sparkles" size={20} className="text-cobalt-500" />
                  </div>
                  <span className="text-sm font-semibold text-cobalt-700 dark:text-cobalt-300">
                    Translating with AI...
                  </span>
                </div>
              </div>
            ) : translation ? (
              <div>
                <label className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1 block">
                  Translation ({targetLang.toUpperCase()})
                </label>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                    {translation.translated}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                    <Ic n="check" size={12} className="text-emerald-500" />
                    <span>Confidence: {Math.round(translation.confidence * 100)}%</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-900/20 rounded transition-colors"
                  >
                    <Ic n="copy" size={12} />
                    Copy
                  </button>
                </div>
              </div>
            ) : null}

            {/* Retry Button */}
            {!isTranslating && (
              <button
                onClick={handleTranslate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cobalt-500 text-white rounded-lg hover:bg-cobalt-600 transition-colors font-semibold text-sm"
              >
                <Ic n="refresh" size={14} />
                Retry Translation
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-ink-50 dark:bg-ink-800 border-t border-ink-200 dark:border-ink-700">
            <p className="text-xs text-ink-500 dark:text-ink-400 text-center">
              Powered by {TRANSLATION_PROVIDERS.find(p => p.id === selectedProvider)?.name} AI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
