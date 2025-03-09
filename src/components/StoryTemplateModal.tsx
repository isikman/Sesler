import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, ChevronRight, ChevronLeft, Camera, Info, Wand2 } from 'lucide-react';
import { Story } from '../types/story';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';

interface StoryTemplateModalProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
}

interface TransformResponse {
  success: boolean;
  transformedImageUrl: string;
  message?: string;
  error?: string;
}

export default function StoryTemplateModal({ story, isOpen, onClose }: StoryTemplateModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    gender: '' as 'male' | 'female' | '',
    photo: null as File | null
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (file: File) => {
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setTransformedUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!formData.photo || !user?.email || !formData.childName || !formData.age || !formData.gender) {
      toast.error('Lütfen tüm bilgileri doldurun');
      return;
    }

    setIsTransforming(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('photo', formData.photo);
      formDataToSend.append('email', user.email);
      formDataToSend.append('templateId', story.id);
      formDataToSend.append('childName', formData.childName);
      formDataToSend.append('childAge', formData.age);
      formDataToSend.append('childGender', formData.gender);

      const response = await fetch(import.meta.env.VITE_PHOTO_TRANSFORM_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': import.meta.env.VITE_MAKE_WEBHOOK_API_KEY
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Transform request failed');
      }

      const data: TransformResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Dönüştürme işlemi başarısız oldu');
      }

      setTransformedUrl(data.transformedImageUrl);
      toast.success(data.message || 'Fotoğraf başarıyla dönüştürüldü');
    } catch (error) {
      console.error('Transform error:', error);
      toast.error('Fotoğraf dönüştürülürken bir hata oluştu');
    } finally {
      setIsTransforming(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.photo || !transformedUrl) {
      toast.error('Lütfen tüm bilgileri doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await paymentService.initiatePayment(
        user,
        story.id,
        formData.childName,
        formData.age,
        formData.gender as 'male' | 'female',
        transformedUrl
      );

      if (!response.success) {
        throw new Error(response.error || 'Hikaye oluşturma başlatılamadı');
      }

      toast.success('Hikayeniz oluşturulmaya başlandı! Masallarım sayfasından takip edebilirsiniz.');
      onClose();
      
      // Yönlendirme öncesi kısa bir gecikme ekle
      setTimeout(() => {
        navigate('/my-stories');
      }, 1500);
    } catch (error) {
      console.error('Story creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>

          <div className="p-6 pb-0 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 1 && "Çocuğunuzun Adı"}
              {step === 2 && "Yaş ve Cinsiyet"}
              {step === 3 && "Fotoğraf Yükleme"}
            </h2>
            <p className="text-gray-600">
              {step === 1 && "Masalın kahramanı olacak çocuğunuzun adını girin"}
              {step === 2 && "Çocuğunuzun yaşını ve cinsiyetini seçin"}
              {step === 3 && "Çocuğunuzun bir fotoğrafını yükleyin"}
            </p>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.childName}
                    onChange={(e) => setFormData(prev => ({ ...prev, childName: e.target.value }))}
                    placeholder="Örn: Ali"
                    className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all"
                  />
                  <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yaş</label>
                  <select
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all"
                  >
                    <option value="">Yaş seçin</option>
                    {Array.from({ length: 16 }, (_, i) => (
                      <option key={i} value={i}>{i} yaş</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.gender === 'male'
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <span className="text-2xl mb-2">👦</span>
                      <span className="block font-medium">Erkek</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.gender === 'female'
                          ? 'border-pink-400 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-200'
                      }`}
                    >
                      <span className="text-2xl mb-2">👧</span>
                      <span className="block font-medium">Kız</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-4 text-xs text-gray-500">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                  <p>
                    Bu bilgileri çocuğunuzun yaşına ve cinsiyetine uygun, benzersiz bir karakter oluşturmak için kullanıyoruz. Yapay zeka teknolojimiz sayesinde gerçekçi ve kişiselleştirilmiş bir deneyim sunuyoruz.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div 
                    className={`relative h-64 rounded-xl border-2 border-dashed transition-all ${
                      isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="relative h-full">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setPreviewUrl(null);
                            setTransformedUrl(null);
                            setFormData(prev => ({ ...prev, photo: null }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Fotoğrafı sürükleyip bırakın veya
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Dosya Seçin
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative h-64 rounded-xl border-2 border-gray-200 overflow-hidden">
                  {isTransforming ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600 font-medium">Fotoğraf Dönüştürülüyor...</p>
                      <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin</p>
                    </div>
                  ) : transformedUrl ? (
                    <img
                      src={transformedUrl}
                      alt="Transformed"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                      <Wand2 className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 text-center px-4">
                        Fotoğrafınızı yükledikten sonra<br />dönüştürme işlemini başlatın
                      </p>
                    </div>
                  )}
                </div>

                {previewUrl && !transformedUrl && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <button
                      onClick={handleTransform}
                      disabled={isTransforming}
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center justify-center hover:from-purple-600 hover:to-purple-700 transition-all group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-200 hover:scale-110"
                    >
                      {isTransforming ? (
                        <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Wand2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                      )}
                    </button>
                    {!isTransforming && (
                      <p className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-sm font-medium text-gray-600 whitespace-nowrap">
                        Dönüştürmek için tıkla
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Geri
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
              disabled={
                (step === 1 && !formData.childName) ||
                (step === 2 && (!formData.age || !formData.gender)) ||
                (step === 3 && (!transformedUrl || !formData.photo)) ||
                isSubmitting
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <span>{step === 3 ? 'Masalı Oluştur' : 'Devam Et'}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}