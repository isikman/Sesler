import { Handler } from '@netlify/functions';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import Stripe from 'stripe';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
});

const database = getDatabase(app);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Make.com webhook çağrısı fonksiyonu
async function notifyMakeWebhook(webhookUrl: string, apiKey: string, data: any) {
  console.log('Sending webhook to Make.com:', { webhookUrl, data });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(data),
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Make.com webhook response:', responseData);
    return true;
  } catch (error) {
    console.error('Make.com webhook error:', error);
    return false;
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  const stripeSignature = event.headers['stripe-signature'];
  
  if (!stripeSignature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing stripe signature' })
    };
  }

  try {
    // Verify and construct the event
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received stripe event:', stripeEvent.type);

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        console.log('Processing completed session:', session.id);

        // Get payment intent to access metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        
        // Get metadata from the payment intent
        const { storyId, userId, templateId, webhookUrl, apiKey } = paymentIntent.metadata || {};
        
        if (!storyId || !userId) {
          throw new Error('Missing required metadata');
        }

        console.log('Updating Firebase status for story:', storyId);

        // Update story payment status in Firebase
        const storyRef = database.ref(`userStories/${userId}/${storyId}`);
        await storyRef.update({
          paymentStatus: 'completed',
          paymentDetails: {
            sessionId: session.id,
            amount: session.amount_total,
            currency: session.currency,
            paymentIntent: session.payment_intent,
            customerEmail: session.customer_email,
            paidAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        });

        console.log('Firebase update completed');

        // Notify Make.com to start story creation
        if (webhookUrl && apiKey) {
          console.log('Notifying Make.com webhook');
          
          const webhookData = {
            action: 'create_story',
            data: {
              storyId,
              userId,
              templateId,
              sessionId: session.id
            }
          };

          const webhookSuccess = await notifyMakeWebhook(webhookUrl, apiKey, webhookData);
          
          if (!webhookSuccess) {
            console.error('Failed to notify Make.com webhook');
          } else {
            console.log('Make.com webhook notified successfully');
          }
        } else {
          console.warn('Missing webhook URL or API key in payment intent metadata');
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        // Get payment intent to access metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        const { storyId, userId } = paymentIntent.metadata || {};
        
        if (storyId && userId) {
          console.log('Deleting expired story record:', storyId);
          const storyRef = database.ref(`userStories/${userId}/${storyId}`);
          await storyRef.remove();
        }
        
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};