/**
 * Servicio de almacenamiento seguro de tokens
 * Evita almacenar tokens en localStorage (vulnerable a XSS)
 * Usa memory storage con refresh mechanism
 */

interface TokenData {
  accessToken: string;
  expiresAt: number;
}

class TokenStorage {
  private tokenData: TokenData | null = null;
  private readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutos antes de expirar

  /**
   * Almacena el token en memoria
   */
  setToken(token: string, expiresIn: number = 3600): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    this.tokenData = {
      accessToken: token,
      expiresAt
    };

    // Configurar auto-refresh si es necesario
    this.scheduleTokenRefresh();
  }

  /**
   * Obtiene el token si está disponible y no ha expirado
   */
  getToken(): string | null {
    if (!this.tokenData) {
      return null;
    }

    if (Date.now() >= this.tokenData.expiresAt) {
      this.clearToken();
      return null;
    }

    return this.tokenData.accessToken;
  }

  /**
   * Verifica si el token necesita ser refrescado
   */
  needsRefresh(): boolean {
    if (!this.tokenData) {
      return true;
    }

    return Date.now() >= (this.tokenData.expiresAt - this.TOKEN_REFRESH_BUFFER);
  }

  /**
   * Limpia el token almacenado
   */
  clearToken(): void {
    this.tokenData = null;
  }

  /**
   * Programa el refresco automático del token
   */
  private scheduleTokenRefresh(): void {
    if (!this.tokenData) return;

    const timeUntilRefresh = this.tokenData.expiresAt - Date.now() - this.TOKEN_REFRESH_BUFFER;

    if (timeUntilRefresh > 0) {
      setTimeout(() => {
        // Emit evento para que el AuthContext maneje el refresh
        window.dispatchEvent(new CustomEvent('token-refresh-needed'));
      }, timeUntilRefresh);
    }
  }

  /**
   * Verifica si hay un token válido
   */
  hasValidToken(): boolean {
    return this.getToken() !== null;
  }
}

// Instancia singleton
export const tokenStorage = new TokenStorage();

/**
 * Utilidad para sanitizar datos antes de enviarlos
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags basics
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
};

/**
 * Valida y escapa URLs antes de usarlas
 */
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);

    // Solo permitir protocolos seguros
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Encripta datos sensibles antes de almacenarlos temporalmente
 * (Nota: En producción considerar usar Web Crypto API)
 */
export const encodeData = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Error encoding data:', error);
    return '';
  }
};

export const decodeData = (encodedData: string): string => {
  try {
    return decodeURIComponent(atob(encodedData));
  } catch (error) {
    console.error('Error decoding data:', error);
    return '';
  }
};
