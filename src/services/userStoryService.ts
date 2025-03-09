import { ref, get, query, orderByChild, equalTo, onValue, off, DatabaseReference } from 'firebase/database';
import { database } from '../lib/firebase';
import { UserStory } from '../types/story';

class UserStoryService {
  private cacheUpdateCallbacks: Set<() => void> = new Set();

  onCacheUpdate(callback: () => void) {
    this.cacheUpdateCallbacks.add(callback);
    return () => {
      this.cacheUpdateCallbacks.delete(callback);
    };
  }

  private notifyCacheUpdate() {
    this.cacheUpdateCallbacks.forEach(callback => callback());
  }

  private processStoryData(id: string, userId: string, data: any): UserStory {
    // Eğer data bir string ise, JSON parse etmeyi dene
    let storyData = typeof data === 'string' ? JSON.parse(data) : data;

    // Veri yapısını düzelt ve varsayılan değerleri ekle
    return {
      id,
      userId,
      userEmail: storyData.userEmail || '',
      templateId: storyData.templateId || '',
      childName: storyData.childName || '',
      childAge: storyData.childAge || '',
      childGender: storyData.childGender || 'male',
      transformedPhotoUrl: storyData.transformedPhotoUrl || '',
      status: storyData.status || 'creating',
      createdAt: storyData.createdAt || new Date().toISOString(),
      updatedAt: storyData.updatedAt || new Date().toISOString(),
      // Tamamlanmış hikayeler için ek alanlar
      title: storyData.title,
      description: storyData.description,
      thumbnailUrl: storyData.thumbnailUrl,
      imageUrls: storyData.imageUrls || [],
      storyTexts: storyData.storyTexts || [],
      narrationUrls: storyData.narrationUrls || []
    };
  }

  async getUserStories(userId: string): Promise<UserStory[]> {
    if (!userId) {
      console.error('getUserStories: No userId provided');
      return [];
    }

    try {
      console.log('Fetching stories for user:', userId);
      const userStoriesRef = ref(database, `userStories/${userId}`);
      
      const snapshot = await get(userStoriesRef);
      console.log('Stories snapshot exists:', snapshot.exists());

      if (!snapshot.exists()) {
        return [];
      }

      const storiesData = snapshot.val();
      console.log('Raw stories data:', storiesData);

      // Veri yapısını kontrol et ve düzelt
      const stories = Object.entries(storiesData).map(([id, data]) => 
        this.processStoryData(id, userId, data)
      );

      console.log('Processed stories:', stories);
      return stories;
    } catch (error) {
      console.error('Error in getUserStories:', error);
      throw error;
    }
  }

  subscribeToUserStories(
    userId: string, 
    callback: (stories: UserStory[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    if (!userId) {
      console.error('subscribeToUserStories: No userId provided');
      return () => {};
    }

    console.log('Setting up subscription for user:', userId);
    const userStoriesRef = ref(database, `userStories/${userId}`);
    
    const handleSnapshot = (snapshot: any) => {
      try {
        console.log('Received stories update');
        if (snapshot.exists()) {
          const storiesData = snapshot.val();
          console.log('Raw stories update data:', storiesData);
          
          const stories = Object.entries(storiesData).map(([id, data]) => 
            this.processStoryData(id, userId, data)
          );
          
          console.log('Processed stories update:', stories);
          callback(stories);
        } else {
          console.log('No stories found in update');
          callback([]);
        }
      } catch (error) {
        console.error('Error processing stories update:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Unknown error'));
        }
        callback([]);
      }
    };

    const handleError = (error: Error) => {
      console.error('Stories subscription error:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    };

    onValue(userStoriesRef, handleSnapshot, handleError);

    return () => {
      console.log('Cleaning up stories subscription');
      off(userStoriesRef);
    };
  }

  async getStoryById(userId: string, storyId: string): Promise<UserStory | null> {
    if (!userId || !storyId) {
      console.error('getStoryById: Missing userId or storyId');
      return null;
    }

    try {
      console.log(`Fetching story ${storyId} for user ${userId}`);
      const storyRef = ref(database, `userStories/${userId}/${storyId}`);
      const snapshot = await get(storyRef);

      if (!snapshot.exists()) {
        console.log('Story not found');
        return null;
      }

      return this.processStoryData(storyId, userId, snapshot.val());
    } catch (error) {
      console.error('Error in getStoryById:', error);
      throw error;
    }
  }
}

export const userStoryService = new UserStoryService();