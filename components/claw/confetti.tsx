"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const COLORS = ["#ffca28", "#fbbf24", "#f5f5f5", "#c084fc"];
const PARTICLE_COUNT = 70;

export function Confetti() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    const ratio = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
    };
    resize();

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: (2 + Math.random() * 4) * ratio,
      speed: (0.15 + Math.random() * 0.5) * ratio,
      drift: (Math.random() - 0.5) * 0.4 * ratio,
      spin: (Math.random() - 0.5) * 0.05,
      angle: Math.random() * Math.PI,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.35 + Math.random() * 0.5,
    }));

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.y += particle.speed;
        particle.x += particle.drift;
        particle.angle += particle.spin;
        if (particle.y > canvas.height + particle.size) {
          particle.y = -particle.size;
          particle.x = Math.random() * canvas.width;
        }
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.angle);
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        context.restore();
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
