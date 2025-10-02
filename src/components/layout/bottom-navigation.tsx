import React from 'react';
import { Chrome as Home, Bot, BookOpen, Gamepad2, Target, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'ai-tutor', label: 'AI Tutor', icon: Bot },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'quests', label: 'Quests', icon: Target },
  { id: 'store', label: 'Store', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="nav-fixed bottom-0 left-0 right-0 bg-surface-elevated/80 backdrop-blur-sm border-t border-card-border/30">
      <div className="flex justify-between items-center py-1 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-1 transition-all duration-200 ease-out hover:bg-surface-muted/50 rounded-lg flex-1"
            >
              <div className={cn(
                'p-1 rounded-lg transition-all duration-200 ease-out',
                isActive ? 'gradient-outline' : ''
              )}>
                <div className={cn(
                  'p-1 rounded-lg transition-all duration-200 ease-out',
                  isActive && 'gradient-outline-content'
                )}>
                  <Icon 
                    className={cn(
                      'w-3.5 h-3.5 transition-colors duration-200 ease-out',
                      isActive ? 'text-gradient-purple' : 'text-text-muted'
                    )} 
                  />
                </div>
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-colors duration-200 ease-out text-center leading-tight',
                isActive ? 'gradient-text' : 'text-text-muted'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};