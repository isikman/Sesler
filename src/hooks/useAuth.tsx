import { useState, useEffect, createContext, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { makeService } from '../services/makeService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      // Persistence ayarını belirle
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      // Firebase authentication
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Başarılı giriş sonrası
      toast.success('Başarıyla giriş yapıldı!');
      navigate('/dashboard', { state: { showLoginSuccess: true } });

      // Başarılı giriş sonrası Make.com'a bildir
      makeService.notifyUserSignIn(result.user);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Giriş yapılırken bir hata oluştu.');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Firebase authentication
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Başarılı kayıt sonrası
      toast.success('Hesabınız başarıyla oluşturuldu!');
      navigate('/dashboard', { state: { showLoginSuccess: true } });

      // Başarılı kayıt sonrası Make.com'a bildir
      makeService.notifyUserSignUp(result.user);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Hesap oluşturulurken bir hata oluştu.');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Persistence ayarını local olarak ayarla (Google girişlerinde her zaman hatırla)
      await setPersistence(auth, browserLocalPersistence);
      
      // Firebase authentication
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Başarılı giriş sonrası
      toast.success('Google ile giriş başarılı!');
      navigate('/dashboard', { state: { showLoginSuccess: true } });

      // Başarılı giriş sonrası Make.com'a bildir
      makeService.notifyUserSignIn(result.user);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Google ile giriş yapılırken bir hata oluştu.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Çıkış yapıldı!');
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Çıkış yapılırken bir hata oluştu.');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signInWithGoogle, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}