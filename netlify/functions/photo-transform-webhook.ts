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

interface TransformWebhookPayload {
  type: string;
  data: {
    uid: string;
    userEmail: string;
    transformId: string;
    templateId: string;
    transformedImageUrl?: string;
    error?: string;
  };
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
    const payload = JSON.parse(event.body || '{}') as TransformWebhookPayload;
    console.log('Received webhook payload:', payload);

    // Gerekli alanları kontrol et
    if (!payload.type || !payload.data || !payload.data.uid || !payload.data.transformId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Missing required fields: type, uid, or transformId'
        })
      };
    }

    // Referansı doğrudan uid ve transformId ile oluştur
    const transformRef = database.ref(`transformations/${payload.data.uid}/${payload.data.transformId}`);

    switch (payload.type) {
      case 'start':
        // Sadece status'u güncelle, yeni kayıt oluşturma
        await transformRef.update({
          status: 'processing',
          updatedAt: new Date().toISOString()
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Transform process started'
          })
        };

      case 'complete':
        // Başarılı dönüşüm
        if (!payload.data.transformedImageUrl) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              success: false,
              message: 'Missing transformedImageUrl'
            })
          };
        }

        await transformRef.update({
          status: 'completed',
          transformedImageUrl: payload.data.transformedImageUrl,
          updatedAt: new Date().toISOString()
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Transform completed successfully'
          })
        };

      case 'error':
        // Hata durumu
        await transformRef.update({
          status: 'failed',
          error: payload.data.error || 'Unknown error occurred',
          updatedAt: new Date().toISOString()
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Transform error recorded'
          })
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: 'Invalid webhook type'
          })
        };
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
