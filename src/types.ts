export interface Hostel {
  id: string;
  name: string;
  totalStudents: number;
  password: string;
  sports: {
    cricket: boolean;
    volleyball: boolean;
    kabaddi: boolean;
  };
  volunteers: Volunteer[];
  revenue: Revenue;
}

export interface SportTeam {
  id: string;
  hostelId: string;
  sport: 'cricket' | 'volleyball' | 'kabaddi';
  players: Player[];
  captain: string;
  matches: number;
  wins: number;
  maxPlayers: number;
  registrationLink?: string;
}

export interface Player {
  id: string;
  name: string;
  role: string;
  jerseyNumber: number;
  photoUrl?: string;
  mobileNumber: string;
  tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  contact: string;
}

export interface Revenue {
  totalCollected: number;
  expenses: number;
  lastUpdated: string;
}