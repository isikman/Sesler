import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { storyId, userId, userEmail, templateId } = JSON.parse(event.body || '{}');

    if (!storyId || !userId || !userEmail || !templateId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.URL}/my-stories?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/dashboard?payment_cancelled=true`,
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.VITE_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        storyId,
        userId,
        templateId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        checkoutUrl: session.url
      })
    };
  } catch (error) {
    console.error('Create checkout session error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};