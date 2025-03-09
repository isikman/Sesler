import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SparkleEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            '--move-x': `${Math.random() * 200 - 100}px`,
            '--move-y': `${Math.random() * 200 - 100}px`
          } as React.CSSProperties}
        >
          <Sparkles
            className="w-4 h-4 text-blue-200"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.2))'
            }}
          />
        </div>
      ))}
    </div>
  );
}