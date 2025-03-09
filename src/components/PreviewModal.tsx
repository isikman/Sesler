import React from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

interface PreviewModalProps {
  onClose: () => void;
  onUseTemplate: () => void;
}

export default function PreviewModal({ onClose, onUseTemplate }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl p-8 max-w-lg w-full text-center">
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-full opacity-50" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-red-100 rounded-full opacity-50" />
        <Sparkles className="absolute top-4 left-4 w-6 h-6 text-yellow-400 opacity-50 animate-pulse" />
        
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Sürprizi Bozma!
          </h3>
          <p className="text-gray-600">
            Maceranın devamını kahramanınla birlikte keşfet
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUseTemplate}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
          >
            Taslağı Kullan
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Önizlemeye Dön
          </button>
        </div>
      </div>
    </div>
  );
}