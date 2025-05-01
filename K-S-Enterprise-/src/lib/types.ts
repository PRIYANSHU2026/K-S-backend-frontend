export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory: string;
  features?: string[];
  specifications?: Record<string, string>;
  inStock?: boolean;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
}
