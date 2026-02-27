import type { Product, ProductFilters } from '../interfaces';
import axios from '../utils/axiosCustomize';
// ========== User API ==========

export const changePassword = (oldPassword: string, newPassword: string) => {
  const URL_BACKEND = '/user/change-password';
  const data = { oldPassword, newPassword };
  return axios.patch(URL_BACKEND, data);
};

// ========== Auth API ==========

export const register = (email: string, name: string, password: string) => {
  const URL_BACKEND = '/auth/register';
  const data = { email, name, password };
  return axios.post(URL_BACKEND, data);
};

export const login = (email: string, password: string) => {
  const URL_BACKEND = '/auth/login';
  const data = { email, password };
  return axios.post(URL_BACKEND, data, { withCredentials: true });
};

export const logout = () => {
  const URL_BACKEND = '/auth/logout';
  return axios.post(URL_BACKEND, {}, { withCredentials: true });
};

export const sendResetPassword = (email: string) => {
  const URL_BACKEND = '/auth/send-reset-password';
  const data = { email };
  return axios.post(URL_BACKEND, data);
};

export const resetPassword = (email: string, code: string, newPassword: string) => {
  const URL_BACKEND = '/auth/reset-password';
  const data = { email, code, newPassword };
  return axios.post(URL_BACKEND, data);
};

// ==================== PRODUCT API ====================

// Create review for product
export const createReview = (productID: number, rating: number, comment: string, orderItemID: number) => {
  const URL_BACKEND = `/product/reviews/${productID}`;
  return axios.post(URL_BACKEND, { orderItemID, rating, comment });
};


// Get products with pagination, search, filter
export const getProductsWithPaginate = (page: number, limit: number, keyword = "", category: string, factory: string) => {
  const URL_BACKEND = `/product/products-paginate?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&factory=${encodeURIComponent(factory)}`;
  return axios.get(URL_BACKEND);
};

// Get product details by ID
export const getProductByID = (id: string) => {
  const URL_BACKEND = `/product/products/${id}`;
  return axios.get(URL_BACKEND);
};
// Get top 5 best-selling laptops
export const getTopSellingLaptop = () => {
  const URL_BACKEND = `/product/top-selling-laptop`;
  return axios.get(URL_BACKEND);
};
// Get top 5 best-selling phones
export const getTopSellingPhone = () => {
  const URL_BACKEND = `/product/top-selling-phone`;
  return axios.get(URL_BACKEND);
};

// Get top 5 best-selling products
export const getTopSellingProduct = () => {
  const URL_BACKEND = `/product/top-selling-product`;
  return axios.get(URL_BACKEND);
};

// Filter products by category and filters
export const getFilteredProducts = async (category: string, filters: ProductFilters) => {
  const URL_BACKEND = `/product/filter-products`;
  return await axios.post(URL_BACKEND, { category, filters });
};

// Get all products
export const getAllProducts = () => {
  const URL_BACKEND = `/product/all-products`;
  return axios.get(URL_BACKEND);
};

// Add features to product
export const addProductFeatures = (productID: number, featureIDs: number[]) => {
  const URL_BACKEND = `/product/product-features/${productID}`;
  return axios.post(URL_BACKEND, { featureIDs });
};

// Delete feature from product
export const deleteProductFeature = (productID: number, featureID: number) => {
  const URL_BACKEND = `/product/product-feature?productID=${productID}&featureID=${featureID}`;
  return axios.delete(URL_BACKEND);
};

// Create new product
export const createProduct = (formData: FormData) => {
  const URL_BACKEND = `/product/product`;
  return axios.post(URL_BACKEND, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Update product information (excluding images)
export const updateProduct = (id: number, products: Product) => {
  const URL_BACKEND = `/product/products/${id}`;
  return axios.put(URL_BACKEND, products);
};

// Add multiple images to product
export const addProductImages = (id: number, formData: FormData) => {
  const URL_BACKEND = `/product/product-images/${id}`;
  return axios.post(URL_BACKEND, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete one image
export const deleteProductImage = (imageID: number) => {
  const URL_BACKEND = `/product/product-image/${imageID}`;
  return axios.delete(URL_BACKEND);
};

// Delete product by ID
export const deleteProduct = (id: number) => {
  const URL_BACKEND = `/product/products/${id}`;
  return axios.delete(URL_BACKEND);
};

// ==================== CART API ====================
export const getNumberCart = () => {
  const URL_BACKEND = `/cart/number-cart`;
  return axios.get(URL_BACKEND);
}

// CART API
export const addProductToCart = (productID: number) => {
  const URL_BACKEND = `/cart/cart`;
  return axios.post(URL_BACKEND, { productID });
};

export const buyNow = (productID: number) => {
  const URL_BACKEND = `/cart/buy-now?productID=${productID}`;
  return axios.post(URL_BACKEND);
};