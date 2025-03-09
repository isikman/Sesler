export interface StoryBasicInfo {
  id: string;
  title: string;
  description: string;
  bookNumber: number;
  thumbnailURL: string; // For preview cards (landscape: 1920x1080)
  coverImageURL: string; // For front/back cover (portrait: 1100x1466)
  originalPhotoURL: string;
  numberOfPages: 12 | 24;
  tags: string[];
  isWeeklyFavorite?: boolean;
}

export interface StoryDetails {
  imageURLs: string[]; // For spread pages (landscape: 2200x1466)
  storyTexts: string[];
  narrationURLs: string[];
}

export interface Story extends StoryBasicInfo, StoryDetails {
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface UserStory {
  id: string;
  userId: string;
  userEmail: string;
  templateId: string;
  childName: string;
  childAge: string;
  childGender: 'male' | 'female';
  transformedPhotoUrl: string;
  status: 'creating' | 'completed';
  createdAt: string;
  updatedAt: string;
  // Tamamlanmış hikayeler için ek alanlar
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  storyTexts?: string[];
  narrationUrls?: string[];
}