"use client";

/**
 * AnimatedHeroBackground - Client Component
 * Premium animated gradient mesh with floating orbs for hero section
 */

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  offset: number;
}

export function AnimatedHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Orb configurations with vibrant gradient colors
    const orbs: Orb[] = [
      {
        x: 0.2,
        y: 0.3,
        size: 300,
        color: "rgba(59, 130, 246, 0.4)",
        speed: 0.0008,
        offset: 0,
      },
      {
        x: 0.8,
        y: 0.2,
        size: 250,
        color: "rgba(139, 92, 246, 0.35)",
        speed: 0.001,
        offset: 2,
      },
      {
        x: 0.5,
        y: 0.7,
        size: 280,
        color: "rgba(16, 185, 129, 0.3)",
        speed: 0.0006,
        offset: 1,
      },
      {
        x: 0.1,
        y: 0.8,
        size: 200,
        color: "rgba(6, 182, 212, 0.35)",
        speed: 0.0012,
        offset: 3,
      },
      {
        x: 0.9,
        y: 0.6,
        size: 220,
        color: "rgba(245, 158, 11, 0.25)",
        speed: 0.0009,
        offset: 1.5,
      },
    ];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawOrb = (orb: Orb, t: number) => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Gentle floating motion
      const floatX = Math.sin(t * orb.speed + orb.offset) * 30;
      const floatY = Math.cos(t * orb.speed * 1.3 + orb.offset) * 20;

      const x = orb.x * width + floatX;
      const y = orb.y * height + floatY;

      // Radial gradient for soft glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.size);
      gradient.addColorStop(0, orb.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(x, y, orb.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = () => {
      time += 16; // ~60fps
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw base gradient
      const baseGradient = ctx.createLinearGradient(
        0,
        0,
        canvas.offsetWidth,
        canvas.offsetHeight,
      );
      baseGradient.addColorStop(0, "#0f172a"); // slate-900
      baseGradient.addColorStop(0.5, "#1e293b"); // slate-800
      baseGradient.addColorStop(1, "#0f172a"); // slate-900
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw floating orbs
      orbs.forEach((orb) => drawOrb(orb, time));

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: "blur(60px)" }}
    />
  );
}
