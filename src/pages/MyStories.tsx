import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userStoryService } from '../services/userStoryService';
import { UserStory } from '../types/story';
import { Book, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import StoryReader from '../components/StoryReader';
import toast from 'react-hot-toast';

export default function MyStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeStories = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Initializing stories for user:', user.uid);
        
        // Realtime updates için subscribe ol
        unsubscribe = userStoryService.subscribeToUserStories(user.uid, (updatedStories) => {
          console.log('Stories updated:', updatedStories);
          setStories(updatedStories);
          setIsLoading(false);
        }, (error) => {
          console.error('Stories subscription error:', error);
          setError('Masallarınız yüklenirken bir hata oluştu');
          setIsLoading(false);
          toast.error('Masallarınız yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        });

      } catch (error) {
        console.error('Error initializing stories:', error);
        setError('Masallarınız yüklenirken bir hata oluştu');
        setIsLoading(false);
        toast.error('Masallarınız yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      }
    };

    initializeStories();

    return () => {
      if (unsubscribe) {
        console.log('Cleaning up stories subscription');
        unsubscribe();
      }
    };
  }, [user]);

  const currentStory = stories.find(story => story.id === selectedStory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Masallarınız yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oturum Açmanız Gerekiyor</h2>
        <p className="text-gray-600">
          Masallarınızı görüntülemek için lütfen oturum açın.
        </p>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-16">
        <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz Masalınız Yok</h2>
        <p className="text-gray-600">
          Yeni bir masal oluşturmak için "Masalını Yarat" butonuna tıklayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Masallarım</h1>
        <p className="text-gray-600 mt-2">
          Oluşturduğunuz ve oluşturulmakta olan masallarınız
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden">
              <img
                src={story.status === 'completed' ? (story.thumbnailUrl || story.transformedPhotoUrl) : story.transformedPhotoUrl}
                alt={`${story.childName}'in Masalı`}
                className={`w-full h-full object-cover ${story.status !== 'completed' && 'opacity-50'}`}
              />
              
              {story.status === 'completed' ? (
                <button
                  onClick={() => setSelectedStory(story.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium"
                >
                  Masalı Oku
                </button>
              ) : (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Clock className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                    <p className="font-medium">Hazırlanıyor...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {story.childName}'in Masalı
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(story.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {story.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Hazır
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-orange-500">
                    <Clock className="w-4 h-4" />
                    Hazırlanıyor
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Reader */}
      {currentStory && currentStory.status === 'completed' && (
        <StoryReader
          story={{
            id: currentStory.id,
            title: currentStory.title || `${currentStory.childName}'in Masalı`,
            description: currentStory.description || 'Kişiye özel oluşturulmuş masal',
            bookNumber: parseInt(currentStory.id.split('_')[2]) || 1,
            thumbnailURL: currentStory.thumbnailUrl || currentStory.transformedPhotoUrl,
            originalPhotoURL: currentStory.transformedPhotoUrl,
            numberOfPages: currentStory.numberOfPages || 12,
            tags: currentStory.tags || ['Kişisel Masal', currentStory.childGender === 'male' ? 'Erkek' : 'Kız', `${currentStory.childAge} Yaş`],
            imageURLs: currentStory.imageUrls || [],
            storyTexts: currentStory.storyTexts || [],
            narrationURLs: currentStory.narrationUrls || [],
            createdAt: currentStory.createdAt,
            updatedAt: currentStory.updatedAt,
            userId: currentStory.userId
          }}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}