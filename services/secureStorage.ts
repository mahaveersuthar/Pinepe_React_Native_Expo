const STORAGE: { [key: string]: string } = {};

const MPIN_KEY = 'user_mpin';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const secureStorage = {
  async setMPIN(mpin: string): Promise<void> {
    STORAGE[MPIN_KEY] = mpin;
  },

  async getMPIN(): Promise<string | null> {
    return STORAGE[MPIN_KEY] || null;
  },

  async deleteMPIN(): Promise<void> {
    delete STORAGE[MPIN_KEY];
  },

  async setAuthToken(token: string): Promise<void> {
    STORAGE[AUTH_TOKEN_KEY] = token;
  },

  async getAuthToken(): Promise<string | null> {
    return STORAGE[AUTH_TOKEN_KEY] || null;
  },

  async deleteAuthToken(): Promise<void> {
    delete STORAGE[AUTH_TOKEN_KEY];
  },

  async setUserData(userData: string): Promise<void> {
    STORAGE[USER_DATA_KEY] = userData;
  },

  async getUserData(): Promise<string | null> {
    return STORAGE[USER_DATA_KEY] || null;
  },

  async deleteUserData(): Promise<void> {
    delete STORAGE[USER_DATA_KEY];
  },

  async clearAll(): Promise<void> {
    Object.keys(STORAGE).forEach((key) => {
      delete STORAGE[key];
    });
  },
};
