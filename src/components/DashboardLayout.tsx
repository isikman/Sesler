import React from 'react';
import { Compass, Wand2, Book, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { icon: Compass, label: 'Keşfet', path: '/dashboard' },
  { icon: Wand2, label: 'Masalını Yarat', path: '/create-story' },
  { icon: Book, label: 'Masallarım', path: '/my-stories' },
];

// Falling shapes configuration
const shapes = [
  { type: 'circle', color: 'bg-blue-400' },
  { type: 'square', color: 'bg-purple-400' },
  { type: 'triangle', color: 'bg-pink-400' },
  { type: 'star', color: 'bg-yellow-400' },
  { type: 'heart', color: 'bg-red-400' },
];

const FallingShape = ({ shape, delay }: { shape: typeof shapes[0], delay: number }) => {
  const getShapeClass = () => {
    switch (shape.type) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg rotate-45';
      case 'triangle':
        return 'clip-path-triangle';
      case 'star':
        return 'clip-path-star';
      case 'heart':
        return 'clip-path-heart';
      default:
        return '';
    }
  };

  return (
    <div
      className={`absolute w-8 h-8 ${shape.color} ${getShapeClass()} animate-fall backdrop-blur-sm opacity-60`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
        zIndex: 20
      }}
    />
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 relative">
        {/* Background Container */}
        <div className="fixed left-0 top-0 w-64 h-screen overflow-hidden">
          {/* Magical Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 z-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 z-5" />
          
          {/* Falling Shapes Container */}
          <div className="absolute inset-0 opacity-70 z-15 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <FallingShape
                key={i}
                shape={shapes[i % shapes.length]}
                delay={i * 2}
              />
            ))}
          </div>

          {/* Content Container with consistent blur */}
          <div className="relative h-screen flex flex-col bg-white/20 z-20">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                MasalAI
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-white/30 hover:text-blue-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-700 hover:bg-white/30 hover:text-red-600 transition-all group"
              >
                <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}