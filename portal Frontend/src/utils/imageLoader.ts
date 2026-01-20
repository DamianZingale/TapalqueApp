/**
 * Sistema de gestión de imágenes con fallbacks robustos
 */

export interface ImageConfig {
  url: string;
  fallbacks: string[];
  category: 'comercio' | 'gastronomia' | 'hospedaje' | 'servicios' | 'eventos' | 'espacios' | 'termas';
}

// Base64 placeholders pequeños para carga instantánea
const PLACEHOLDERS = {
  comercio: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJvbGljbyBkZSBDb21lcmNpbzwvdGV4dD48L3N2Zz4=',
  gastronomia: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOGY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhc3Rybm9taWE8L3RleHQ+PC9zdmc+',
  hospedaje: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTlmNmU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhvc3BlZGFqZTwvdGV4dD48L3N2Zz4=',
  servicios: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTllOWU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNlcnZpY2lvczwvdGV4dD48L3N2Zz4=',
  eventos: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBlOGY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50b3M8L3RleHQ+PC9zdmc+',
  espacios: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTlmMGU4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVzcGFjaW9zIFB1YmxpY29zPC90ZXh0Pjwvc3ZnPg==',
  termas: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThmNmU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlcm1hczwvdGV4dD48L3N2Zz4='
};

// Imágenes locales de respaldo (copiar estas imágenes a public/images/)
const LOCAL_FALLBACKS = {
  comercio: [
    '/images/fallback/comercio-1.jpg',
    '/images/fallback/comercio-2.jpg',
    '/images/fallback/comercio-3.jpg'
  ],
  gastronomia: [
    '/images/fallback/gastronomia-1.jpg',
    '/images/fallback/gastronomia-2.jpg',
    '/images/fallback/gastronomia-3.jpg'
  ],
  hospedaje: [
    '/images/fallback/hospedaje-1.jpg',
    '/images/fallback/hospedaje-2.jpg',
    '/images/fallback/hospedaje-3.jpg'
  ],
  servicios: [
    '/images/fallback/servicios-1.jpg',
    '/images/fallback/servicios-2.jpg',
    '/images/fallback/servicios-3.jpg'
  ],
  eventos: [
    '/images/fallback/eventos-1.jpg',
    '/images/fallback/eventos-2.jpg',
    '/images/fallback/eventos-3.jpg'
  ],
  espacios: [
    '/images/fallback/espacios-1.jpg',
    '/images/fallback/espacios-2.jpg',
    '/images/fallback/espacios-3.jpg'
  ],
  termas: [
    '/images/fallback/termas-1.jpg',
    '/images/fallback/termas-2.jpg',
    '/images/fallback/termas-3.jpg'
  ]
};

/**
 * Clase para gestionar carga robusta de imágenes
 */
export class RobustImageLoader {
  private static cache = new Map<string, boolean>();
  
  /**
   * Verifica si una URL es accesible
   */
  static async isImageAccessible(url: string): Promise<boolean> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        this.cache.set(url, false);
        resolve(false);
      }, 3000); // 3 segundos timeout

      img.onload = () => {
        clearTimeout(timeout);
        this.cache.set(url, true);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        this.cache.set(url, false);
        resolve(false);
      };

      img.src = url;
    });
  }

  /**
   * Obtiene la primera imagen disponible de una lista
   */
  static async getFirstAvailableImage(
    urls: string[], 
    category: keyof typeof PLACEHOLDERS = 'servicios'
  ): Promise<string> {
    // Si no hay URLs, usar placeholder
    if (!urls || urls.length === 0) {
      return PLACEHOLDERS[category];
    }

    // Probar cada URL en orden
    for (const url of urls) {
      if (url && await this.isImageAccessible(url)) {
        return url;
      }
    }

    // Si ninguna funciona, probar fallbacks locales
    const localFallbacks = LOCAL_FALLBACKS[category];
    for (const fallback of localFallbacks) {
      if (await this.isImageAccessible(fallback)) {
        return fallback;
      }
    }

    // Último recurso: placeholder
    return PLACEHOLDERS[category];
  }

  /**
   * Precarga imágenes para mejorar rendimiento
   */
  static async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.isImageAccessible(url));
    await Promise.all(promises);
  }

  /**
   * Limpia el caché de imágenes
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Hook de React para cargar imágenes robustamente
 */
export function useRobustImage(
  initialUrl?: string, 
  category: keyof typeof PLACEHOLDERS = 'servicios'
) {
  const [imageUrl, setImageUrl] = useState<string>(
    initialUrl || PLACEHOLDERS[category]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImage = async (url?: string) => {
    if (!url) {
      setImageUrl(PLACEHOLDERS[category]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const availableUrl = await RobustImageLoader.getFirstAvailableImage(
        [url], 
        category
      );
      setImageUrl(availableUrl);
    } catch (err) {
      console.warn('Error cargando imagen:', err);
      setImageUrl(PLACEHOLDERS[category]);
      setError('No se pudo cargar la imagen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImage(initialUrl);
  }, [initialUrl, category]);

  return { imageUrl, loading, error, loadImage };
}