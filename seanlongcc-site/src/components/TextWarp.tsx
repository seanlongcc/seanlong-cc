// src/components/TextWarp.tsx
import { useRef, useEffect } from 'react';

interface TextWarpProps {
  /** The text string to animate */
  text?: string;
  /** Depth spacing between letters (px) */
  spacing?: number;
  /** Speed of letters moving forward (px per frame) */
  speed?: number;
  /** Base font size for the nearest letter (px) */
  baseFontSize?: number;
  /** Color of the letters */
  color?: string;
  /** Fractional horizontal origin (0–1) where letters converge */
  originXFactor?: number;
  /** Fractional vertical origin (0–1) where letters converge */
  originYFactor?: number;
}

const TextWarp = ({
  text = '                            annyeonghaseyo, sean imnida                                         ',
  spacing = 400,
  speed = 15,
  baseFontSize = 96,
  color = 'white',
  originXFactor = .7,
  originYFactor = 0.5,
}: TextWarpProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zPositions = useRef<number[]>([]);
  const xOffsets = useRef<number[]>([]);

  useEffect(() => {
    const chars = Array.from(text!);
    const count = chars.length;
    const maxDepth = spacing * count;

    // First letter nearest, trailing letters behind
    zPositions.current = chars.map((_, i) => spacing * (i + 1));
    // Horizontal fan left-to-right: first on left, last on right
    xOffsets.current = chars.map((_, i) => (i - (count - 1) / 2) * baseFontSize);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const originX0 = w * originXFactor;
    const originY0 = h * originYFactor;
    const focal = w;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      chars.forEach((char, i) => {
        let z = zPositions.current[i] - speed;
        if (z <= 0) z += maxDepth;
        zPositions.current[i] = z;

        const k = focal / z;
        const px = originX0 + xOffsets.current[i] * k;
        const py = originY0;
        const size = baseFontSize * k;

        ctx.font = `${size}px sans-serif`;
        ctx.fillText(char, px, py);
      });

      requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [text, spacing, speed, baseFontSize, color, originXFactor, originYFactor]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default TextWarp;