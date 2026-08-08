import { Product, ProductsResponse } from "../types/product";
import { fetchWithRetry } from "../utils/fetchWithRetry";

const BASE_URL = "https://dummyjson.com";

export const getProducts = async (
  limit = 10,
  skip = 0,
  signal?: AbortSignal,
): Promise<ProductsResponse> => {
  const response = await fetchWithRetry(
    `${BASE_URL}/products?limit=${limit}&skip=${skip}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return response.json();
};

export const searchProducts = async (
  query: string,
  limit = 10,
  skip = 0,
  signal?: AbortSignal,
): Promise<ProductsResponse> => {
  const response = await fetchWithRetry(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.status}`);
  }

  return response.json();
};

export const getProductById = async (
  id: number,
  signal?: AbortSignal,
): Promise<Product> => {
  if (id <= 0) {
    throw new Error("Invalid product ID");
  }

  const response = await fetchWithRetry(`${BASE_URL}/products/${id}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${response.status}`);
  }

  return response.json();
};

