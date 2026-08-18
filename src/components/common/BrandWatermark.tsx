'use client'

import Image from 'next/image'

/**
 * Shared background watermark (national emblem) rendered behind every
 * screen — login and the app shell alike — so the effect is identical
 * everywhere instead of each page rolling its own copy.
 *
 * Fix for the "inaonekana login pekee / haionekani light mode" bug:
 * the old login page forced `mix-blend-screen` unconditionally. Screen
 * blending lightens pixels toward the base layer, so on a light/white
 * background it washes the emblem out almost completely. Blend mode is
 * now only applied in dark mode (`dark:mix-blend-screen`); in light
 * mode we rely on plain low opacity, which stays visible on any
 * background.
 */
export function BrandWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* soft glow gives the flat emblem a bit of depth/lift */}
      <div className="absolute left-1/2 top-[8%] h-[min(80vw,900px)] w-[min(80vw,900px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(45,212,191,0.16),transparent_65%)]" />

      <div className="absolute left-1/2 top-1/2 h-[min(72vw,780px)] w-[min(72vw,780px)] -translate-x-1/2 -translate-y-1/2 [perspective:1600px]">
        <Image
          src="/assets/tanzania-emblem.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 90vw, 780px"
          className="select-none object-contain object-center opacity-[0.07] [transform:rotateX(8deg)_rotateZ(-1.5deg)] drop-shadow-[0_40px_60px_rgba(15,23,42,0.35)] dark:opacity-[0.14] dark:drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)] dark:mix-blend-screen"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(20,184,166,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_50%_8%,rgba(20,184,166,0.12),transparent_32%)]" />
    </div>
  )
}
