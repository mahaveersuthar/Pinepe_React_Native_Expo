export interface User {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  full_name: string;
  profile_image: string;
  mpin_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  service_id?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
