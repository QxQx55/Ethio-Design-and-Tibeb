import { Profile, UserRole, Product, Category, Review } from '../types';
import { localClient, isLocalBackend, LocalChannelType, toErrorShape } from './localClient';

// The storefront talks to the bundled Node/SQLite backend (see backend/index.js),
// which exposes the same data shape the Supabase helpers used to return.
export const isSupabaseConfigured = isLocalBackend;

export const supabase = localClient;

/** Reject a hanging request instead of leaving the UI stuck on a spinner. */
const withTimeout = <T>(request: PromiseLike<T>, ms = 15000): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms);
    Promise.resolve(request).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String((error as any)?.message ?? error ?? '');

/** Network failures surface as a bare "TypeError: Failed to fetch" in browsers. */
export const isNetworkError = (error: unknown) =>
  /failed to fetch|networkerror|network request failed|load failed|fetch failed|offline|timed out|timeout|unable to reach/i.test(errorText(error));

export const friendlyErrorMessage = (error: unknown) =>
  isNetworkError(error)
    ? 'Unable to reach the server. Please check your connection and try again.'
    : errorText(error) || 'Something went wrong. Please try again.';

export const signUpUser = async (email: string, password: string, name: string, role: UserRole) => {
  return await withTimeout(supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      }
    }
  }));
};

export const signInUser = async (email: string, password: string) => {
  return await withTimeout(supabase.auth.signInWithPassword({
    email,
    password,
  }));
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await withTimeout(supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single());

  if (error) {
    console.warn('Error fetching user profile:', friendlyErrorMessage(error));
    return null;
  }

  return data as Profile;
};

export const uploadProductImage = async (file: File) => {
  // Client-side validation for better UX
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('Image size must be less than 5MB.');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await withTimeout(localClient.storage
      .from('product-images')
      .upload(filePath, file));

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = localClient.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(friendlyErrorMessage(error));
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await withTimeout(supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }));

  if (error) throw error;
  return (data ?? []) as Product[];
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await withTimeout(supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true }));

  if (error) throw error;
  return (data ?? []) as Category[];
};

export const getReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await withTimeout(supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false }));

    if (error) {
      console.warn('Reviews table fetch error:', friendlyErrorMessage(error));
      return [];
    }
    return (data ?? []) as Review[];
  } catch (error) {
    console.warn('Reviews unavailable:', friendlyErrorMessage(error));
    return [];
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  const { data, error } = await withTimeout(supabase.from('products').insert(productData).select().single());
  if (error) throw error;
  return data as Product;
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const { data, error } = await withTimeout(supabase.from('products').update(productData).eq('id', id).select().single());
  if (error) throw error;
  return data as Product;
};

export const deleteProduct = async (id: string) => {
  const { error } = await withTimeout(supabase.from('products').delete().eq('id', id));
  if (error) throw error;
  return true;
};

export const createCategory = async (name: string) => {
  const { data, error } = await withTimeout(supabase.from('categories').insert({ name }).select().single());
  if (error) throw error;
  return data as Category;
};

const subscribe = (table: string, callback: () => void): LocalChannelType | null => {
  if (!isSupabaseConfigured) return null;

  try {
    const channelId = `${table}-realtime-${Math.random().toString(36).substring(2, 10)}`;
    return supabase
      .channel(channelId)
      .on('postgres_changes', { table }, callback)
      .subscribe();
  } catch (error) {
    console.warn(`Could not subscribe to ${table} updates:`, friendlyErrorMessage(error));
    return null;
  }
};

export const subscribeToProducts = (callback: () => void) => subscribe('products', callback);

export const subscribeToCategories = (callback: () => void) => subscribe('categories', callback);

export { toErrorShape };
