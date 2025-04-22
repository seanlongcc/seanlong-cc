import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface WarpSpeedProps {
  starCount?: number;
  speed?: number;
  speedOnHover?: number;
  starColor?: string;
  /** hover radius in pixels around origin point */
  hoverRadius?: number;
  /** notify parent when hover starts/stops */
  onHoverChange?: (hovering: boolean) => void;
}

const WarpSpeed = ({
  starCount = 1000,
  speed = 5,
  speedOnHover = 25,
  starColor = 'white',
  hoverRadius = 100,
  onHoverChange,
}: WarpSpeedProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<{ x: number; y: number; z: number }[]>([]);
  // use a mutable object so GSAP can tween its .value
  const speedObj = useRef({ value: speed });
  const lastHover = useRef(false);

  // if the `speed` prop itself changes, reset our base speed
  useEffect(() => {
    speedObj.current.value = speed;
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

    // easing functions
    const rampUp = () => {
      gsap.to(speedObj.current, {
        value: speedOnHover,
        duration: 0.4,
        ease: 'power1.out',
      });
    };
    const rampDown = () => {
      gsap.to(speedObj.current, {
        value: speed,
        duration: 0.6,
        ease: 'power1.out',
      });
    };

    // hover detection
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dx = mx - originX;
      const dy = my - originY;
      const dist = Math.hypot(dx, dy);
      const hovering = dist < hoverRadius;

      // only trigger tweens on state change
      if (hovering && !lastHover.current) {
        lastHover.current = true;
        rampUp();
        onHoverChange?.(true);
      } else if (!hovering && lastHover.current) {
        lastHover.current = false;
        rampDown();
        onHoverChange?.(false);
      }
    };
    const handleMouseLeave = () => {
      if (lastHover.current) {
        lastHover.current = false;
        rampDown();
        onHoverChange?.(false);
      }
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // resize handling
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      originX = w * originFactor;
      originY = h / 2;
    };
    window.addEventListener('resize', handleResize);

    // draw loop via GSAP ticker
    const renderFrame = () => {
      const vel = speedObj.current.value * 0.05;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = starColor;

      for (const star of stars.current) {
        star.z -= vel;
        if (star.z <= 0) Object.assign(star, initStar());

        const k = 128 / star.z;
        const px = star.x * k + originX;
        const py = star.y * k + originY;
        const k2 = 128 / (star.z + vel);
        const tx = star.x * k2 + originX;
        const ty = star.y * k2 + originY;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    };
    gsap.ticker.add(renderFrame);

    return () => {
      gsap.ticker.remove(renderFrame);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [starCount, speedOnHover, starColor, hoverRadius, speed, onHoverChange]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default WarpSpeed;
