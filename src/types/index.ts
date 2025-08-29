// Pastikan ada kata "export" di depan setiap interface
export interface User {
  id: number;
  email: string;
  role: 'applicant' | 'hrd' | 'admin';
  is_active: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type UserCredentials = Omit<User, 'id' | 'role' | 'is_active'> & { password?: string };
export type UserRegister = UserCredentials & { role?: string };

// Pastikan interface ini diekspor
export interface ApplicantProfile {
  id: number;
  user_id: number;
  first_choice_position: string;
  second_choice_position: string;
  full_name: string;
  sex: string;
  place_of_birth: string;
  date_of_birth: string; // YYYY-MM-DD
  last_education: string;
  university_name: string;
  major: string;
  gpa: string;
  home_address: string;
  city: string;
  postal_code: string;
  home_ownership_status: string;
  ktp_address: string;
  ktp_city: string;
  ktp_postal_code: string;
  email: string;
  home_number: string;
  cell_phone_number: string;
  whatsapp_number: string;
  religion: string;
  ethnicity: string;
  citizenship: string;
  marital_status: string;
  ktp_number: string;
  driver_license_type: string;
  driver_license_number: string;
  daily_transportation: string;
}

export interface JobApplication {
    id: number;
    user_id: number;
    profile_id: number;
    position: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'approved' | 'rejected';
    applied_at: string;
    user?: User; 
    profile?: ApplicantProfile;
}