import { Handler } from '@netlify/functions';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Firebase Admin yapılandırması
const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
});

const database = getDatabase(app);

interface TransformStatusRequest {
  userId: string;
  templateId: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  // API Key kontrolü
  const apiKey = event.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.VITE_MAKE_WEBHOOK_API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized - Invalid API Key' })
    };
  }

  try {
    const { userId, templateId } = JSON.parse(event.body || '{}') as TransformStatusRequest;

    if (!userId || !templateId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Missing required fields: userId or templateId'
        })
      };
    }

    // Firebase'den dönüşüm durumunu kontrol et
    const transformRef = database.ref(`transformations/${userId}/${templateId}`);
    const snapshot = await transformRef.get();

    if (!snapshot.exists()) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Transform is still in progress'
        })
      };
    }

    const transformData = snapshot.val();

    // Dönüşüm tamamlandıysa
    if (transformData.status === 'completed') {
      // Dönüşüm kaydını sil (bir kere kullanılacak)
      await transformRef.remove();

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          transformedImageUrl: transformData.transformedImageUrl,
          message: 'Transform completed successfully'
        })
      };
    }

    // Dönüşüm başarısız olduysa
    if (transformData.status === 'failed') {
      // Dönüşüm kaydını sil
      await transformRef.remove();

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: transformData.error || 'Transform failed'
        })
      };
    }

    // Dönüşüm hala devam ediyor
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Transform is still in progress'
      })
    };

  } catch (error) {
    console.error('Transform status check error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};