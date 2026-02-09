/**
 * OAuth Helper Module
 * Simplified OAuth flows for YouTube, Twitch, and Rumble
 */

import { randomBytes } from 'crypto';

/**
 * YouTube OAuth 2.0 Flow
 */
export class YouTubeOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      }).toString(),
    });

    return response.json();
  }

  /**
   * Get user info (channel info)
   */
  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.json();
  }
}

/**
 * Twitch OAuth 2.0 Flow
 */
export class TwitchOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'channel:manage:videos analytics:read:games user:read:email channel:read:subscriptions',
      state,
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }).toString(),
    });

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<any> {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    return response.json();
  }

  /**
   * Get user info
   */
  async getUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-ID': this.clientId,
      },
    });

    return response.json();
  }
}

/**
 * Rumble OAuth Flow
 */
export class RumbleOAuth {
  private apiKey: string;

  constructor(apiKey: string, _clientId: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get API access for Rumble
   * Rumble uses simpler API key based access
   */
  async authenticateUser(email: string, password: string): Promise<any> {
    const response = await fetch('https://rumble.com/api/User.Authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        email,
        password,
      }),
    });

    return response.json();
  }

  /**
   * Get channel info
   */
  async getChannelInfo(channelId: string): Promise<any> {
    const response = await fetch(
      `https://rumble.com/api/Channel.GetChannel?api_key=${this.apiKey}&channel_id=${channelId}`
    );

    return response.json();
  }

  /**
   * Get user info via API key
   */
  async getUserInfo(): Promise<any> {
    const response = await fetch(
      `https://rumble.com/api/User.GetUser?api_key=${this.apiKey}`
    );

    return response.json();
  }
}

/**
 * OAuth State Manager
 * Helper for managing OAuth state tokens and nonces
 */
export class OAuthStateManager {
  private states: Map<string, { timestamp: number; returnUrl: string }> = new Map();
  private stateTimeout = 10 * 60 * 1000; // 10 minutes

  /**
   * Generate new state token
   */
  generateState(returnUrl: string): string {
    const state = randomBytes(32).toString('hex');
    this.states.set(state, { timestamp: Date.now(), returnUrl });
    return state;
  }

  /**
   * Validate state token
   */
  validateState(state: string): { valid: boolean; returnUrl?: string } {
    const stored = this.states.get(state);

    if (!stored) {
      return { valid: false };
    }

    if (Date.now() - stored.timestamp > this.stateTimeout) {
      this.states.delete(state);
      return { valid: false };
    }

    this.states.delete(state);
    return { valid: true, returnUrl: stored.returnUrl };
  }

  /**
   * Clean up expired states
   */
  cleanup() {
    const now = Date.now();
    for (const [state, data] of this.states.entries()) {
      if (now - data.timestamp > this.stateTimeout) {
        this.states.delete(state);
      }
    }
  }
}

/**
 * Platform Auth Manager
 * Centralized management of platform authentication
 */
export class PlatformAuthManager {
  private youtubeOAuth?: YouTubeOAuth;
  private twitchOAuth?: TwitchOAuth;
  private stateManager = new OAuthStateManager();

  constructor(
    youtubeConfig?: { clientId: string; clientSecret: string; redirectUri: string },
    twitchConfig?: { clientId: string; clientSecret: string; redirectUri: string },
    _rumbleConfig?: { apiKey: string; clientId: string }
  ) {
    if (youtubeConfig) {
      this.youtubeOAuth = new YouTubeOAuth(
        youtubeConfig.clientId,
        youtubeConfig.clientSecret,
        youtubeConfig.redirectUri
      );
    }

    if (twitchConfig) {
      this.twitchOAuth = new TwitchOAuth(
        twitchConfig.clientId,
        twitchConfig.clientSecret,
        twitchConfig.redirectUri
      );
    }
  }

  /**
   * Get authorization URL for a platform
   */
  getAuthorizationUrl(platform: 'youtube' | 'twitch' | 'rumble', returnUrl: string): string {
    const state = this.stateManager.generateState(returnUrl);

    switch (platform) {
      case 'youtube':
        if (!this.youtubeOAuth) throw new Error('YouTube OAuth not configured');
        return this.youtubeOAuth.getAuthorizationUrl(state);

      case 'twitch':
        if (!this.twitchOAuth) throw new Error('Twitch OAuth not configured');
        return this.twitchOAuth.getAuthorizationUrl(state);

      case 'rumble':
        throw new Error('Rumble does not use OAuth flow');

      default:
        throw new Error('Unknown platform');
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    platform: 'youtube' | 'twitch' | 'rumble',
    code: string,
    state: string
  ): Promise<{ valid: boolean; token?: any; returnUrl?: string }> {
    const stateValid = this.stateManager.validateState(state);
    if (!stateValid.valid) {
      return { valid: false };
    }

    try {
      let token;

      switch (platform) {
        case 'youtube':
          if (!this.youtubeOAuth) throw new Error('YouTube OAuth not configured');
          token = await this.youtubeOAuth.exchangeCodeForToken(code);
          break;

        case 'twitch':
          if (!this.twitchOAuth) throw new Error('Twitch OAuth not configured');
          token = await this.twitchOAuth.exchangeCodeForToken(code);
          break;

        default:
          throw new Error('Unknown platform');
      }

      return {
        valid: true,
        token,
        returnUrl: stateValid.returnUrl,
      };
    } catch (error) {
      return { valid: false };
    }
  }
}

export default {
  YouTubeOAuth,
  TwitchOAuth,
  RumbleOAuth,
  OAuthStateManager,
  PlatformAuthManager,
};
