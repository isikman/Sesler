import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LogIn, UserPlus, Mail, Lock, X, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ isOpen, onClose, mode, setMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password, rememberMe);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Reset password error:', error);
    }
    setIsLoading(false);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-4">
                  {showForgotPassword ? (
                    <KeyRound className="w-6 h-6 text-white" />
                  ) : mode === 'login' ? (
                    <LogIn className="w-6 h-6 text-white" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-white" />
                  )}
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  {showForgotPassword
                    ? 'Şifreni mi Unuttun?'
                    : mode === 'login'
                    ? 'Tekrar Hoş Geldin!'
                    : 'Maceraya Katıl'}
                </Dialog.Title>
                <p className="text-gray-600">
                  {showForgotPassword
                    ? 'Endişelenme! E-posta adresini gir, sana şifreni sıfırlaman için bir bağlantı gönderelim.'
                    : mode === 'login'
                    ? 'Masallar seni bekliyor!'
                    : 'Hayal dünyasına adım atmaya hazır mısın?'}
                </p>
              </div>

              <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all"
                      placeholder="ornek@email.com"
                      required
                    />
                  </div>
                </div>

                {!showForgotPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şifre
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && !showForgotPassword && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Şifreni mi unuttun?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yükleniyor...
                    </span>
                  ) : (
                    <span>
                      {showForgotPassword
                        ? 'Şifre Sıfırlama Bağlantısı Gönder'
                        : mode === 'login'
                        ? 'Giriş Yap'
                        : 'Üye Ol'}
                    </span>
                  )}
                </button>

                {showForgotPassword && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Giriş yapmayı tekrar dene
                    </button>
                  </div>
                )}

                {!showForgotPassword && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">veya</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="w-full py-3 px-4 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                      Google ile Devam Et
                    </button>
                  </>
                )}
              </form>

              {!showForgotPassword && (
                <div className="mt-6 text-center text-sm">
                  <span className="text-gray-600">
                    {mode === 'login' ? 'Henüz üye değil misin?' : 'Zaten üye misin?'}
                  </span>{' '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {mode === 'login' ? 'Üye Ol' : 'Giriş Yap'}
                  </button>
                </div>
              )}

              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-red-100 rounded-full opacity-50"></div>
              <Sparkles className="absolute top-4 left-4 w-6 h-6 text-yellow-400 opacity-50 animate-pulse" />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}