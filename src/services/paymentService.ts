import { User } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '../lib/firebase';

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

class PaymentService {
  private readonly PAYMENT_WEBHOOK_URL = import.meta.env.VITE_PAYMENT_WEBHOOK_URL;
  private readonly API_KEY = import.meta.env.VITE_MAKE_WEBHOOK_API_KEY;

  async initiatePayment(
    user: User,
    templateId: string,
    childName: string,
    childAge: string,
    childGender: 'male' | 'female',
    transformedPhotoUrl: string
  ): Promise<PaymentResponse> {
    let storyId: string | null = null;

    try {
      // Gerekli parametreleri kontrol et
      if (!user || !user.uid || !user.email) {
        throw new Error('User information is missing');
      }

      if (!templateId || !childName || !childAge || !childGender || !transformedPhotoUrl) {
        throw new Error('Required story information is missing');
      }

      // Template ID'yi kullanarak story ID oluştur
      storyId = `${templateId}_${user.uid}_${Date.now()}`;

      // Firebase'e creating statüsünde kayıt oluştur
      const storyRef = ref(database, `userStories/${user.uid}/${storyId}`);
      
      const storyData = {
        id: storyId,
        userId: user.uid,
        userEmail: user.email,
        templateId,
        childName,
        childAge,
        childGender,
        transformedPhotoUrl,
        status: 'creating',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Firebase'e kaydet
      await set(storyRef, storyData);

      // Make.com'a hikaye oluşturma isteği gönder
      const webhookData = {
        "action": "create_story",
        "data": {
          "storyId": storyId,
          "userId": user.uid,
          "userEmail": user.email,
          "templateId": templateId,
          "childName": childName,
          "childAge": childAge,
          "childGender": childGender,
          "transformedPhotoUrl": transformedPhotoUrl
        }
      };

      console.log('Sending webhook request to:', this.PAYMENT_WEBHOOK_URL);
      console.log('Webhook data:', JSON.stringify(webhookData, null, 2));

      const makeResponse = await fetch(this.PAYMENT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.API_KEY
        },
        body: JSON.stringify(webhookData)
      });

      if (!makeResponse.ok) {
        const errorText = await makeResponse.text();
        console.error('Webhook response error:', {
          status: makeResponse.status,
          statusText: makeResponse.statusText,
          body: errorText
        });
        throw new Error(`Story creation request failed: ${makeResponse.status} ${makeResponse.statusText}`);
      }

      const responseData = await makeResponse.json();
      console.log('Webhook response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.message || 'Story creation failed');
      }

      return {
        success: true,
        paymentUrl: '/my-stories' // Test için direkt masallarım sayfasına yönlendir
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      
      // Hata durumunda Firebase'deki kaydı sil
      if (user?.uid && storyId) {
        try {
          const storyRef = ref(database, `userStories/${user.uid}/${storyId}`);
          await set(storyRef, null);
        } catch (deleteError) {
          console.error('Error cleaning up failed story:', deleteError);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const paymentService = new PaymentService();