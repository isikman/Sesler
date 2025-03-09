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

interface StoryWebhookPayload {
  type: 'creation';
  data: {
    storyId: string;
    userId: string;
    userEmail: string;
    templateId: string;
    childName: string;
    childAge: string;
    childGender: 'male' | 'female';
    transformedPhotoUrl: string;
    bookDetails: {
      title: string;
      description: string;
      thumbnailUrl: string;
      imageURLs: string[];
      storyTexts: string[];
      narrationURLs: string[];
      numberOfPages: 12 | 24;
      tags: string[];
    };
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
    const payload = JSON.parse(event.body || '{}') as StoryWebhookPayload;
    console.log('Received payload:', payload);

    // Gerekli alanları kontrol et
    if (!payload.data?.storyId || !payload.data?.userId) {
      throw new Error('Missing required fields: storyId or userId');
    }

    // Hikaye kaydını güncelle
    const storyRef = database.ref(`userStories/${payload.data.userId}/${payload.data.storyId}`);
    
    // Mevcut veriyi al
    const snapshot = await storyRef.get();
    if (!snapshot.exists()) {
      throw new Error('Story not found');
    }

    const existingData = snapshot.val();
    
    // Güncellenecek veriyi hazırla
    const updateData = {
      ...existingData,
      status: 'completed',
      title: payload.data.bookDetails.title,
      description: payload.data.bookDetails.description,
      thumbnailUrl: payload.data.bookDetails.thumbnailUrl,
      imageURLs: payload.data.bookDetails.imageURLs,
      storyTexts: payload.data.bookDetails.storyTexts,
      narrationURLs: payload.data.bookDetails.narrationURLs,
      numberOfPages: payload.data.bookDetails.numberOfPages,
      tags: payload.data.bookDetails.tags,
      updatedAt: new Date().toISOString()
    };

    console.log('Updating story with data:', updateData);

    // Veriyi güncelle
    await storyRef.update(updateData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Story creation completed successfully'
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