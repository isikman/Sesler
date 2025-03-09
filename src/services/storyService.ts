import { ref, get, set, query, orderByChild, equalTo, onValue, off, DataSnapshot } from 'firebase/database';
import { database } from '../lib/firebase';
import { Story, StoryTemplate, UserStory, StoryBasicInfo, StoryDetails } from '../types/story';

interface CacheData {
  templates: StoryBasicInfo[];
  weeklyFavorite: StoryBasicInfo | null;
  lastUpdated: string;
  details: { [key: string]: StoryDetails };
}

class StoryService {
  private cache: CacheData | null = null;
  private templatesRef = ref(database, 'storyTemplates');
  private templateListeners: { [key: string]: () => void } = {};
  private cacheUpdateCallbacks: Set<() => void> = new Set();

  constructor() {
    console.log('StoryService initialized');
    this.startRealtimeUpdates();
  }

  private startRealtimeUpdates() {
    console.log('Starting realtime updates...');
    
    const handleSnapshot = (snapshot: DataSnapshot) => {
      console.log('Received database update');
      
      if (snapshot.exists()) {
        try {
          const data = snapshot.val();
          console.log('Raw data from database:', data);
          
          // Tüm template'leri array'e dönüştür ve id'lerini ekle
          const templates = Object.entries(data).map(([id, template]: [string, any]) => ({
            id,
            ...template,
            // imageURLs ve storyTexts'i details'e taşıyacağız
            imageURLs: undefined,
            storyTexts: undefined,
            narrationURLs: undefined
          }));

          console.log('Processed templates:', templates);
          
          const weeklyFavorite = templates.find(t => t.isWeeklyFavorite) || null;
          
          this.saveToCache(templates, weeklyFavorite);
          this.notifyCacheUpdate();
        } catch (error) {
          console.error('Error processing database update:', error);
        }
      } else {
        console.log('No data exists in database');
        this.saveToCache([], null);
        this.notifyCacheUpdate();
      }
    };

    const handleError = (error: Error) => {
      console.error('Database subscription error:', error);
    };

    // Realtime updates için listener ekle
    onValue(this.templatesRef, handleSnapshot, handleError);
  }

  private saveToCache(templates: StoryBasicInfo[], weeklyFavorite: StoryBasicInfo | null) {
    console.log('Saving to cache:', { templates, weeklyFavorite });
    
    this.cache = {
      templates,
      weeklyFavorite,
      lastUpdated: new Date().toISOString(),
      details: this.cache?.details || {}
    };
    
    try {
      localStorage.setItem('story_templates_cache', JSON.stringify(this.cache));
      console.log('Cache saved successfully');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private saveDetailsToCache(templateId: string, details: StoryDetails) {
    if (!this.cache) return;

    this.cache.details[templateId] = details;
    try {
      localStorage.setItem('story_templates_cache', JSON.stringify(this.cache));
      console.log(`Details cached for template ${templateId}`);
    } catch (error) {
      console.error('Error saving details to localStorage:', error);
    }
  }

  private loadFromCache(): CacheData | null {
    try {
      const cached = localStorage.getItem('story_templates_cache');
      if (!cached) {
        console.log('No cache found');
        return null;
      }
      const parsedCache = JSON.parse(cached);
      console.log('Loaded from cache:', parsedCache);
      return parsedCache;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }

  private notifyCacheUpdate() {
    console.log('Notifying cache update subscribers');
    this.cacheUpdateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in cache update callback:', error);
      }
    });
  }

  onCacheUpdate(callback: () => void) {
    console.log('Adding cache update subscriber');
    this.cacheUpdateCallbacks.add(callback);
    return () => {
      console.log('Removing cache update subscriber');
      this.cacheUpdateCallbacks.delete(callback);
    };
  }

  async getStoryTemplates(): Promise<StoryBasicInfo[]> {
    console.log('Getting story templates');
    
    try {
      if (!this.cache) {
        this.cache = this.loadFromCache();
        console.log('Loaded cache state:', this.cache);
      }

      // Her zaman database'den taze veri al
      console.log('Fetching templates from database');
      const snapshot = await get(this.templatesRef);
      
      if (!snapshot.exists()) {
        console.log('No templates found in database');
        return [];
      }

      const data = snapshot.val();
      console.log('Raw database data:', data);

      // Tüm template'leri array'e dönüştür ve id'lerini ekle
      const templates = Object.entries(data).map(([id, template]: [string, any]) => ({
        id,
        ...template,
        // imageURLs ve storyTexts'i details'e taşıyacağız
        imageURLs: undefined,
        storyTexts: undefined,
        narrationURLs: undefined
      }));

      console.log('Processed templates:', templates);
      
      const weeklyFavorite = templates.find(t => t.isWeeklyFavorite) || null;
      this.saveToCache(templates, weeklyFavorite);

      return templates;
    } catch (error) {
      console.error('Error in getStoryTemplates:', error);
      // Hata durumunda cache'den dön
      return this.cache?.templates || [];
    }
  }

  async getStoryDetails(templateId: string): Promise<StoryDetails | null> {
    console.log('Getting story details for:', templateId);
    
    try {
      if (this.cache?.details[templateId]) {
        console.log('Returning cached details');
        return this.cache.details[templateId];
      }

      console.log('Fetching details from database');
      const templateRef = ref(database, `storyTemplates/${templateId}`);
      const snapshot = await get(templateRef);
      
      if (!snapshot.exists()) {
        console.log('No details found in database');
        return null;
      }

      const { imageURLs, storyTexts, narrationURLs } = snapshot.val();
      const details: StoryDetails = { imageURLs, storyTexts, narrationURLs };

      console.log('Fetched details:', details);
      this.saveDetailsToCache(templateId, details);

      return details;
    } catch (error) {
      console.error('Error in getStoryDetails:', error);
      return null;
    }
  }

  clearCache() {
    console.log('Clearing cache');
    localStorage.removeItem('story_templates_cache');
    this.cache = null;
    this.notifyCacheUpdate();
  }

  cleanup() {
    console.log('Cleaning up service');
    Object.values(this.templateListeners).forEach(cleanup => cleanup());
    this.templateListeners = {};
    this.cacheUpdateCallbacks.clear();
  }
}

export const storyService = new StoryService();