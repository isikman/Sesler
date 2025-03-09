import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

function fireConfetti() {
  const shapes = ['square', 'circle', 'star'];
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  const confettiConfig = {
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: colors,
    shapes: shapes,
    gravity: 0.7,
    scalar: 2,
    drift: 0.5,
    ticks: 300,
    startVelocity: 35,
  };

  // Orta noktadan konfeti patlaması
  confetti({
    ...confettiConfig,
    origin: { x: 0.5, y: 0.5 }
  });

  // Sağ ve sol noktalardan ekstra patlamalar
  setTimeout(() => {
    confetti({
      ...confettiConfig,
      origin: { x: 0.45, y: 0.5 },
      angle: 80,
    });
    confetti({
      ...confettiConfig,
      origin: { x: 0.55, y: 0.5 },
      angle: 100,
    });
  }, 200);

  // Yıldız şeklinde özel konfetiler
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF69B4'],
      shapes: ['star'],
      gravity: 0.5,
      scalar: 4,
      drift: 1.5,
      ticks: 350,
      startVelocity: 50,
    });
  }, 400);
}

export default function LoginSuccess() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const shouldShow = location.state?.showLoginSuccess;
    if (shouldShow) {
      setShow(true);
      
      // Konfetileri göster
      const confettiTimer = setTimeout(() => {
        fireConfetti();
      }, 100);
      
      // Komponenti kaldır ve yönlendir
      const navigateTimer = setTimeout(() => {
        setShow(false);
        navigate('/dashboard', { replace: true, state: {} });
      }, 1500);

      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(navigateTimer);
      };
    }
  }, [navigate, location]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 pointer-events-none" />
  );
}