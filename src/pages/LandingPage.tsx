import React, { useState, lazy, Suspense } from 'react';
import { Wand2, Sparkles, Mic, Book, Star, ArrowRight, Upload, Info } from 'lucide-react';
import { IMAGES } from '../constants/assets';
import Navbar from '../components/Navbar';
import SparkleEffect from '../components/SparkleEffect';

// Memoize FeatureCard component
const FeatureCard = React.memo(({ icon, title, description, emoji }: { icon: React.ReactNode; title: string; description: string; emoji: string }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center group hover:scale-105 transition-all duration-300 border border-blue-100 shadow-lg hover:shadow-blue-100">
      <div className="inline-block p-3 bg-gradient-to-br from-red-400 to-red-500 rounded-full mb-4 group-hover:rotate-12 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
        {title} <span className="group-hover:animate-bounce">{emoji}</span>
      </h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => Array.from({ length: 16 }, (_, i) => currentYear - 15 + i), [currentYear]);
  const months = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const days = React.useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/50 to-gray-50 text-gray-800 overflow-hidden">
      <Navbar />
      {/* Magical Background Elements */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5"></div>
      <SparkleEffect />

      {/* Content */}
      <div className="relative">
        {/* Hero Section */}
        <header className="container mx-auto px-4 pt-8 pb-32 md:pt-16 md:pb-40">
          <div className="text-center mb-8 relative">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                Masal Dünyasına
                <br />
                Hoş Geldiniz
              </span>
              <span className="inline-block animate-bounce ml-2">✨</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in">
              Çocuğunuzun hayal dünyasını keşfedin ve onu kendi masalının kahramanı yapın
            </p>
            <button className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 mx-auto transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-100 group">
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Masalını Yarat</span>
              <span className="group-hover:translate-x-1 transition-transform">🌟</span>
            </button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-5xl mx-auto">
            <div className="hero-image-container">
              <img
                src={IMAGES.hero}
                alt="Magical forest scene with a child"
                className="hero-image w-full"
                loading="eager"
                decoding="async"
              />
            </div>
            
            {/* Example Images */}
            <div className="example-images-container">
              <img
                src={IMAGES.examples.kitchen}
                alt="Kitchen scene example"
                className="example-image left"
                loading="lazy"
                decoding="async"
              />
              <img
                src={IMAGES.examples.playground}
                alt="Playground scene example"
                className="example-image center"
                loading="lazy"
                decoding="async"
              />
              <img
                src={IMAGES.examples.park}
                alt="Park scene example"
                className="example-image right"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                Sihirli Özellikler
              </span>
              <span className="inline-block animate-bounce ml-2">🎭</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Star className="w-8 h-8 text-white" />}
                title="Kişiye Özel Masallar"
                description="Her çocuğa özel, benzersiz hikayeler"
                emoji="📚"
              />
              <FeatureCard
                icon={<Sparkles className="w-8 h-8 text-white" />}
                title="Yapay Zeka Sihiri"
                description="AI ile sınırsız hayal gücü"
                emoji="✨"
              />
              <FeatureCard
                icon={<Mic className="w-8 h-8 text-white" />}
                title="Sesli Masallar"
                description="Büyülü sesli anlatımlar"
                emoji="🎙️"
              />
              <FeatureCard
                icon={<Book className="w-8 h-8 text-white" />}
                title="Özel Kitaplar"
                description="Kişiye özel basılı kitaplar"
                emoji="📖"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left side - Image Transformation Preview */}
              <div className="flex-1 relative">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={IMAGES.transformation.after}
                    alt="Transformed cartoon character"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Original photo overlay */}
                  <div className="absolute top-6 left-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={IMAGES.transformation.before}
                        alt="Original photo"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <button className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full flex items-center gap-2 transition-all duration-300 shadow-xl hover:shadow-red-200 group">
                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Fotoğraf Yükle
                  </button>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="flex-1 space-y-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Çocuğunuzun adı nedir?
                  </h2>
                  <input
                    type="text"
                    placeholder="Örn: Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl text-xl bg-white/80 backdrop-blur-sm border-2 border-blue-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Doğum tarihi?
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="w-full px-6 py-4 rounded-xl text-xl bg-white/80 backdrop-blur-sm border-2 border-blue-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-center appearance-none cursor-pointer"
                      >
                        <option value="">GG</option>
                        {days.map(day => (
                          <option key={day} value={day}>{day.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="w-full px-6 py-4 rounded-xl text-xl bg-white/80 backdrop-blur-sm border-2 border-blue-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-center appearance-none cursor-pointer"
                      >
                        <option value="">AA</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month.toString().padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="w-full px-6 py-4 rounded-xl text-xl bg-white/80 backdrop-blur-sm border-2 border-blue-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-center appearance-none cursor-pointer"
                      >
                        <option value="">YYYY</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Cinsiyeti
                  </h2>
                  <div className="flex gap-4">
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="gender"
                        className="sr-only peer"
                        checked={gender === 'male'}
                        onChange={() => setGender('male')}
                      />
                      <div className="p-6 text-center rounded-xl border-2 border-blue-100 peer-checked:border-blue-300 peer-checked:bg-blue-50 cursor-pointer transition-all duration-300 hover:border-blue-200">
                        <span className="text-2xl font-medium text-gray-700">Erkek</span>
                      </div>
                    </label>
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="gender"
                        className="sr-only peer"
                        checked={gender === 'female'}
                        onChange={() => setGender('female')}
                      />
                      <div className="p-6 text-center rounded-xl border-2 border-pink-100 peer-checked:border-pink-300 peer-checked:bg-pink-50 cursor-pointer transition-all duration-300 hover:border-pink-200">
                        <span className="text-2xl font-medium text-gray-700">Kız</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-6 rounded-xl text-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-100 flex items-center justify-center gap-3 group">
                  <span>Devam Et</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-100">
                  <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Bu bilgileri çocuğunuzun yaşına ve cinsiyetine uygun, benzersiz bir karakter oluşturmak için kullanıyoruz. Yapay zeka teknolojimiz sayesinde gerçekçi ve kişiselleştirilmiş bir deneyim sunuyoruz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}