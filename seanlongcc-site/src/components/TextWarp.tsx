import { useRef, useEffect } from 'react';
import gsap from 'gsap';

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
  text = '                            annyeonghaseyo, sean imnida                                                             ',
  spacing = 1500,
  speed = 25,
  baseFontSize = 128,
  color = 'white',
  originXFactor = 0.7,
  originYFactor = 0.5,
}: TextWarpProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zPositions = useRef<number[]>([]);
  const xOffsets = useRef<number[]>([]);
  // use an object so GSAP can tween its .value
  const speedObj = useRef({ value: speed });

  // ease speedObj.value toward new speed prop
  useEffect(() => {
    gsap.to(speedObj.current, {
      value: speed,
      duration: 0.6,
      ease: 'power1.out',
    });
  }, [speed]);

  // main init effect (no speed dep)
  useEffect(() => {
    const chars = Array.from(text!);
    const count = chars.length;
    const maxDepth = spacing * count;

    // seed positions
    zPositions.current = chars.map((_, i) => spacing * (i + 1));
    xOffsets.current = chars.map(
      (_, i) => (i - (count - 1) / 2) * baseFontSize
    );

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const origin = () => ({
      x: w * originXFactor,
      y: h * originYFactor,
    });
    const focal = () => w;

    // draw each tick
    const renderFrame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      zPositions.current.forEach((z0, i) => {
        let z = z0;
        if (z <= 0) z += maxDepth;

        const k = focal() / z;
        const px = origin().x + xOffsets.current[i] * k;
        const py = origin().y;
        const size = baseFontSize * k;

        ctx.font = `${size}px sans-serif`;
        ctx.fillText(chars[i], px, py);

        // advance by eased speed
        zPositions.current[i] = z - speedObj.current.value;
      });
    };

    // hook into GSAP ticker ~60fps
    gsap.ticker.add(renderFrame);

    // handle resize
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      gsap.ticker.remove(renderFrame);
      window.removeEventListener('resize', onResize);
    };
  }, [
    text,
    spacing,
    baseFontSize,
    color,
    originXFactor,
    originYFactor,
    // note: speed is intentionally omitted
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default TextWarp;
