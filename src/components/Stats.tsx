
import { useEffect, useState } from 'react';
import { Activity, Users, Zap, Target, TrendingUp } from 'lucide-react';
import { fetchLeaderboard, fetchAchievements } from '@/utils/api';
import { Card, CardContent } from '@/components/ui/card';

export const Stats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXP: 0,
    totalAchievements: 0,
    averageLevel: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [employees, achievements] = await Promise.all([
        fetchLeaderboard(),
        fetchAchievements()
      ]);

      const totalUsers = employees.length;
      const totalXP = employees.reduce((sum, emp) => sum + emp.xp, 0);
      const totalAchievements = achievements.length;
      const averageLevel = totalUsers > 0 ? employees.reduce((sum, emp) => sum + emp.level, 0) / totalUsers : 0;

      setStats({
        totalUsers,
        totalXP,
        totalAchievements,
        averageLevel: Math.round(averageLevel * 10) / 10
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: '🐶 Active Huskeys',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'fun-gradient',
      emoji: '👥'
    },
    {
      title: '⚡ Total XP Earned',
      value: stats.totalXP.toLocaleString(),
      icon: Zap,
      color: 'text-primary',
      bgColor: 'fun-gradient',
      emoji: '💎'
    },
    {
      title: '🏆 Achievements',
      value: stats.totalAchievements,
      icon: Target,
      color: 'text-accent',
      bgColor: 'fun-gradient',
      emoji: '🎯'
    },
    {
      title: '📊 Average Level',
      value: stats.averageLevel,
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'fun-gradient',
      emoji: '📈'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse husky-border">
            <CardContent className="p-6">
              <div className="h-20 bg-muted/50 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="husky-border playful-hover bounce-in sparkle-effect"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color} glow-blue`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bgColor} transform hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 text-2xl opacity-30">
              {stat.emoji}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
