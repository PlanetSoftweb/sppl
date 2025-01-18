// Previous code remains the same...

export interface Match {
  id: string;
  sport: 'cricket' | 'volleyball' | 'kabaddi';
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  date: string;
  startTime: string;  // Renamed from time to startTime
  endTime: string;    // Added end time
  venue: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  winner?: string;
  score?: {
    team1: number;
    team2: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  round?: number;     // Added for league tracking
  matchNumber?: number; // Added for league tracking
}

// Rest of the types remain the same...