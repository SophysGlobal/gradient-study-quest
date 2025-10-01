import React, { useState } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientCard } from '@/components/ui/gradient-card';
import { ParticleBackground } from '@/components/animations/particle-background';
import { ChevronRight, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface QuestionnaireScreenProps {
  onComplete: (data: { usage: string; subjects: string[]; theme: string }) => void;
}

const apSubjects = [
  'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP Computer Science A',
  'AP Computer Science Principles', 'AP Physics 1', 'AP Physics 2', 'AP Physics C: Mechanics',
  'AP Physics C: Electricity and Magnetism', 'AP Chemistry', 'AP Biology',
  'AP Environmental Science', 'AP English Language and Composition',
  'AP English Literature and Composition', 'AP World History: Modern',
  'AP US History', 'AP European History', 'AP Government and Politics',
  'AP Macroeconomics', 'AP Microeconomics', 'AP Psychology',
  'AP Human Geography', 'AP Art History', 'AP Studio Art',
  'AP Music Theory', 'AP Spanish Language and Culture', 'AP French Language and Culture',
  'AP German Language and Culture', 'AP Italian Language and Culture',
  'AP Japanese Language and Culture', 'AP Chinese Language and Culture',
  'AP Latin', 'AP Seminar', 'AP Research'
];

export const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({
  onComplete,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [usage, setUsage] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>(theme);

  const handleUsageSelect = (value: string) => {
    setUsage(value);
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleThemeSelect = (themeValue: 'light' | 'dark') => {
    setSelectedTheme(themeValue);
    // Apply theme immediately for preview
    if (theme !== themeValue) {
      toggleTheme();
    }
  };

  const handleContinue = () => {
    if (step === 1 && usage) {
      setStep(2);
    } else if (step === 2 && selectedSubjects.length > 0) {
      setStep(3);
    } else if (step === 3 && selectedTheme) {
      onComplete({ usage, subjects: selectedSubjects, theme: selectedTheme });
    }
  };

  const canContinue = (step === 1 && usage) || (step === 2 && selectedSubjects.length > 0) || (step === 3 && selectedTheme);

  return (
    <div className="min-h-screen bg-background relative flex flex-col p-6">
      <ParticleBackground />

      <div className="relative z-10 flex-1 max-w-md mx-auto w-full pb-24">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="flex space-x-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-gradient-purple' : 'bg-surface-muted'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-gradient-purple' : 'bg-surface-muted'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${step >= 3 ? 'bg-gradient-purple' : 'bg-surface-muted'}`} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {step === 1 ? 'Getting Started' : step === 2 ? 'Choose Your Subjects' : 'Select Your App Theme'}
          </h1>
          <p className="text-text-secondary">
            {step === 1 
              ? 'Help us personalize your experience'
              : step === 2 
              ? 'Select the AP courses you want to study'
              : 'Choose between light and dark mode'
            }
          </p>
        </div>

        {/* Step 1: Usage Type */}
        {step === 1 && (
          <div className="space-y-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold text-text-primary mb-6">
              How will you be using ADA?
            </h2>
            
            <GradientCard
              selectable
              selected={usage === 'school'}
              onClick={() => handleUsageSelect('school')}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">School Use</h3>
                  <p className="text-sm text-text-secondary">
                    Supplement your classroom learning
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gradient-purple" />
              </div>
            </GradientCard>

            <GradientCard
              selectable
              selected={usage === 'personal'}
              onClick={() => handleUsageSelect('personal')}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">Personal Study</h3>
                  <p className="text-sm text-text-secondary">
                    Self-directed AP preparation
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gradient-purple" />
              </div>
            </GradientCard>
          </div>
        )}

        {/* Step 2: Subject Selection */}
        {step === 2 && (
          <div className="space-y-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-6">
              <p className="text-sm text-text-secondary">
                {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-3 px-1">
              {apSubjects.map((subject, index) => (
                <div
                  key={subject}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className={`gradient-outline rounded-lg p-1 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] animate-in fade-in slide-in-from-left-2 ${
                    selectedSubjects.includes(subject) ? 'gradient-outline-selected' : ''
                  }`}
                  onClick={() => handleSubjectToggle(subject)}
                >
                  <div className="gradient-outline-content rounded-lg bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">
                        {subject}
                      </span>
                      <div className={`transition-all duration-300 ease-out ${
                        selectedSubjects.includes(subject) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                      }`}>
                        <Check className="w-5 h-5 text-gaming-success" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Theme Selection */}
        {step === 3 && (
          <div className="space-y-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold text-text-primary mb-6 text-center">
              Choose your preferred theme
            </h2>
            
            <div className="space-y-4">
              <GradientCard
                selectable
                selected={selectedTheme === 'light'}
                onClick={() => handleThemeSelect('light')}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-white border border-gray-200">
                      <Sun className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${selectedTheme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>Light Mode</h3>
                      <p className={`text-sm ${selectedTheme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
                        Clean and bright interface
                      </p>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ease-out ${
                    selectedTheme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}>
                    <Check className="w-5 h-5 text-gaming-success" />
                  </div>
                </div>
              </GradientCard>

              <GradientCard
                selectable
                selected={selectedTheme === 'dark'}
                onClick={() => handleThemeSelect('dark')}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-600">
                      <Moon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${selectedTheme === 'dark' ? 'text-white' : 'text-text-primary'}`}>Dark Mode</h3>
                      <p className={`text-sm ${selectedTheme === 'dark' ? 'text-slate-300' : 'text-text-secondary'}`}>
                        Easy on the eyes, perfect for studying
                      </p>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ease-out ${
                    selectedTheme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}>
                    <Check className="w-5 h-5 text-gaming-success" />
                  </div>
                </div>
              </GradientCard>
            </div>
          </div>
        )}

        {/* Continue Button - Fixed positioning with backdrop */}
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          canContinue ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <div className="backdrop-blur-md bg-background/80 border-t border-card-border px-6 py-4">
            <div className="max-w-md mx-auto">
              <GradientButton
                size="lg"
                className="w-full transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleContinue}
              >
                Continue
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};