// Servicio para obtener negocios del usuario administrador
import { api } from '../../../config/api';
import type { Business, BusinessType } from '../types';

// Interfaz de respuesta del backend para negocios
interface BusinessResponse {
  id: number | string;
  name?: string;
  nombre?: string;
  type?: BusinessType;
  tipo?: string;
  address?: string;
  direccion?: string;
  ubicacion?: string;
  imageUrl?: string;
  imagen?: string;
  email?: string;
  phone?: string;
  telefono?: string;
}

// Normalizar respuesta del backend a Business
function normalizeBusiness(raw: BusinessResponse, type: BusinessType): Business {
  return {
    id: String(raw.id),
    name: raw.name || raw.nombre || 'Sin nombre',
    type: type,
    address: raw.address || raw.direccion || raw.ubicacion || '',
    imageUrl: raw.imageUrl || raw.imagen,
    email: raw.email,
    phone: raw.phone || raw.telefono
  };
}

// Interfaz de respuesta del backend BusinessDTO
interface BusinessDTO {
  id: number;
  ownerId: number;
  ownerName: string;
  name: string;
  businessType: 'GASTRONOMIA' | 'HOSPEDAJE';
  externalBusinessId: number;
}

// Normalizar BusinessDTO a Business
function normalizeBusinessDTO(dto: BusinessDTO): Business {
  return {
    id: String(dto.externalBusinessId),
    name: dto.name,
    type: dto.businessType,
    address: '',
    imageUrl: undefined,
    email: undefined,
    phone: undefined
  };
}

// Obtener todos los negocios del usuario logueado
export async function fetchUserBusinesses(userId: string): Promise<Business[]> {
  try {
    const response = await api.get<BusinessDTO[]>(`/business/user/${userId}`);

    if (Array.isArray(response)) {
      return response.map(normalizeBusinessDTO);
    }

    return [];
  } catch (error) {
    console.error('Error fetching user businesses:', error);
    return [];
  }
}

// Obtener un negocio específico por ID y tipo
export async function fetchBusinessById(id: string, type: BusinessType): Promise<Business | null> {
  try {
    const endpoint = type === 'GASTRONOMIA'
      ? `/gastronomia/restaurants/${id}`
      : `/hospedajes/${id}`;

    const response = await api.get<BusinessResponse>(endpoint);

    if (response) {
      return normalizeBusiness(response, type);
    }

    return null;
  } catch (error) {
    console.error('Error fetching business by id:', error);
    return null;
  }
}

// Verificar si el usuario es dueño de un negocio
export async function isBusinessOwner(userId: string, businessId: string, type: BusinessType): Promise<boolean> {
  try {
    const businesses = await fetchUserBusinesses(userId);
    return businesses.some(b => b.id === businessId && b.type === type);
  } catch (error) {
    console.error('Error checking business ownership:', error);
    return false;
  }
}
