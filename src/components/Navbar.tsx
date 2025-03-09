import React, { useState } from 'react';
import { LogIn, UserPlus, Menu, X, LogOut } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, signOut } = useAuth();

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              MasalAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-600">Merhaba, {user.displayName || user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white transition-colors duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Üye Ol</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-4">
                <p className="text-gray-600 px-4">Merhaba, {user.displayName || user.email}</p>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  onClick={() => {
                    openAuthModal('register');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Üye Ol</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
    </nav>
  );
}