import React from 'react';
import { TrendingUp, Lock } from 'lucide-react';

interface PlaceholderProgressGraphProps {
  hasData?: boolean;
}

export const PlaceholderProgressGraph: React.FC<PlaceholderProgressGraphProps> = ({ 
  hasData = false 
}) => {
  // Sample data for demonstration
  const sampleData = [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 }
  ];

  const realData = [
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 80 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 75 },
    { day: 'Sat', value: 100 },
    { day: 'Sun', value: 85 }
  ];

  const data = hasData ? realData : sampleData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">This Week</h3>
        {hasData ? (
          <span className="text-sm text-gradient-purple font-medium">7 days active</span>
        ) : (
          <span className="text-sm text-text-muted flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Start studying to unlock
          </span>
        )}
      </div>
      
      <div className="relative">
        <div className="flex items-end justify-between gap-2 h-24">
          {data.map((item, index) => (
            <div key={item.day} className="flex flex-col items-center gap-2 flex-1 relative">
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 ${
                  hasData 
                    ? 'bg-gradient-to-t from-purple-500 to-orange-500' 
                    : 'bg-surface-muted opacity-30'
                }`}
                style={{ 
                  height: hasData ? `${item.value}%` : '20%',
                  animation: hasData ? `grow-bar 0.6s ease-out ${index * 0.1}s both` : 'none'
                }}
              />
              <span className="text-xs text-text-muted">{item.day}</span>
            </div>
          ))}
        </div>
        
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2 bg-background/80 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm text-text-secondary font-medium">
                Complete activities to see your progress
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          {hasData ? (
            <>
              <span className="text-gaming-xp font-semibold">+420 XP</span> earned this week
            </>
          ) : (
            <>
              <span className="text-text-muted">Study flashcards, play games, or complete quests to earn XP</span>
            </>
          )}
        </p>
      </div>

      <style>{`
        @keyframes grow-bar {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
