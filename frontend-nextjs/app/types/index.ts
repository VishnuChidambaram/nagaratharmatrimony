export interface User {
  user_id: number;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  created_at?: string;
}

export interface UserDetail extends User {
  maritalStatus?: string;
  yourTemple?: string;
  yourDivision?: string;
  description?: string;
  educationQualification?: string;
  workDetails?: string;
  imagePath?: string;
  photo?: string | string[];
  pdfPath?: string;
  photoPassword?: string;
  gender?: 'Male' | 'Female';
  age?: number;
  height?: string;
  weight?: string;
  star?: string;
  raasi?: string;
  lagnam?: string;
  [key: string]: string | number | boolean | null | undefined | string[] | File | Blob;
}

export interface Notification {
  notification_id: number;
  user_email: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export type Language = 'en' | 'ta';
