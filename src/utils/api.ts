
const API_BASE = 'REPLACE-THIS-WITH-YOUR-BACKEND';

export interface Employee {
  name: string;
  xp: number;
  level: number;
  current_streak?: number;
  max_streak?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  target: number;
  timeframe_days: number | null;
  users: string[];
}

export interface Level {
  level: number;
  name: string;
  xp_required: number;
}

export interface TopMonthlyXP {
  name: string;
  xp_earned: number;
}

export const fetchLeaderboard = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/leaderboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const fetchAchievements = async (): Promise<Achievement[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/achievements`);
    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

export const fetchLevels = async (): Promise<Level[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/levels`);
    if (!response.ok) {
      throw new Error('Failed to fetch levels');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching levels:', error);
    return [];
  }
};

export const fetchTopMonthlyXP = async (): Promise<TopMonthlyXP[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/top-monthly-xp`);
    if (!response.ok) {
      throw new Error('Failed to fetch top monthly XP earners');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching top monthly XP earners:', error);
    return [];
  }
};
