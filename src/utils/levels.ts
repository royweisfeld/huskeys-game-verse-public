import type { Level } from './api';

export function getLevelName(level: number, levels: Level[]): string {
  const found = levels.find(l => l.level === level);
  return found ? found.name : `Level ${level}`;
}

export function getLevelProgress(xp: number, level: number, levels: Level[]): {
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpToNext: number;
} {
  // Calculate total XP required to reach the current level
  let xpSum = 0;
  for (let i = 1; i < level; i++) {
    const found = levels.find(l => l.level === i);
    if (found) xpSum += found.xp_required;
  }
  const foundLevel = levels.find(l => l.level === level);
  const nextLevelXp = foundLevel ? foundLevel.xp_required : 500;
  const currentLevelXp = xp - xpSum;
  const progressPercent = (currentLevelXp / nextLevelXp) * 100;
  const xpToNext = nextLevelXp - currentLevelXp;

  return {
    currentLevelXp,
    nextLevelXp,
    progressPercent,
    xpToNext
  };
}

export function getLevelColor(level: number): string {
  if (level >= 10) return "text-purple-400";
  if (level >= 8) return "text-red-400";
  if (level >= 6) return "text-orange-400";
  if (level >= 4) return "text-yellow-400";
  if (level >= 2) return "text-blue-400";
  return "text-green-400";
}
