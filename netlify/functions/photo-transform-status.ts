import { Handler } from '@netlify/functions';

interface TransformStatusPayload {
  success: boolean;
  transformedImageUrl?: string;
  error?: string;
  message?: string;
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
    const payload = JSON.parse(event.body || '{}') as TransformStatusPayload;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: payload.success,
        transformedImageUrl: payload.transformedImageUrl,
        message: payload.message || (payload.success ? 'Fotoğraf başarıyla dönüştürüldü' : 'Görsel uygun bulunmadı. Lütfen yeni görsel yükleyin.'),
        error: payload.error
      })
    };
  } catch (error) {
    console.error('Transform status webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};