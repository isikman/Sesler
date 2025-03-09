import React, { useState, useEffect } from 'react';
import { Eye, Wand2, Crown, Star } from 'lucide-react';
import StoryReader from '../components/StoryReader';
import StoryTemplateModal from '../components/StoryTemplateModal';
import StoryLoadingModal from '../components/StoryLoadingModal';
import { storyService } from '../services/storyService';
import { Story } from '../types/story';
import { validateFirebaseConfig, testDatabaseConnection } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [templateStory, setTemplateStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStoryTitle, setLoadingStoryTitle] = useState('');
  const [loadingStoryId, setLoadingStoryId] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        validateFirebaseConfig();
        await testDatabaseConnection();
        await loadStories();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsInitialLoad(false);
      }
    };

    initializeDashboard();

    const unsubscribe = storyService.onCacheUpdate(() => {
      loadStories();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadStories = async () => {
    try {
      const templates = await storyService.getStoryTemplates();
      
      const storiesWithDetails = await Promise.all(
        templates.map(async (template) => {
          try {
            const details = await storyService.getStoryDetails(template.id);
            if (details) {
              return {
                ...template,
                ...details,
                createdAt: template.createdAt || new Date().toISOString(),
                updatedAt: template.updatedAt || new Date().toISOString()
              };
            }
          } catch (error) {
            console.error(`Error loading details for story ${template.id}:`, error);
          }
          return null;
        })
      );

      const validStories = storiesWithDetails.filter((story): story is Story => story !== null);
      setStories(validStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast.error('Hikayeler yüklenirken bir hata oluştu.');
    }
  };

  const handleReadStory = (storyId: string, title: string) => {
    setLoadingStoryTitle(title);
    setLoadingStoryId(storyId);
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setSelectedStory(loadingStoryId);
  };

  const handleUseTemplate = (storyId: string) => {
    setTemplateStory(storyId);
  };

  const handleStoryTemplateUse = (storyId: string) => {
    setSelectedStory(null); // Close the story reader
    setTemplateStory(storyId); // Open the template modal
  };

  const currentStory = stories.find(story => story.id === selectedStory);
  const currentTemplate = stories.find(story => story.id === templateStory);
  const featuredStory = stories.find(story => story.isWeeklyFavorite);
  const regularStories = stories.filter(story => !story.isWeeklyFavorite);

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Masallar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Keşfet</h1>
        <p className="text-gray-600 mt-2">
          Hazır masal şablonlarından birini seç veya kendi masalını yarat
        </p>
      </div>

      {/* Haftanın Hikayesi */}
      {featuredStory && (
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden shadow-lg border border-blue-100">
          <div className="absolute top-4 left-4 bg-yellow-400 text-white px-4 py-1 rounded-full flex items-center gap-2 shadow-lg z-20">
            <Crown className="w-4 h-4" />
            <span className="font-medium">Haftanın Hikayesi</span>
          </div>
          
          {/* Original Photo Circle */}
          <div className="absolute top-4 right-4 z-20">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg transform hover:scale-110 transition-all duration-300">
              <img
                src={featuredStory.originalPhotoURL}
                alt="Original photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Orijinal Fotoğraf</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Sol Taraf - Görsel */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
              <img
                src={featuredStory.thumbnailURL}
                alt={featuredStory.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay with buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleReadStory(featuredStory.id, featuredStory.title)}
                  className="px-6 py-3 bg-white text-gray-900 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors text-lg"
                >
                  <Eye className="w-5 h-5" />
                  <span>Oku</span>
                </button>
                <button 
                  onClick={() => handleUseTemplate(featuredStory.id)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 transition-colors text-lg"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Taslağı Kullan</span>
                </button>
              </div>
            </div>

            {/* Sağ Taraf - İçerik */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{featuredStory.title}</h2>
              <p className="text-gray-600 mb-6">{featuredStory.description}</p>
              
              {/* Theme Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {featuredStory.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                  >
                    <Star className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleReadStory(featuredStory.id, featuredStory.title)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>Hemen Oku</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diğer Hikayeler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularStories.map((story) => (
          <div
            key={story.id}
            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Original Photo Circle */}
            <div className="absolute -top-4 -left-4 z-20 group-hover:top-4 group-hover:left-4 transition-all duration-300">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg transform -rotate-12 group-hover:rotate-0 transition-all duration-300 hover:scale-110">
                <img
                  src={story.originalPhotoURL}
                  alt="Original photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 right-0 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm transform -rotate-12 opacity-0 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-300">
                Orijinal
              </div>
            </div>

            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden">
              <img
                src={story.thumbnailURL}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay with buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleReadStory(story.id, story.title)}
                  className="px-4 py-2 bg-white text-gray-900 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Oku</span>
                </button>
                <button 
                  onClick={() => handleUseTemplate(story.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Taslağı Kullan</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{story.title}</h3>
              
              {/* Theme Tags */}
              <div className="flex flex-wrap gap-2">
                {story.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Modal */}
      <StoryLoadingModal
        isOpen={isLoading}
        onComplete={handleLoadingComplete}
        storyTitle={loadingStoryTitle}
      />

      {/* Story Reader Modal */}
      {currentStory && (
        <StoryReader
          story={currentStory}
          onClose={() => setSelectedStory(null)}
          onUseTemplate={() => handleStoryTemplateUse(currentStory.id)}
        />
      )}

      {/* Story Template Modal */}
      {currentTemplate && (
        <StoryTemplateModal
          story={currentTemplate}
          isOpen={!!templateStory}
          onClose={() => setTemplateStory(null)}
        />
      )}
    </div>
  );
}