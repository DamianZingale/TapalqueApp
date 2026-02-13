import { useState, useEffect, CSSProperties } from 'react';

/**
 * Sistema de caché de imágenes para mejorar rendimiento
 */

interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  expiresAt: number;
}

class ImageCacheManager {
  private cache = new Map<string, CachedImage>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly MAX_CACHE_SIZE = 50; // Máximo 50 imágenes en caché
  private readonly STORAGE_KEY = 'tapalque_image_cache';

  constructor() {
    this.loadFromStorage();
    this.cleanupExpired();
  }

  /**
   * Guarda una imagen en caché
   */
  async cacheImage(url: string): Promise<string | null> {
    try {
      // Verificar si ya está en caché y no ha expirado
      const cached = this.cache.get(url);
      if (cached && cached.expiresAt > Date.now()) {
        return this.blobToUrl(cached.blob);
      }

      // Descargar la imagen
      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      const timestamp = Date.now();
      const expiresAt = timestamp + this.CACHE_DURATION;

      // Guardar en memoria
      const cachedImage: CachedImage = { url, blob, timestamp, expiresAt };
      this.cache.set(url, cachedImage);

      // Mantener el tamaño máximo del caché
      this.enforceMaxSize();

      // Guardar en storage persistente
      this.saveToStorage();

      return this.blobToUrl(blob);
    } catch (error) {
      console.warn('Error cacheando imagen:', error);
      return null;
    }
  }

  /**
   * Obtiene una imagen desde caché
   */
  getCachedImage(url: string): string | null {
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return this.blobToUrl(cached.blob);
    }
    return null;
  }

  /**
   * Precarga una lista de imágenes
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.cacheImage(url));
    await Promise.allSettled(promises);
  }

  /**
   * Limpia caché expirado
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [url, cached] of this.cache.entries()) {
      if (cached.expiresAt <= now) {
        this.cache.delete(url);
      }
    }
    this.saveToStorage();
  }

  /**
   * Limpia todo el caché
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Convierte blob a URL
   */
  private blobToUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Mantiene el tamaño máximo del caché
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    // Ordenar por timestamp (más viejos primero)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Eliminar las más viejas
    const toDelete = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
    toDelete.forEach(([url]) => this.cache.delete(url));
  }

  /**
   * Guarda caché en localStorage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const serialized = await this.serializeCache();
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Error guardando caché en storage:', error);
    }
  }

  /**
   * Carga caché desde localStorage
   */
  private loadFromStorage(): void {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) return;

      const cached = JSON.parse(serialized);
      // Reconstruir blobs desde datos base64
      this.reconstructFromSerialized(cached);
    } catch (error) {
      console.warn('Error cargando caché desde storage:', error);
    }
  }

  /**
   * Serializa el caché para almacenamiento
   */
  private async serializeCache(): Promise<string> {
    const serialized = new Map();
    
    for (const [url, cached] of this.cache.entries()) {
      const base64 = await this.blobToBase64(cached.blob);
      serialized.set(url, {
        ...cached,
        blob: base64
      });
    }
    
    return JSON.stringify(Array.from(serialized.entries()));
  }

  /**
   * Reconstruye blobs desde datos serializados
   */
  private async reconstructFromSerialized(serialized: any): Promise<void> {
    for (const [url, data] of serialized) {
      try {
        const blob = await this.base64ToBlob(data.blob);
        this.cache.set(url, {
          ...data,
          blob
        });
      } catch (error) {
        console.warn('Error reconstruyendo imagen cacheada:', error);
      }
    }
  }

  /**
   * Convierte blob a base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convierte base64 a blob
   */
  private base64ToBlob(base64: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      fetch(base64)
        .then(res => res.blob())
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats(): {
    size: number;
    maxSize: number;
    totalSize: number;
    expired: number;
  } {
    let totalSize = 0;
    let expired = 0;
    const now = Date.now();

    for (const cached of this.cache.values()) {
      totalSize += cached.blob.size;
      if (cached.expiresAt <= now) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      totalSize: Math.round(totalSize / 1024), // KB
      expired
    };
  }
}

// Instancia global del gestor de caché
export const imageCache = new ImageCacheManager();

/**
 * Hook de React para usar caché de imágenes
 */
export function useImageCache() {
  const [stats, setStats] = useState(() => imageCache.getStats());

  const cacheImage = async (url: string): Promise<string | null> => {
    const result = await imageCache.cacheImage(url);
    setStats(imageCache.getStats());
    return result;
  };

  const getCachedImage = (url: string): string | null => {
    return imageCache.getCachedImage(url);
  };

  const preloadImages = async (urls: string[]): Promise<void> => {
    await imageCache.preloadImages(urls);
    setStats(imageCache.getStats());
  };

  const clearCache = (): void => {
    imageCache.clearCache();
    setStats(imageCache.getStats());
  };

  return {
    stats,
    cacheImage,
    getCachedImage,
    preloadImages,
    clearCache
  };
}

/**
 * Componente de imagen con caché integrada
 */
export function CachedImage({ 
  src, 
  alt, 
  className = '',
  style = {},
  onCacheHit,
  onCacheMiss
}: {
  src?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  onCacheHit?: () => void;
  onCacheMiss?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { cacheImage, getCachedImage } = useImageCache();

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Intentar obtener desde caché
      const cached = getCachedImage(src);
      if (cached) {
        setImageUrl(cached);
        onCacheHit?.();
        setLoading(false);
        return;
      }

      // No está en caché, cargar y cachear
      onCacheMiss?.();
      const cachedUrl = await cacheImage(src);
      setImageUrl(cachedUrl || '');
      setLoading(false);
    };

    loadImage();
  }, [src, cacheImage, getCachedImage, onCacheHit, onCacheMiss]);

  if (loading) {
    return (
      <div 
        className={`${className} loading-shimmer`}
        style={style}
      />
    );
  }

  if (!imageUrl) {
    return (
      <div 
        className={`${className} bg-light d-flex align-items-center justify-content-center`}
        style={{ ...style, minHeight: '100px' }}
      >
        <span className="text-muted">No disponible</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}