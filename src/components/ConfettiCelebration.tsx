import React, { useEffect, useRef } from 'react';

interface ConfettiCelebrationProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'diamond' | 'rect' | 'circle' | 'sparkle';
}

const COLORS = [
  '#38BDF8', // Cyan
  '#F59E0B', // Gold
  '#EF4444', // Red
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
  '#BAE6FD', // Ice Blue
];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 120 celebratory confetti particles originating from the center
    const particles: Particle[] = [];
    const centerX = width / 2;
    const centerY = height * 0.45;

    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      const shapes: Particle['shape'][] = ['diamond', 'rect', 'circle', 'sparkle'];
      
      particles.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // slight upward explosion
        size: 5 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    let animationId: number;
    let startTime = Date.now();
    const duration = 3800; // 3.8 seconds celebration

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Physics: gravity + air resistance
        p.vy += 0.16;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out towards the end
        if (elapsed > duration - 1200) {
          p.opacity = Math.max(0, (duration - elapsed) / 1200);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === 'diamond') {
          // Faceted diamond shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.7, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.7, 0);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'sparkle') {
          // 4-point star sparkle
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.25, -p.size * 0.25);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.25, p.size * 0.25);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.25, p.size * 0.25);
          ctx.lineTo(-p.size, 0);
          ctx.lineTo(-p.size * 0.25, -p.size * 0.25);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Confetti ribbon rectangle
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none w-full h-full"
    />
  );
};
