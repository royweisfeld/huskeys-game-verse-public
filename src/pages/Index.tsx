
import { useState } from 'react';
import { Trophy, Shield, Users, Award, Sparkles, Star } from 'lucide-react';
import { Leaderboard, MonthlyLeaderboard } from '@/components/Leaderboard';
import { Achievements } from '@/components/Achievements';
import { Stats } from '@/components/Stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20 sparkle-effect">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold husky-text glow-blue">
                  � Huskeys Gamification Platform
                </h1>
                <p className="text-base text-muted-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  Level up your skills and have fun doing it!
                  <Sparkles className="w-4 h-4 text-accent" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-card/60 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="font-medium">System Online & Ready!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Stats />
        
        <Tabs defaultValue="leaderboard" className="space-y-8">
          <TabsList className="flex w-full justify-center gap-2 lg:w-[480px] mx-auto bg-card/60 border border-border rounded-xl p-1">
            <TabsTrigger 
              value="leaderboard" 
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300"
            >
              🏆 Leaderboard
            </TabsTrigger>
            <TabsTrigger 
              value="monthly"
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300"
            >
              📅 Monthly Leaderboard
            </TabsTrigger>
            <TabsTrigger 
              value="achievements"
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300"
            >
              🎯 Achievements
            </TabsTrigger>
          </TabsList>
          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard />
          </TabsContent>
          <TabsContent value="monthly" className="space-y-6">
            <MonthlyLeaderboard />
          </TabsContent>
          <TabsContent value="achievements" className="space-y-6">
            <Achievements />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Huskeys Gamification Platform • Powered by Fun & Competition
              <Sparkles className="w-4 h-4 text-accent" />
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              🚀 Level up • 💎 Earn XP • 🏆 Unlock achievements • 🎉 Have fun!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
