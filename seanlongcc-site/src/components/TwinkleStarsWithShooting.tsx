import { useRef, useEffect } from 'react';

interface TwinkleWithShootingProps {
  count?: number;          // number of background stars
  shootingRate?: number;   // chance per frame to spawn a shooting star (0–1)
  className?: string;      // allow z-indexing, layering
}

type Star     = { x: number; y: number; alpha: number; dAlpha: number };
type Shooting = { x: number; y: number; len: number; speed: number; age: number };

const TwinkleStarsWithShooting = ({
  count = 300,
  shootingRate = 0,
  className = ''
}: TwinkleWithShootingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // background stars
    const stars: Star[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      alpha: Math.random(),
      dAlpha: Math.random() * 0.02 + 0.005,
    }));

    // active shooting stars
    const shoot: Shooting[] = [];

    const frame = () => {
      // clear transparent
      ctx.clearRect(0, 0, w, h);

      // draw twinkle
      for (const s of stars) {
        s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fillRect(s.x, s.y, 2, 2);
      }

      // maybe spawn a shooting star
      if (Math.random() < shootingRate) {
        shoot.push({
          x: Math.random() * w * 0.5,     // start on left half
          y: Math.random() * h * 0.3,     // top third
          len: Math.random() * 200 + 100, // length between 100–300px
          speed: Math.random() * 8 + 4,   // speed px/frame
          age: 0,
        });
      }

      // draw shooting stars
      for (let i = shoot.length - 1; i >= 0; i--) {
        const s = shoot[i];
        const dx = s.speed;
        const dy = s.speed;
        // head
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x + s.len * dx / Math.hypot(dx,dy),
          s.y + s.len * dy / Math.hypot(dx,dy)
        );
        ctx.stroke();

        // advance
        s.x += dx;
        s.y += dy;
        s.age++;
        // remove when off screen or too old
        if (s.x > w || s.y > h || s.age > 150) shoot.splice(i, 1);
      }

      requestAnimationFrame(frame);
    };

    frame();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [count, shootingRate]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} absolute inset-0 w-full h-full pointer-events-none`}
    />
  );
};

export default TwinkleStarsWithShooting;
