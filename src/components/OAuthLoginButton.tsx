import { useState } from 'react';
import { OAUTH_PROVIDERS, simulateOAuthLogin, type OAuthProvider } from '../utils/oauth';

interface OAuthLoginButtonProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

export function OAuthLoginButtons({ onSuccess, onError }: OAuthLoginButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoading(provider.id);
    
    try {
      // Simulate OAuth login (in production, this would redirect to OAuth provider)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = simulateOAuthLogin(provider.id);
      
      if (onSuccess) {
        onSuccess(userData);
      }
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-200 dark:border-ink-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-paper dark:bg-ink-950 text-ink-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OAUTH_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleOAuthLogin(provider)}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-ink-200 dark:border-ink-700 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: loading === provider.id ? provider.color : undefined
            }}
          >
            {loading === provider.id ? (
              <span className="animate-spin">⚙️</span>
            ) : (
              <span className="text-xl">{provider.icon}</span>
            )}
            <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">
              {provider.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
