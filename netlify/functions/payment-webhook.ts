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

const STORY_WEBHOOK_URL = process.env.VITE_PAYMENT_WEBHOOK_URL;
const MAKE_WEBHOOK_API_KEY = process.env.VITE_MAKE_WEBHOOK_API_KEY;

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

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        // Get metadata from the session
        const { storyId, userId, templateId } = session.metadata || {};
        
        if (!storyId || !userId) {
          throw new Error('Missing required metadata');
        }

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

        // Notify Make.com to start story creation
        if (STORY_WEBHOOK_URL) {
          await fetch(STORY_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': MAKE_WEBHOOK_API_KEY!
            },
            body: JSON.stringify({
              action: 'create_story',
              data: {
                storyId,
                userId,
                templateId
              }
            })
          });
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const { storyId, userId } = session.metadata || {};
        
        if (storyId && userId) {
          // Delete the story record since payment expired
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