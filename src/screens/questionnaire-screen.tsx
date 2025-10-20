import React, { useState } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientCard } from '@/components/ui/gradient-card';
import { ParticleBackground } from '@/components/animations/particle-background';
import { ChevronRight, Check, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';

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

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canContinue = (step === 1 && usage) || (step === 2 && selectedSubjects.length > 0) || (step === 3 && selectedTheme);

  return (
    <div className="h-screen bg-background relative flex flex-col overflow-hidden min-h-0">
      <ParticleBackground />

      <div className="relative z-10 flex-1 max-w-md mx-auto w-full flex flex-col p-6 min-h-0">
        {/* Back Button */}
        {step > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4 animate-fade-in"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in flex-shrink-0">
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
          <div className="space-y-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-text-primary mb-6 animate-fade-in">
              How will you be using ADA?
            </h2>

            <GradientCard
              selectable
              selected={usage === 'school'}
              onClick={() => handleUsageSelect('school')}
              className="cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">School Use</h3>
                  <p className="text-sm text-text-secondary">
                    Supplement your classroom learning
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 text-gradient-purple transition-transform duration-300 ${usage === 'school' ? 'translate-x-1' : ''}`} />
              </div>
            </GradientCard>

            <GradientCard
              selectable
              selected={usage === 'personal'}
              onClick={() => handleUsageSelect('personal')}
              className="cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">Personal Study</h3>
                  <p className="text-sm text-text-secondary">
                    Self-directed AP preparation
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 text-gradient-purple transition-transform duration-300 ${usage === 'personal' ? 'translate-x-1' : ''}`} />
              </div>
            </GradientCard>
          </div>
        )}

        {/* Step 2: Subject Selection */}
        {step === 2 && (
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto px-1 pb-24 space-y-3">
              {/* Sticky Selected Subjects Box */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-card-border/30 pb-4">
                <div className="gradient-outline rounded-lg p-1">
                  <div className="gradient-outline-content rounded-lg bg-surface p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-text-primary">Selected Subjects</h3>
                      <span className="text-xs text-text-muted">
                        {selectedSubjects.length} of {apSubjects.length}
                      </span>
                    </div>
                    {selectedSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map((subject) => (
                          <span
                            key={subject}
                            className="text-xs bg-gradient-purple/10 text-gradient-purple px-2 py-1 rounded-full border border-gradient-purple/20"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">Select subjects below to get started</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Subject List */}
              {apSubjects.map((subject) => (
                <div
                  key={subject}
                  className={`gradient-outline rounded-lg p-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                    selectedSubjects.includes(subject) ? 'gradient-outline-selected' : ''
                  }`}
                  onClick={() => handleSubjectToggle(subject)}
                >
                  <div className="gradient-outline-content rounded-lg bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">
                        {subject}
                      </span>
                      <div className={`transition-all duration-200 ${
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
          <div className="space-y-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-text-primary mb-6 text-center">
              Choose your preferred theme
            </h2>
            
            <div className="space-y-4">
              <GradientCard
                selectable
                selected={selectedTheme === 'light'}
                onClick={() => handleThemeSelect('light')}
                className="cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-white border border-gray-200 transition-transform duration-300 hover:rotate-12">
                      <Sun className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold transition-colors duration-300 ${selectedTheme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>Light Mode</h3>
                      <p className={`text-sm transition-colors duration-300 ${selectedTheme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
                        Clean and bright interface
                      </p>
                    </div>
                  </div>
                  <div className={`transition-all duration-500 ease-out ${
                    selectedTheme === 'light' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'
                  }`}>
                    <Check className="w-5 h-5 text-gaming-success" />
                  </div>
                </div>
              </GradientCard>

              <GradientCard
                selectable
                selected={selectedTheme === 'dark'}
                onClick={() => handleThemeSelect('dark')}
                className="cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg bg-slate-800 border border-slate-600 transition-transform duration-300 hover:-rotate-12">
                      <Moon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className={`font-semibold transition-colors duration-300 ${selectedTheme === 'dark' ? 'text-white' : 'text-text-primary'}`}>Dark Mode</h3>
                      <p className={`text-sm transition-colors duration-300 ${selectedTheme === 'dark' ? 'text-slate-300' : 'text-text-secondary'}`}>
                        Easy on the eyes, perfect for studying
                      </p>
                    </div>
                  </div>
                  <div className={`transition-all duration-500 ease-out ${
                    selectedTheme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'
                  }`}>
                    <Check className="w-5 h-5 text-gaming-success" />
                  </div>
                </div>
              </GradientCard>
            </div>
          </div>
        )}

        {/* Continue Button - Fixed positioning */}
        {canContinue && (
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
            <div className="backdrop-blur-md bg-background/95 border-t border-card-border/30 px-6 py-4 shadow-lg">
              <div className="max-w-md mx-auto">
                <GradientButton
                  size="lg"
                  className="w-full animate-fade-in"
                  onClick={handleContinue}
                >
                  Continue
                </GradientButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};