import React, { useState, useEffect } from 'react';
import { Eye, Wand2, Crown, Star, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = () => {
      const searchParams = new URLSearchParams(location.search);
      const sessionId = searchParams.get('session_id');

      if (sessionId) {
        // Show success message
        toast.success('Ödeme başarılı! Masalınız hazırlanıyor... Masallarım sayfasından takip edebilirsiniz.', {
          duration: 5000,
        });

        // Clear URL parameters and navigate
        window.history.replaceState({}, '', '/my-stories');
        navigate('/my-stories', { replace: true });
      }
    };

    handlePaymentSuccess();
  }, [location.search, navigate]);

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
    setSelectedStory(null);
    setTemplateStory(storyId);
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
    <div className="space-y-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hoş Geldin, Maceraperest! ✨
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
            Bugün hangi büyülü hikayeyi keşfetmek istersin? Hazır şablonlardan birini seç veya kendi masalını yarat.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full filter blur-2xl opacity-20 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Featured Story */}
      {featuredStory && (
        <div className="relative">
          <div className="absolute -inset-1">
            <div className="w-full h-full mx-auto rotate-180 opacity-30 blur-lg filter bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500" />
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl">
            <div className="absolute top-6 left-6 z-20">
              <div className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-full shadow-lg">
                <Crown className="w-5 h-5" />
                <span className="font-medium">Haftanın Masalı</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                <img
                  src={featuredStory.thumbnailURL}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleReadStory(featuredStory.id, featuredStory.title)}
                    className="px-6 py-3 bg-white text-gray-900 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Oku</span>
                  </button>
                  <button 
                    onClick={() => handleUseTemplate(featuredStory.id)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span>Taslağı Kullan</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-center lg:pr-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{featuredStory.title}</h2>
                <p className="text-gray-600 text-lg mb-6">{featuredStory.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {featuredStory.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600"
                    >
                      <Star className="w-4 h-4" />
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleReadStory(featuredStory.id, featuredStory.title)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-lg group"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Hemen Oku</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Stories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          Diğer Masallar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularStories.map((story) => (
            <div
              key={story.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
              
              <div className="relative">
                <div className="absolute -top-4 -left-4 z-20 group-hover:top-4 group-hover:left-4 transition-all duration-500">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg transform -rotate-12 group-hover:rotate-0 transition-all duration-500 hover:scale-110">
                    <img
                      src={story.originalPhotoURL}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="aspect-[3/2] relative overflow-hidden">
                  <img
                    src={story.thumbnailURL}
                    alt={story.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleReadStory(story.id, story.title)}
                      className="px-4 py-2 bg-white text-gray-900 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Oku</span>
                    </button>
                    <button 
                      onClick={() => handleUseTemplate(story.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Taslağı Kullan</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{story.title}</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <StoryLoadingModal
        isOpen={isLoading}
        onComplete={handleLoadingComplete}
        storyTitle={loadingStoryTitle}
      />

      {currentStory && (
        <StoryReader
          story={currentStory}
          onClose={() => setSelectedStory(null)}
          onUseTemplate={() => handleStoryTemplateUse(currentStory.id)}
        />
      )}

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