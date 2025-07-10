
import { useEffect, useState } from 'react';
import { Award, Users, Target, Clock, Star, Trophy } from 'lucide-react';
import { fetchAchievements, Achievement } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      const data = await fetchAchievements();
      setAchievements(data);
      setLoading(false);
    };

    loadAchievements();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tasks': return <Target className="w-4 h-4" />;
      case 'level': return <Star className="w-4 h-4" />;
      case 'xp': return <Award className="w-4 h-4" />;
      case 'streak': return <Clock className="w-4 h-4" />;
      case 'cto_special': return <Trophy className="w-4 h-4 text-accent" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tasks': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'level': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'xp': return 'bg-primary/20 text-primary border-primary/40';
      case 'streak': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'cto_special': return 'bg-accent/20 text-accent border-accent/40';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'tasks': return '🎯';
      case 'level': return '⭐';
      case 'xp': return '💎';
      case 'streak': return '🔥';
      case 'cto_special': return '👑';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <Card className="husky-border sparkle-effect">
        <CardHeader>
          <CardTitle className="husky-text glow-blue text-3xl">
            🎯 Loading Achievements...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-muted/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="husky-border pulse-glow">
      <CardHeader className="text-center pb-6">
        <CardTitle className="husky-text glow-blue text-3xl flex items-center justify-center gap-3">
          <Award className="w-10 h-10" />
          🎯 Achievement Gallery
          <Trophy className="w-10 h-10" />
        </CardTitle>
        <p className="text-muted-foreground text-lg">Unlock your potential! 🚀</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="p-6 rounded-xl border bg-card/60 playful-hover fun-gradient sparkle-effect bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl transform hover:scale-110 transition-transform duration-300" title={achievement.name}>
                  {achievement.icon}
                </div>
                <Badge className={`${getTypeColor(achievement.type)} flex items-center gap-1 font-semibold`}>
                  {getTypeIcon(achievement.type)}
                  {getTypeEmoji(achievement.type)} {achievement.type}
                </Badge>
              </div>
              
              <h3 className="font-bold text-lg mb-3 text-foreground flex items-center gap-2">
                🏆 {achievement.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {achievement.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  🎯 Target: <span className="font-semibold text-primary">{achievement.target}</span>
                  {achievement.timeframe_days && (
                    <div className="text-xs mt-1">
                      ⏱️ ({achievement.timeframe_days} days)
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-primary font-bold text-lg">
                    {achievement.users?.length || 0} 🐶
                  </span>
                </div>
              </div>
              
              {achievement.users && achievement.users.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">🎉 Unlocked by:</p>
                  <div className="flex flex-wrap gap-2">
                    {achievement.users.slice(0, 3).map((user) => (
                      <Badge key={user} variant="outline" className="text-xs border-primary/30">
                        🐶 {user}
                      </Badge>
                    ))}
                    {achievement.users.length > 3 && (
                      <Badge variant="outline" className="text-xs border-accent/30">
                        +{achievement.users.length - 3} more! 🎊
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
