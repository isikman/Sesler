import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini dışa aktar
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Yapılandırmayı doğrula ve hataları logla
export const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'databaseURL'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
  }

  return true;
};

// Database bağlantısını test et
export const testDatabaseConnection = async () => {
  try {
    // Önce public bir yolu test et
    const publicRef = ref(database, 'public');
    await get(publicRef);
    return true;
  } catch (error: any) {
    // Eğer hata PERMISSION_DENIED ise, bu bağlantının çalıştığını ama
    // sadece yetki sorunu olduğunu gösterir
    if (error.code === 'PERMISSION_DENIED') {
      return true;
    }
    throw error;
  }
};