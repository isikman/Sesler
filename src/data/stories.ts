import { Story } from '../types/story';
import { BACKGROUND_MUSIC } from '../constants/audio';

export const stories: Story[] = [
  {
    id: 'magical-forest',
    title: 'Sihirli Orman Macerası',
    description: 'Gizemli ağaçların arasında unutulmaz bir macera...',
    thumbnailURL: 'https://res.cloudinary.com/dthertt8t/image/upload/v1739723141/Leonardo_Kino_XL_Illustrate_a_thrilling_3D_Pixarstyle_scene_of_0_z91sfq.jpg',
    originalPhotoURL: 'https://res.cloudinary.com/dthertt8t/image/upload/v1739723144/AlbedoBase_XL_A_child_with_a_messy_bun_hairstyle_medium_comple_0_edfplh.jpg',
    narrationURLs: [
      'https://example.com/narrations/magical-forest/part1.mp3',
      'https://example.com/narrations/magical-forest/part2.mp3',
      'https://example.com/narrations/magical-forest/part3.mp3',
      'https://example.com/narrations/magical-forest/part4.mp3'
    ],
    themes: ['Cesaret', 'Keşif', 'Doğa Sevgisi'],
    isFeatured: true,
    bookNumber: 1,
    numberOfPages: 12,
    imageURLs: [
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723141/Leonardo_Kino_XL_Illustrate_a_thrilling_3D_Pixarstyle_scene_of_0_z91sfq.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723144/AlbedoBase_XL_A_child_with_a_messy_bun_hairstyle_medium_comple_0_edfplh.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723145/AlbedoBase_XL_Alp_laughing_and_pointing_at_playful_monkeys_cli_0_lep1wk.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723141/AlbedoBase_XL_A_highly_detailed_3Drendered_illustration_of_Emm_0_l0pbuf.jpg'
    ],
    storyTexts: [
      'Bir varmış bir yokmuş, uzak diyarlarda büyülü bir orman varmış. Bu ormanın derinliklerinde, rengârenk çiçekler ve konuşan ağaçlar yaşarmış.',
      'Küçük bir kız olan Ela, bir gün bu sihirli ormanın içinde kaybolmuş. Ama korkacağına, bu muhteşem yerin güzelliklerine hayran kalmış.',
      'Ela ormanda ilerlerken, parlak renkli bir kelebek dikkatini çekmiş. Kelebek ona el sallıyor gibiymiş!',
      'Kelebeği takip eden Ela, konuşan çiçeklerle dolu büyülü bir açıklığa varmış. Çiçekler ona gülümseyerek selam vermişler.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'space-adventure',
    title: 'Uzay Yolculuğu',
    description: 'Yıldızlar arasında heyecan dolu bir keşif...',
    thumbnailURL: 'https://res.cloudinary.com/dthertt8t/image/upload/v1739723144/AlbedoBase_XL_A_cheerful_young_boy_named_Necmi_with_brown_laye_0_1_tvkjlo.jpg',
    originalPhotoURL: 'https://res.cloudinary.com/dthertt8t/image/upload/v1739730853/Leonardo_Kino_XL_A_highly_detailed_3Drendered_illustration_cap_0_qa1usz.jpg',
    narrationURLs: [
      'https://example.com/narrations/space-adventure/part1.mp3',
      'https://example.com/narrations/space-adventure/part2.mp3',
      'https://example.com/narrations/space-adventure/part3.mp3',
      'https://example.com/narrations/space-adventure/part4.mp3'
    ],
    themes: ['Merak', 'Keşif', 'Bilim'],
    isFeatured: false,
    bookNumber: 2,
    numberOfPages: 8,
    imageURLs: [
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723144/AlbedoBase_XL_A_cheerful_young_boy_named_Necmi_with_brown_laye_0_1_tvkjlo.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739730853/Leonardo_Kino_XL_A_highly_detailed_3Drendered_illustration_cap_0_qa1usz.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723141/Leonardo_Kino_XL_Illustrate_a_thrilling_3D_Pixarstyle_scene_of_0_z91sfq.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723144/AlbedoBase_XL_A_cheerful_young_boy_named_Necmi_with_brown_laye_0_1_tvkjlo.jpg'
    ],
    storyTexts: [
      'Küçük Necmi, her gece yatmadan önce yıldızlara bakardı. Bir gece, parlak bir ışık gördü ve pencereye yaklaştı.',
      'Işık, aslında küçük bir uzay gemisiydi! Gemi, Necmi\'nin penceresinin önünde durdu ve kapısını açtı.',
      'Necmi tereddüt etmeden gemiye bindi. İçeride onu bekleyen sevimli bir uzaylı vardı!',
      'Böylece Necmi\'nin galaksiler arası yolculuğu başladı. Yıldızların arasında süzülürken, hayallerinin gerçek olduğuna inanamıyordu.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'underwater-kingdom',
    title: 'Denizaltı Krallığı',
    description: 'Okyanus derinliklerinde büyülü bir dünya...',
    thumbnailURL: 'https://res.cloudinary.com/dthertt8t/image/upload/v1739731012/Leonardo_Phoenix_10_Alp_a_3_year_old_Male_with_Buzz_Cut_Dark_B_1_uclbyi.jpg',
    originalPhotoURL: 'https://res.cloudinary.com/dthertt8t/image/upload/v1739723145/AlbedoBase_XL_Alp_laughing_and_pointing_at_playful_monkeys_cli_0_lep1wk.jpg',
    narrationURLs: [
      'https://example.com/narrations/underwater-kingdom/part1.mp3',
      'https://example.com/narrations/underwater-kingdom/part2.mp3',
      'https://example.com/narrations/underwater-kingdom/part3.mp3',
      'https://example.com/narrations/underwater-kingdom/part4.mp3'
    ],
    themes: ['Arkadaşlık', 'Yardımlaşma', 'Doğa Sevgisi'],
    isFeatured: false,
    bookNumber: 3,
    numberOfPages: 8,
    imageURLs: [
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739731012/Leonardo_Phoenix_10_Alp_a_3_year_old_Male_with_Buzz_Cut_Dark_B_1_uclbyi.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723141/Leonardo_Kino_XL_Illustrate_a_thrilling_3D_Pixarstyle_scene_of_0_z91sfq.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739723145/AlbedoBase_XL_Alp_laughing_and_pointing_at_playful_monkeys_cli_0_lep1wk.jpg',
      'https://res.cloudinary.com/dthertt8t/image/upload/v1739731012/Leonardo_Phoenix_10_Alp_a_3_year_old_Male_with_Buzz_Cut_Dark_B_1_uclbyi.jpg'
    ],
    storyTexts: [
      'Alp, sahilde oynarken parlak bir deniz kabuğu buldu. Kabuğu kulağına götürdüğünde, gizemli bir ses duydu.',
      'Ses onu denize çağırıyordu. Alp suya dokunduğunda, ayakları birden yüzgeçlere dönüştü!',
      'Denizin altında muhteşem bir krallık vardı. Renkli mercanlar, dans eden denizatları ve konuşan balıklar...',
      'Deniz Kralı, Alp\'i sarayına davet etti. Burada geçirdiği her an, yeni bir macera doluydu.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];