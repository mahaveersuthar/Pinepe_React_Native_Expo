import * as SecureStore from 'expo-secure-store';

// Keys
const MPIN_KEY = 'user_mpin';
const AUTH_TOKEN_KEY = 'userToken'; // Changed from 'auth_token'
const USER_DATA_KEY = 'userData'; // Changed from 'user_data'
const HAS_OPENED_KEY = 'has_opened_before';

export const secureStorage = {
  // --- Onboarding ---
  async getHasOpened(): Promise<string | null> {
    return await SecureStore.getItemAsync(HAS_OPENED_KEY);
  },

  async setHasOpened(): Promise<void> {
    await SecureStore.setItemAsync(HAS_OPENED_KEY, 'true');
  },

  // --- MPIN ---
  async setMPIN(mpin: string): Promise<void> {
    await SecureStore.setItemAsync(MPIN_KEY, mpin);
  },

  async getMPIN(): Promise<string | null> {
    return await SecureStore.getItemAsync(MPIN_KEY);
  },

  async deleteMPIN(): Promise<void> {
    await SecureStore.deleteItemAsync(MPIN_KEY);
  },

  // --- Auth Token ---
  async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },

  async getAuthToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },

  async deleteAuthToken(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },

  // --- User Data ---
  async setUserData(userData: string): Promise<void> {
    await SecureStore.setItemAsync(USER_DATA_KEY, userData);
  },

  async getUserData(): Promise<string | null> {
    return await SecureStore.getItemAsync(USER_DATA_KEY);
  },

  async deleteUserData(): Promise<void> {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  },

 async clearAll(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_DATA_KEY);
  await SecureStore.deleteItemAsync(MPIN_KEY); // Clear MPIN on logout too
  // Intentionally keep HAS_OPENED_KEY so users don't see onboarding again
},
};