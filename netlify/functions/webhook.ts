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

export const handler: Handler = async (event) => {
  // POST metodu kontrolü
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
    // Request body'yi parse et
    const payload = JSON.parse(event.body || '{}');
    console.log('Received payload:', payload);

    if (payload.action === 'create' && payload.data?.story) {
      const { basicInfo, details } = payload.data.story;
      
      // Yeni hikaye için referans oluştur
      const storyRef = database.ref(`storyTemplates/${basicInfo.id}`);
      
      // Hikayeyi kaydet
      await storyRef.set({
        ...basicInfo,
        ...details,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      console.log('Story created successfully:', basicInfo.id);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Story created successfully',
          data: { id: basicInfo.id }
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: 'Invalid action or missing story data'
      })
    };
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
