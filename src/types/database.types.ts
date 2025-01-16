export interface Hostel {
  id: string;
  name: string;
  warden_name: string;
  contact_number: string;
  email: string;
  password?: string;
  created_at: Date;
}

export interface Team {
  id: string;
  hostel_id: string;
  name: string;
  sport: 'VOLLEYBALL' | 'KABADDI' | 'CRICKET';
  captain_name: string;
  team_size: number;
  created_at: Date;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  roll_number: string;
  contact_number: string;
  position: string;
  profile_image?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: Date;
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  contact_number: string;
  email: string;
  assigned_sport: string;
  created_at: Date;
}

export interface Revenue {
  id: string;
  event_name: string;
  amount: number;
  type: 'TICKET_SALES' | 'SPONSORSHIP' | 'OTHER';
  date: Date;
  notes: string;
  created_at: Date;
}