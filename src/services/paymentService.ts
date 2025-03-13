import { User } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '../lib/firebase';

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

class PaymentService {
  private readonly STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  async initiatePayment(
    user: User,
    templateId: string,
    childName: string,
    childAge: string,
    childGender: 'male' | 'female',
    transformedPhotoUrl: string,
    transformId?: string
  ): Promise<PaymentResponse> {
    let storyId: string | null = null;

    try {
      // Validate required parameters
      if (!user || !user.uid || !user.email) {
        throw new Error('User information is missing');
      }

      if (!templateId || !childName || !childAge || !childGender || !transformedPhotoUrl) {
        throw new Error('Required story information is missing');
      }

      if (!this.STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe configuration is missing');
      }

      // Create story ID using template ID
      storyId = `${templateId}_${user.uid}_${Date.now()}`;

      // Create initial record in Firebase with pending payment status
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
        transformId,
        status: 'creating',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firebase
      await set(storyRef, storyData);

      // Create Stripe checkout session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          userId: user.uid,
          userEmail: user.email,
          templateId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create checkout session: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      if (!responseData.success || !responseData.checkoutUrl) {
        throw new Error(responseData.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = responseData.checkoutUrl;

      return {
        success: true,
        paymentUrl: responseData.checkoutUrl
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      
      // Clean up Firebase record on error
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