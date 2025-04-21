import { useRef, useEffect } from 'react';

interface WarpSpeedProps {
  starCount?: number;
  speed?: number;
  speedOnHover?: number;
  starColor?: string;
  /** hover radius in pixels around origin point */
  hoverRadius?: number;
}

const WarpSpeed = ({
  starCount = 1000,
  speed = 5,
  speedOnHover = 25,
  starColor = 'white',
  hoverRadius = 100,
}: WarpSpeedProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<{ x: number; y: number; z: number }[]>([]);
  const currentSpeed = useRef(speed);

  useEffect(() => {
    currentSpeed.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const originFactor = 0.7;
    let originX = w * originFactor;
    let originY = h / 2;
    const maxDepth = w;

    const initStar = () => ({
      x: Math.random() * w - w / 2,
      y: Math.random() * h - h / 2,
      z: Math.random() * maxDepth,
    });

    stars.current = Array.from({ length: starCount }).map(initStar);

    // mousemove listener for hover region
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - originX;
      const dy = y - originY;
      const dist = Math.hypot(dx, dy);
      if (dist < hoverRadius) {
        currentSpeed.current = speedOnHover;
      } else {
        currentSpeed.current = speed;
      }
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const render = () => {
      const vel = currentSpeed.current * 0.05;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = starColor;

      for (const star of stars.current) {
        star.z -= vel;
        if (star.z <= 0) Object.assign(star, initStar());
        const k = 128 / star.z;
        const px = star.x * k + originX;
        const py = star.y * k + originY;
        const tailK = 128 / (star.z + vel);
        const tx = star.x * tailK + originX;
        const ty = star.y * tailK + originY;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      originX = w * originFactor;
      originY = h / 2;
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [starCount, starColor, speed, speedOnHover, hoverRadius]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default WarpSpeed;
