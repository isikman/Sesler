import { User } from 'firebase/auth';

const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL;

interface WebhookResponse {
  Status: string;
}

class MakeService {
  private async sendToWebhook(data: any): Promise<WebhookResponse> {
    if (!MAKE_WEBHOOK_URL) {
      throw new Error('Make.com webhook URL is not configured');
    }

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async notifyUserSignUp(user: User): Promise<void> {
    try {
      const response = await this.sendToWebhook({
        type: 'signup',
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });

      if (response.Status !== 'User Registration Successful') {
        console.warn('Unexpected webhook response for signup:', response);
      }
    } catch (error) {
      // Webhook hatası olsa bile sessizce devam et
      console.error('Failed to notify user signup:', error);
    }
  }

  async notifyUserSignIn(user: User): Promise<void> {
    try {
      const response = await this.sendToWebhook({
        type: 'signin',
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: new Date().toISOString(),
      });

      if (response.Status !== 'User Login Successful') {
        console.warn('Unexpected webhook response for signin:', response);
      }
    } catch (error) {
      // Webhook hatası olsa bile sessizce devam et
      console.error('Failed to notify user signin:', error);
    }
  }
}

export const makeService = new MakeService();