import React, { useState, useEffect } from 'react';
import { Book, Music, Image, Sparkles, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoadingStep {
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface StoryLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  storyTitle: string;
}

const loadingSteps: LoadingStep[] = [
  {
    icon: <Book className="w-6 h-6 text-blue-500" />,
    label: 'Hikaye Hazırlanıyor',
    description: 'Sihirli sayfalar derleniyor...'
  },
  {
    icon: <Image className="w-6 h-6 text-purple-500" />,
    label: 'Görseller Yükleniyor',
    description: 'Büyülü resimler canlanıyor...'
  },
  {
    icon: <Music className="w-6 h-6 text-pink-500" />,
    label: 'Sesler Yükleniyor',
    description: 'Melodiler hazırlanıyor...'
  },
  {
    icon: <Wand2 className="w-6 h-6 text-yellow-500" />,
    label: 'Son Rötuşlar',
    description: 'Sihirli dokunuşlar ekleniyor...'
  }
];

export default function StoryLoadingModal({ isOpen, onComplete, storyTitle }: StoryLoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
      return;
    }

    let stepInterval: NodeJS.Timeout;
    let completionTimeout: NodeJS.Timeout;

    const advanceStep = () => {
      setCurrentStep(prev => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        setIsCompleted(true);
        
        // Konfeti efekti
        const duration = 1500;
        const animationEnd = Date.now() + duration;
        const colors = ['#FF69B4', '#4169E1', '#FFD700', '#98FB98'];

        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < animationEnd) {
            requestAnimationFrame(frame);
          }
        };
        
        frame();

        // Tamamlandıktan sonra modalı kapat
        completionTimeout = setTimeout(() => {
          onComplete();
        }, 2000);

        return prev;
      });
    };

    // Her 1.5 saniyede bir adım ilerle
    stepInterval = setInterval(advanceStep, 1500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(completionTimeout);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="relative max-w-md w-full mx-4 bg-white rounded-2xl p-8 shadow-2xl">
        {/* Dekoratif elementler */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-pink-100 rounded-full opacity-50"></div>
        <Sparkles className="absolute top-4 left-4 w-6 h-6 text-yellow-400 opacity-50 animate-pulse" />

        {/* Başlık */}
        <h2 className="text-2xl font-bold text-center mb-2">{storyTitle}</h2>
        <p className="text-gray-600 text-center mb-8">Masalınız hazırlanıyor...</p>

        {/* Loading steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive ? 'bg-blue-50 scale-105' : 'bg-gray-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isComplete
                      ? 'bg-green-100'
                      : isActive
                      ? 'bg-blue-100 animate-pulse'
                      : 'bg-gray-100'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{step.label}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {isComplete && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tamamlandı mesajı */}
        {isCompleted && (
          <div className="absolute inset-x-0 -bottom-16 text-center">
            <p className="text-white text-lg font-medium animate-bounce">
              Masalınız Hazır! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}