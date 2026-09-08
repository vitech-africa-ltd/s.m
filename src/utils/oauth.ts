/**
 * OAuth Authentication System
 * Supports Google, Facebook, GitHub, and other OAuth providers
 */

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  authUrl: string;
}

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔵',
    color: '#4285F4',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '🔷',
    color: '#1877F2',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '⚫',
    color: '#333',
    authUrl: 'https://github.com/login/oauth/authorize'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: '🟦',
    color: '#00A4EF',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  }
];

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

/**
 * Initialize OAuth flow
 */
export function initiateOAuth(provider: OAuthProvider, config: OAuthConfig): void {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state: generateState()
  });

  const authUrl = `${provider.authUrl}?${params.toString()}`;
  
  // Open OAuth window
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  const oauthWindow = window.open(
    authUrl,
    'OAuth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  // Listen for OAuth callback
  window.addEventListener('message', handleOAuthCallback);
}

/**
 * Handle OAuth callback
 */
function handleOAuthCallback(event: MessageEvent): void {
  if (event.data.type === 'oauth_callback') {
    const { code, state, provider } = event.data;
    
    // Verify state to prevent CSRF
    if (!verifyState(state)) {
      console.error('Invalid OAuth state');
      return;
    }

    // Exchange code for token (this would normally be done on the server)
    exchangeCodeForToken(code, provider)
      .then(token => {
        // Store token and user info
        storeOAuthToken(provider, token);
        // Close OAuth window
        window.close();
      })
      .catch(error => {
        console.error('OAuth error:', error);
      });
  }
}

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Verify OAuth state
 */
function verifyState(state: string): boolean {
  // In a real implementation, this would verify against stored state
  return state.length > 0;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string, provider: string): Promise<string> {
  // This would normally be done on the server for security
  // For demo purposes, we'll simulate the token exchange
  return `mock_token_${provider}_${Date.now()}`;
}

/**
 * Store OAuth token
 */
function storeOAuthToken(provider: string, token: string): void {
  localStorage.setItem(`oauth_token_${provider}`, token);
}

/**
 * Get stored OAuth token
 */
export function getOAuthToken(provider: string): string | null {
  return localStorage.getItem(`oauth_token_${provider}`);
}

/**
 * Remove OAuth token (logout)
 */
export function removeOAuthToken(provider: string): void {
  localStorage.removeItem(`oauth_token_${provider}`);
}

/**
 * Check if user is authenticated with OAuth
 */
export function isAuthenticatedWithOAuth(provider: string): boolean {
  return getOAuthToken(provider) !== null;
}

/**
 * OAuth Login Button Component Props
 */
export interface OAuthLoginButtonProps {
  provider: OAuthProvider;
  onSuccess?: (userData: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Mock OAuth user data (for demo purposes)
 */
export interface OAuthUserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: string;
}

/**
 * Simulate OAuth login (for demo)
 */
export function simulateOAuthLogin(provider: string): OAuthUserData {
  const mockUsers: Record<string, OAuthUserData> = {
    google: {
      id: 'google_123',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      picture: 'https://lh3.googleusercontent.com/a/default-user',
      provider: 'google'
    },
    facebook: {
      id: 'facebook_456',
      name: 'Jane Smith',
      email: 'jane.smith@facebook.com',
      picture: 'https://graph.facebook.com/123456789/picture',
      provider: 'facebook'
    },
    github: {
      id: 'github_789',
      name: 'Developer User',
      email: 'dev@github.com',
      picture: 'https://avatars.githubusercontent.com/u/12345678',
      provider: 'github'
    },
    microsoft: {
      id: 'microsoft_012',
      name: 'Corporate User',
      email: 'user@microsoft.com',
      picture: 'https://graph.microsoft.com/v1.0/me/photo/$value',
      provider: 'microsoft'
    }
  };

  return mockUsers[provider] || mockUsers.google;
}
