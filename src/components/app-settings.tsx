import React, { useState, useEffect } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Bell, 
  Moon, 
  Sun,
  Smartphone,
  Monitor,
  Palette,
  Clock,
  Shield,
  Save
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface AppSettingsProps {
  onClose: () => void;
}

interface Settings {
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  dailyReminders: boolean;
  streakReminders: boolean;
  autoSync: boolean;
  dataCollection: boolean;
  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorContrast: 'normal' | 'high';
  gameTimer: boolean;
  autoSave: boolean;
}

export const AppSettings: React.FC<AppSettingsProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    soundVolume: 75,
    vibrationEnabled: true,
    notificationsEnabled: true,
    dailyReminders: true,
    streakReminders: true,
    autoSync: true,
    dataCollection: false,
    animationsEnabled: true,
    fontSize: 'medium',
    colorContrast: 'normal',
    gameTimer: true,
    autoSave: true
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Apply settings to the app
  useEffect(() => {
    // Apply font size
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    
    // Apply contrast
    document.documentElement.setAttribute('data-contrast', settings.colorContrast);
    
    // Apply animations
    document.documentElement.style.setProperty(
      '--animation-duration', 
      settings.animationsEnabled ? '0.3s' : '0s'
    );
    
    // Apply sound settings
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // Volume control for future audio implementation
      localStorage.setItem('audio-volume', settings.soundVolume.toString());
      localStorage.setItem('sound-enabled', settings.soundEnabled.toString());
    }
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    // Show success message or toast here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GradientCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold gradient-text">App Settings</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gradient-purple" />
              Audio & Haptics
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Sound Effects</p>
                  <p className="text-sm text-text-secondary">Play sounds for interactions</p>
                </div>
                <Switch 
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Volume: {settings.soundVolume}%</p>
                  <div className="relative">
                    <div className="gradient-slider">
                      <div 
                        className="gradient-slider-track" 
                        style={{ width: `${settings.soundVolume}%` }}
                      />
                      <div 
                        className="gradient-slider-thumb"
                        style={{ left: `${settings.soundVolume}%` }}
                      />
                    </div>
                    <Slider
                      value={[settings.soundVolume]}
                      onValueChange={([value]) => updateSetting('soundVolume', value)}
                      max={100}
                      step={5}
                      className="w-full absolute top-0 opacity-0"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Vibration</p>
                  <p className="text-sm text-text-secondary">Haptic feedback for actions</p>
                </div>
                <Switch 
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Bell className="w-5 h-5 text-gradient-orange" />
              Notifications
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Push Notifications</p>
                  <p className="text-sm text-text-secondary">Receive app notifications</p>
                </div>
                <Switch 
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Daily Study Reminders</p>
                  <p className="text-sm text-text-secondary">Get reminded to study daily</p>
                </div>
                <Switch 
                  checked={settings.dailyReminders}
                  onCheckedChange={(checked) => updateSetting('dailyReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Streak Alerts</p>
                  <p className="text-sm text-text-secondary">Protect your learning streak</p>
                </div>
                <Switch 
                  checked={settings.streakReminders}
                  onCheckedChange={(checked) => updateSetting('streakReminders', checked)}
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Palette className="w-5 h-5 text-gradient-purple" />
              Display
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Theme</p>
                  <p className="text-sm text-text-secondary">Light or dark mode</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted hover:bg-surface-hover transition-colors"
                >
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span className="capitalize">{theme}</span>
                </button>
              </div>

              <div>
                <p className="font-medium text-text-primary mb-2">Font Size</p>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        settings.fontSize === size 
                          ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white' 
                          : 'bg-surface-muted hover:bg-surface-hover text-text-secondary'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium text-text-primary mb-2">Contrast</p>
                <div className="flex gap-2">
                  {(['normal', 'high'] as const).map(contrast => (
                    <button
                      key={contrast}
                      onClick={() => updateSetting('colorContrast', contrast)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        settings.colorContrast === contrast 
                          ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white' 
                          : 'bg-surface-muted hover:bg-surface-hover text-text-secondary'
                      }`}
                    >
                      {contrast.charAt(0).toUpperCase() + contrast.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Animations</p>
                  <p className="text-sm text-text-secondary">Smooth transitions and effects</p>
                </div>
                <Switch 
                  checked={settings.animationsEnabled}
                  onCheckedChange={(checked) => updateSetting('animationsEnabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-gradient-orange" />
              Game Settings
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Show Timer</p>
                  <p className="text-sm text-text-secondary">Display countdown in games</p>
                </div>
                <Switch 
                  checked={settings.gameTimer}
                  onCheckedChange={(checked) => updateSetting('gameTimer', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Auto Save Progress</p>
                  <p className="text-sm text-text-secondary">Automatically save game progress</p>
                </div>
                <Switch 
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-gradient-purple" />
              Privacy & Data
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Auto Sync</p>
                  <p className="text-sm text-text-secondary">Sync data across devices</p>
                </div>
                <Switch 
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => updateSetting('autoSync', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary">Usage Analytics</p>
                  <p className="text-sm text-text-secondary">Help improve the app</p>
                </div>
                <Switch 
                  checked={settings.dataCollection}
                  onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <GradientButton onClick={saveSettings} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </GradientButton>
            <GradientButton variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </GradientButton>
          </div>
        </div>
      </GradientCard>
    </div>
  );
};