
import { useEffect, useState } from 'react';
import { Trophy, Crown, Zap, Shield, Medal, Star } from 'lucide-react';
import { fetchLeaderboard, Employee, fetchLevels, Level, fetchTopMonthlyXP, TopMonthlyXP } from '@/utils/api';
import { getLevelName, getLevelProgress, getLevelColor } from '@/utils/levels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const Leaderboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topMonthly, setTopMonthly] = useState<TopMonthlyXP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [empData, lvlData, monthlyData] = await Promise.all([
        fetchLeaderboard(),
        fetchLevels(),
        fetchTopMonthlyXP()
      ]);
      setEmployees(empData);
      setLevels(lvlData);
      setTopMonthly(monthlyData);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-7 h-7 text-yellow-400" />;
      case 1: return <Trophy className="w-6 h-6 text-slate-300" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-primary" />;
    }
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <Card className="husky-border sparkle-effect">
        <CardHeader>
          <CardTitle className="husky-text glow-blue text-3xl">
            🏆 Loading Leaderboard...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Podium logic
  const podium = employees.slice(0, 3);
  const rest = employees.slice(3);

  return (
    <>
      <Card className="husky-border pulse-glow">
        <CardHeader className="text-center pb-6">
          <CardTitle className="husky-text glow-blue text-3xl flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10" />
            🏆 Huskeys Champions
            <Trophy className="w-10 h-10" />
          </CardTitle>
          <p className="text-muted-foreground text-lg">Who's leading the pack? 🐶</p>
        </CardHeader>
        <CardContent>
          {/* Podium */}
          {podium.length > 0 && (
            <div className="flex justify-center items-end gap-4 mb-8">
              {/* 2nd place */}
              {podium[1] && (
                <PodiumCard employee={podium[1]} index={1} levels={levels} heightClass="h-40" />
              )}
              {/* 1st place */}
              {podium[0] && (
                <PodiumCard employee={podium[0]} index={0} levels={levels} heightClass="h-56 scale-110 z-10" />
              )}
              {/* 3rd place */}
              {podium[2] && (
                <PodiumCard employee={podium[2]} index={2} levels={levels} heightClass="h-32" />
              )}
            </div>
          )}
          {/* Rest of leaderboard */}
          <div className="space-y-4">
            {rest.map((employee, index) => {
              const progress = getLevelProgress(employee.xp, employee.level, levels);
              const levelColorClass = getLevelColor(employee.level);
              return (
                <div
                  key={employee.name}
                  className={`p-6 rounded-xl border transition-all duration-500 playful-hover bg-card/60 border-border fun-gradient`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(index + 3)}
                        <span className="text-2xl">{getRankEmoji(index + 3)}</span>
                        <span className="text-xl font-bold text-muted-foreground">
                          #{index + 4}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                          🐶 {employee.name}
                        </h3>
                        <p className={`text-base font-semibold ${levelColorClass} glow-blue`}>
                          Level {employee.level} - {getLevelName(employee.level, levels)} ⚡
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold husky-text flex items-center gap-2">
                        💎 {employee.xp.toLocaleString()} XP
                      </div>
                      <div className="text-sm text-muted-foreground">
                        🎯 {progress.xpToNext} XP to next level
                      </div>
                      {typeof employee.current_streak === 'number' && typeof employee.max_streak === 'number' && (
                        <div className="text-sm text-accent mt-1">
                          🔥 Streak: <span className="font-bold">{employee.current_streak}</span> (Max: {employee.max_streak})
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="flex items-center gap-2">
                        🚀 Progress to Level {employee.level + 1}
                      </span>
                      <span className="text-primary font-bold">
                        {Math.round(progress.progressPercent)}% 📈
                      </span>
                    </div>
                    <Progress 
                      value={progress.progressPercent} 
                      className="h-3 bg-muted/50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// PodiumCard component for top 3
function PodiumCard({ employee, index, levels, heightClass }: { employee: Employee, index: number, levels: Level[], heightClass: string }) {
  const progress = getLevelProgress(employee.xp, employee.level, levels);
  const levelColorClass = getLevelColor(employee.level);
  // Medal border colors
  const borderClass =
    index === 0
      ? 'border-yellow-400/80 bg-yellow-100/30 shadow-yellow-400/30'
      : index === 1
      ? 'border-slate-300/80 bg-slate-100/30 shadow-slate-300/30'
      : 'border-amber-700/80 bg-amber-100/30 shadow-amber-700/30';
  const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
  const medalIcon = index === 0 ? <Crown className="w-10 h-10 text-yellow-400" /> : index === 1 ? <Trophy className="w-8 h-8 text-slate-300" /> : <Medal className="w-8 h-8 text-amber-700" />;
  return (
    <div className="flex flex-col items-center">
      {/* Emoji and medal above the card */}
      <div className="mb-4 flex flex-col items-center">
        <span className="text-3xl mb-1">{emoji}</span>
        {medalIcon}
      </div>
      <div className={`relative flex flex-col items-center justify-end w-48 h-56 p-4 pb-6 rounded-xl border-2 shadow-lg overflow-hidden ${borderClass}`} style={{ minWidth: 160 }}>
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-2 text-center w-full truncate" title={employee.name}>
          🐶 {employee.name}
        </h3>
        <p className={`text-base font-semibold ${levelColorClass} glow-blue mb-2 text-center w-full truncate`} title={getLevelName(employee.level, levels)}>
          Level {employee.level} - {getLevelName(employee.level, levels)} ⚡
        </p>
        <div className="text-center mb-2 w-full">
          <span className="text-2xl font-bold husky-text">💎 {employee.xp.toLocaleString()} XP</span>
        </div>
        {typeof employee.current_streak === 'number' && typeof employee.max_streak === 'number' && (
          <div className="text-sm text-accent mb-2 w-full text-center truncate">
            🔥 Streak: <span className="font-bold">{employee.current_streak}</span> (Max: {employee.max_streak})
          </div>
        )}
        <div className="w-full mt-auto">
          <Progress value={progress.progressPercent} className="h-2 bg-muted/50" />
          <div className="text-xs text-muted-foreground mt-2 text-center w-full truncate">
            🚀 {Math.round(progress.progressPercent)}% to next level
          </div>
        </div>
      </div>
      {/* Position number below the card */}
      <span className="mt-2 text-xl font-bold text-muted-foreground">#{index + 1}</span>
    </div>
  );
}

export function MonthlyLeaderboard() {
  const [topMonthly, setTopMonthly] = useState<TopMonthlyXP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const monthlyData = await fetchTopMonthlyXP();
      setTopMonthly(monthlyData);
      setLoading(false);
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="husky-border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="husky-text glow-blue text-2xl flex items-center justify-center gap-2">
          <Zap className="w-7 h-7 text-yellow-400" />
          Top XP Earners This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading && <div className="text-center text-muted-foreground">Loading...</div>}
          {!loading && topMonthly.length === 0 && <div className="text-center text-muted-foreground">No XP earned yet this month.</div>}
          {topMonthly.slice(0, 5).map((user, idx) => (
            <div key={user.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-muted-foreground">#{idx + 1}</span>
                <span className="font-semibold text-foreground">{user.name}</span>
              </div>
              <span className="font-bold text-yellow-500">⚡ {user.xp_earned} XP</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
