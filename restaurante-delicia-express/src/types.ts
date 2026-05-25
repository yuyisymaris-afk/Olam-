export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  address: string;
  fullName: string;
  ccNumber?: string;
  isAgeVerified: boolean;
  ccPhotoUrl?: string;
  birthDate?: string;
}

export interface ExtraIngredient {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  image: string;
  baseIngredients: string[];
  extraIngredientsAvailable: ExtraIngredient[];
}

export interface CartItem {
  cartItemId: string; // Unique ID for items in cart (even of the same product)
  product: Product;
  quantity: number;
  removedIngredients: string[];
  addedIngredients: { name: string; price: number }[];
  pricePerUnit: number; // Including additions
  totalPrice: number;
}

export type OrderStatus = 'Pendiente' | 'En Preparación' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  createdAt: string; // ISO date string
  status: OrderStatus;
  paymentMethod: 'Efectivo' | 'Tarjeta de Crédito' | 'Nequi' | 'Daviplata';
  estimatedArrivalMinutes: number;
  invoiceId: string;
}
