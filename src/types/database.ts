export type UserRole = 'admin' | 'manager' | 'caretaker' | 'guest';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  department?: string;
  designation?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface GuestHouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  caretaker_id?: string;
  caretaker?: Profile;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  rooms?: Room[];
}

export type RoomType = 'suite' | 'deluxe' | 'standard';
export type RoomStatus = 'available' | 'maintenance' | 'occupied';

export interface Room {
  id: string;
  guest_house_id: string;
  guest_house?: GuestHouse;
  room_number: string;
  type: RoomType;
  capacity: number;
  tariff_internal: number;
  tariff_external: number;
  status: RoomStatus;
  images: string[];
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'pending_caretaker'
  | 'pending_manager'
  | 'approved'
  | 'rejected'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Booking {
  id: string;
  guest_id: string;
  guest?: Profile;
  guest_house_id: string;
  guest_house?: GuestHouse;
  room_id: string;
  room?: Room;
  check_in: string;
  check_out: string;
  guest_count: number;
  purpose: string;
  status: BookingStatus;
  caretaker_remarks?: string;
  manager_remarks?: string;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at?: string;
  payments?: Payment[];
}

export type PaymentTransactionStatus = 'pending' | 'captured' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  status: PaymentTransactionStatus;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user?: Profile;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}
