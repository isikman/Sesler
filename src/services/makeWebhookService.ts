import { ref, set, remove, get, getDatabase } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { StoryBasicInfo, StoryDetails } from '../types/story';
import { storyService } from './storyService';

// Webhook işlem tipleri
export type WebhookAction = 'create' | 'update' | 'delete' | 'set-weekly-favorite';

// Webhook'tan gelen veri yapısı
export interface WebhookPayload {
  action: WebhookAction;
  apiKey: string;
  data: {
    id?: string;
    story?: {
      basicInfo: StoryBasicInfo;
      details: StoryDetails;
    };
    weeklyFavoriteId?: string;
  };
}

// Webhook yanıt yapısı
export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class MakeWebhookService {
  private readonly API_KEY = process.env.VITE_MAKE_WEBHOOK_API_KEY;

  private validateApiKey(apiKey: string): boolean {
    return apiKey === this.API_KEY;
  }

  async handleWebhook(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      if (!this.validateApiKey(payload.apiKey)) {
        return {
          success: false,
          message: 'Invalid API key'
        };
      }

      switch (payload.action) {
        case 'create':
          return await this.createStory(payload.data.story!);
        
        case 'update':
          return await this.updateStory(payload.data.id!, payload.data.story!);
        
        case 'delete':
          return await this.deleteStory(payload.data.id!);
        
        case 'set-weekly-favorite':
          return await this.setWeeklyFavorite(payload.data.weeklyFavoriteId!);
        
        default:
          return {
            success: false,
            message: 'Invalid action'
          };
      }
    } catch (error) {
      console.error('Webhook error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async updateWeeklyFavoriteStatus(newFavoriteId: string | null = null) {
    try {
      // Tüm story template'lerini al
      const snapshot = await get(ref(database, 'storyTemplates'));
      if (!snapshot.exists()) return;

      const templates = snapshot.val();
      
      // Her template için kontrol et ve güncelle
      for (const [id, template] of Object.entries(templates)) {
        if (template.isWeeklyFavorite && id !== newFavoriteId) {
          // Eğer mevcut bir weekly favorite varsa ve yeni seçilen değilse, false yap
          await set(ref(database, `storyTemplates/${id}`), {
            ...template,
            isWeeklyFavorite: false,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error updating weekly favorite status:', error);
      throw error;
    }
  }

  private async createStory(story: { basicInfo: StoryBasicInfo; details: StoryDetails }): Promise<WebhookResponse> {
    try {
      // Eğer yeni hikaye weekly favorite olarak işaretlendiyse, diğerlerini güncelle
      if (story.basicInfo.isWeeklyFavorite) {
        await this.updateWeeklyFavoriteStatus(story.basicInfo.id);
      }

      // Yeni hikaye için referans oluştur
      const storyRef = ref(database, `storyTemplates/${story.basicInfo.id}`);

      // Hikayeyi kaydet
      await set(storyRef, {
        ...story.basicInfo,
        ...story.details,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Cache'i temizle
      storyService.clearCache();

      return {
        success: true,
        message: 'Story created successfully',
        data: { id: story.basicInfo.id }
      };
    } catch (error) {
      console.error('Create story error:', error);
      throw new Error('Failed to create story');
    }
  }

  private async updateStory(id: string, story: { basicInfo: StoryBasicInfo; details: StoryDetails }): Promise<WebhookResponse> {
    try {
      // Eğer hikaye weekly favorite olarak işaretlendiyse, diğerlerini güncelle
      if (story.basicInfo.isWeeklyFavorite) {
        await this.updateWeeklyFavoriteStatus(id);
      }

      const storyRef = ref(database, `storyTemplates/${id}`);
      await set(storyRef, {
        ...story.basicInfo,
        ...story.details,
        updatedAt: new Date().toISOString()
      });

      storyService.clearCache();

      return {
        success: true,
        message: 'Story updated successfully'
      };
    } catch (error) {
      console.error('Update story error:', error);
      throw new Error('Failed to update story');
    }
  }

  private async deleteStory(id: string): Promise<WebhookResponse> {
    try {
      const storyRef = ref(database, `storyTemplates/${id}`);
      
      // Silinecek hikayeyi kontrol et
      const snapshot = await get(storyRef);
      if (snapshot.exists()) {
        const story = snapshot.val();
        // Eğer weekly favorite olan bir hikaye siliniyorsa, başka bir işlem yapmaya gerek yok
        if (story.isWeeklyFavorite) {
          console.log('Weekly favorite story is being deleted');
        }
      }

      await remove(storyRef);
      storyService.clearCache();

      return {
        success: true,
        message: 'Story deleted successfully'
      };
    } catch (error) {
      console.error('Delete story error:', error);
      throw new Error('Failed to delete story');
    }
  }

  private async setWeeklyFavorite(id: string): Promise<WebhookResponse> {
    try {
      // Önce diğer weekly favorite'ları false yap
      await this.updateWeeklyFavoriteStatus(id);

      // Seçilen hikayeyi weekly favorite yap
      const templateRef = ref(database, `storyTemplates/${id}`);
      const snapshot = await get(templateRef);
      
      if (!snapshot.exists()) {
        throw new Error('Template not found');
      }

      const template = snapshot.val();
      await set(templateRef, {
        ...template,
        isWeeklyFavorite: true,
        updatedAt: new Date().toISOString()
      });

      storyService.clearCache();

      return {
        success: true,
        message: 'Weekly favorite set successfully'
      };
    } catch (error) {
      console.error('Set weekly favorite error:', error);
      throw new Error('Failed to set weekly favorite');
    }
  }
}

export const makeWebhookService = new MakeWebhookService();