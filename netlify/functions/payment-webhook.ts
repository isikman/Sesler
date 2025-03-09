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

interface IyzicoWebhookPayload {
  status: 'success' | 'failure';
  paymentId: string;
  conversationId: string; // Bu bizim story ID'miz olacak
  userId: string;
  price: number;
  paidPrice: number;
  currency: string;
  paymentStatus: string;
  fraudStatus: number;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  binNumber: string;
  lastFourDigits: string;
  basketId: string;
  itemTransactions: Array<{
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: number;
    price: number;
    paidPrice: number;
    merchantCommissionRate: number;
    merchantCommissionRateAmount: number;
    iyziCommissionRateAmount: number;
    iyziCommissionFee: number;
    blockageRate: number;
    blockageRateAmountMerchant: number;
    blockageRateAmountSubMerchant: number;
    blockageResolvedDate: string;
    subMerchantPrice: number;
    subMerchantPayoutRate: number;
    subMerchantPayoutAmount: number;
    merchantPayoutAmount: number;
  }>;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as IyzicoWebhookPayload;
    console.log('Received Iyzico webhook:', payload);

    if (payload.status === 'success') {
      // Ödeme başarılı - hikaye durumunu güncelle
      const storyRef = database.ref(`userStories/${payload.userId}/${payload.conversationId}`);
      
      await storyRef.update({
        paymentStatus: 'completed',
        paymentDetails: {
          paymentId: payload.paymentId,
          amount: payload.paidPrice,
          currency: payload.currency,
          cardType: payload.cardType,
          lastFourDigits: payload.lastFourDigits,
          paidAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Payment processed successfully'
        })
      };
    } else {
      // Ödeme başarısız - hikaye durumunu güncelle
      const storyRef = database.ref(`userStories/${payload.userId}/${payload.conversationId}`);
      
      await storyRef.update({
        paymentStatus: 'failed',
        paymentError: payload.paymentStatus,
        updatedAt: new Date().toISOString()
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: 'Payment failed',
          error: payload.paymentStatus
        })
      };
    }
  } catch (error) {
    console.error('Payment webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};