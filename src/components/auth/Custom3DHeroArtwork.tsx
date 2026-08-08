import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { motion, AnimatePresence } from 'motion/react';

export const Custom3DHeroArtwork: React.FC = () => {
  const { isDark } = useTheme();
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  return (
    <div
      className={`relative w-full flex-1 min-h-[350px] max-h-[520px] aspect-[16/10] rounded-2xl border flex items-center justify-center p-4 sm:p-6 transition-all duration-700 overflow-hidden select-none shadow-2xl ${
        isDark
          ? 'bg-gradient-to-br from-[#070C18] via-[#0F172A] to-[#0A0F1D] border-[#1E293B] shadow-black/80'
          : 'bg-gradient-to-br from-[#F5F9FF] via-[#ECF4FE] to-[#E2EEFC] border-[#D0E2F5] shadow-slate-300/50'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. SOFT GRADIENT MESH, CENTRAL HALO LIGHT & SUB-PIXEL DOT GRID */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Sub-Pixel Architectural Blueprint Dot Grid */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${isDark ? '#38BDF8' : '#0284C7'} 1.5px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Central Radial Light Halo behind Workstation */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.75, 0.95, 0.75]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-[500px] h-[380px] rounded-full blur-[110px] transition-colors ${
            isDark
              ? 'bg-gradient-to-tr from-blue-600/40 via-cyan-500/25 to-indigo-600/35'
              : 'bg-gradient-to-tr from-sky-300/80 via-blue-200/70 to-indigo-200/80'
          }`}
        />

        {/* Subtle Ambient Light Particles / Specks */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-8, 8, -8],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-1/5 w-2.5 h-2.5 rounded-full bg-sky-400 blur-[1px]"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-14 right-1/4 w-3 h-3 rounded-full bg-teal-400 blur-[1px]"
        />
        <motion.div
          animate={{
            x: [-14, 14, -14],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-10 w-2 h-2 rounded-full bg-indigo-400 blur-[1px]"
        />

        {/* Flowing Curved Ambient Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-25 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -100 200 Q 200 100 400 280 T 900 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className="text-blue-500/40 dark:text-blue-300/40"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. ELEGANT GLASSMORPHISM BUBBLES WITH 3D VECTOR ICONS */}
      {/* ========================================================================= */}

      {/* Bubble 1: Vacation Resort Parasol (Top-Left) */}
      <motion.div
        animate={{
          y: [-7, 7, -7],
          x: [-3, 3, -3],
          rotate: [-1.5, 1.5, -1.5]
        }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        onMouseEnter={() => setHoveredBadge('vacation')}
        onMouseLeave={() => setHoveredBadge(null)}
        className="absolute top-5 left-5 sm:left-10 z-20 cursor-pointer group"
      >
        <div className="relative p-0.5 rounded-full bg-gradient-to-br from-white/95 via-white/60 to-white/20 dark:from-white/30 dark:via-white/10 dark:to-white/5 backdrop-blur-2xl shadow-[0_12px_32px_rgba(245,158,11,0.25)] dark:shadow-[0_14px_35px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-115 hover:rotate-3">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/85 dark:bg-[#111A2E]/85 flex items-center justify-center p-3 sm:p-3.5 border border-white/80 dark:border-slate-700/80 shadow-inner">
            <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
              {/* Parasol Beach Umbrella */}
              <path d="M 30 17 C 21 17 15 22 15 25.5 L 45 25.5 C 45 22 39 17 30 17 Z" fill="#EF4444" />
              <path d="M 22 17 C 20 20 19 23.5 19 25.5 L 27 25.5 C 26 22 25 19 22 17 Z" fill="#FCA5A5" />
              <path d="M 38 17 C 40 20 41 23.5 41 25.5 L 33 25.5 C 34 22 35 19 38 17 Z" fill="#FCA5A5" />
              <path d="M 30 25.5 L 30 43" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 26 43 Q 30 40.5 34 43" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              {/* Glowing Sun */}
              <circle cx="44" cy="15" r="4.5" fill="#F59E0B" />
              <circle cx="44" cy="15" r="7.5" fill="#F59E0B" opacity="0.3" />
              {/* Ocean Waves */}
              <path d="M 13 39 Q 19 36 25 39 Q 31 42 37 39 Q 43 36 47 39" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
              <path d="M 17 44 Q 23 41 29 44 Q 35 47 41 44" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Bubble 2: Leave Calendar Grid (Top Center-Right) */}
      <motion.div
        animate={{
          y: [6, -7, 6],
          x: [2.5, -2.5, 2.5],
          rotate: [1, -1, 1]
        }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        onMouseEnter={() => setHoveredBadge('calendar')}
        onMouseLeave={() => setHoveredBadge(null)}
        className="absolute top-4 left-[53%] -translate-x-1/2 z-20 cursor-pointer group"
      >
        <div className="relative p-0.5 rounded-full bg-gradient-to-br from-white/95 via-white/60 to-white/20 dark:from-white/30 dark:via-white/10 dark:to-white/5 backdrop-blur-2xl shadow-[0_12px_32px_rgba(59,130,246,0.25)] dark:shadow-[0_14px_35px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-115 hover:-rotate-3">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white/85 dark:bg-[#111A2E]/85 flex items-center justify-center p-3 sm:p-3.5 border border-white/80 dark:border-slate-700/80 shadow-inner">
            <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
              <rect x="15" y="16" width="30" height="28" rx="5" fill="#0284C7" />
              <path d="M 15 23 L 45 23" stroke="#0369A1" strokeWidth="2" />
              <rect x="22" y="12" width="3.5" height="7" rx="1.75" fill="#0F172A" />
              <rect x="34" y="12" width="3.5" height="7" rx="1.75" fill="#0F172A" />
              <path d="M 15 21 C 15 18.2 17.2 16 20 16 L 40 16 C 42.8 16 45 18.2 45 21 L 45 23 L 15 23 Z" fill="#F59E0B" />
              <rect x="20" y="27" width="4" height="4" rx="1" fill="#FFFFFF" />
              <rect x="28" y="27" width="4" height="4" rx="1" fill="#FFFFFF" />
              <rect x="36" y="27" width="4" height="4" rx="1" fill="#FFFFFF" />
              <rect x="20" y="35" width="4" height="4" rx="1" fill="#FFFFFF" />
              <rect x="28" y="35" width="4" height="4" rx="1" fill="#F59E0B" />
              <rect x="36" y="35" width="4" height="4" rx="1" fill="#10B981" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Bubble 3: Time Tracking Clock (Right Side) */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          x: [-2, 2, -2],
          rotate: [-1.5, 1.5, -1.5]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        onMouseEnter={() => setHoveredBadge('clock')}
        onMouseLeave={() => setHoveredBadge(null)}
        className="absolute top-1/3 right-3 sm:right-9 z-20 cursor-pointer group"
      >
        <div className="relative p-0.5 rounded-full bg-gradient-to-br from-white/95 via-white/60 to-white/20 dark:from-white/30 dark:via-white/10 dark:to-white/5 backdrop-blur-2xl shadow-[0_12px_32px_rgba(16,185,129,0.25)] dark:shadow-[0_14px_35px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-115 hover:rotate-3">
          <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-white/85 dark:bg-[#111A2E]/85 flex items-center justify-center p-3 sm:p-3.5 border border-white/80 dark:border-slate-700/80 shadow-inner">
            <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
              <circle cx="30" cy="30" r="16" fill="none" stroke="#10B981" strokeWidth="3" />
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '30px 30px' }}
              >
                <line x1="30" y1="30" x2="30" y2="19" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="30" y1="30" x2="39" y2="34" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
              <circle cx="30" cy="30" r="2.5" fill="#0F172A" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Bubble 4: Policy Approval Shield Checkmark (Top Right) */}
      <motion.div
        animate={{
          y: [-5, 5, -5],
          x: [2, -2, 2]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute top-7 right-12 sm:right-24 z-20 cursor-pointer hidden sm:block group"
      >
        <div className="relative p-0.5 rounded-full bg-gradient-to-br from-emerald-400/90 via-teal-400/50 to-transparent backdrop-blur-2xl shadow-[0_10px_25px_rgba(16,185,129,0.25)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-115">
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#111A2E]/90 flex items-center justify-center border border-emerald-400/50 shadow-inner">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Bubble 5: Team Availability Users (Mid Left) */}
      <motion.div
        animate={{
          y: [5, -5, 5],
          x: [-2, 2, -2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-1/2 left-3 sm:left-7 z-20 cursor-pointer hidden sm:block group"
      >
        <div className="relative p-0.5 rounded-full bg-gradient-to-br from-blue-400/90 via-sky-400/50 to-transparent backdrop-blur-2xl shadow-[0_10px_25px_rgba(59,130,246,0.25)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-115">
          <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-[#111A2E]/90 flex items-center justify-center border border-sky-400/50 shadow-inner">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. EDITORIAL SaaS SCENE: WORKSTATION, MONITOR, CHARACTER & BOTANICALS */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-2xl h-full flex flex-col items-center justify-end pt-4 sm:pt-6">
        <svg
          viewBox="0 0 800 480"
          className="w-full h-auto max-h-[370px] filter drop-shadow-2xl select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient Depth Drop Shadow Filter */}
            <filter id="ultraSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#080D1A" floodOpacity={isDark ? "0.35" : "0.15"} />
            </filter>

            {/* Glowing Screen Backlight Halo */}
            <filter id="screenGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#38BDF8" floodOpacity="0.4" />
            </filter>

            {/* Gradients */}
            <linearGradient id="monitorScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="50%" stopColor="#111C38" />
              <stop offset="100%" stopColor="#1A294C" />
            </linearGradient>

            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="blazerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="deskWood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* ELEGANT SILKY HAIR GRADIENTS */}
            <linearGradient id="hairBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A1B38" />
              <stop offset="40%" stopColor="#1B1226" />
              <stop offset="100%" stopColor="#0D0814" />
            </linearGradient>

            <linearGradient id="hairHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>
          </defs>

          {/* Cloud Outline Frame Overlay */}
          <path
            d="M 120 240 Q 150 140 280 140 Q 360 110 480 130 Q 600 110 680 180 Q 760 250 720 340 Q 680 400 580 410 L 180 410 Q 90 380 120 240 Z"
            fill="none"
            stroke={isDark ? "#1E2D4A" : "#CBE4FB"}
            strokeWidth="2.5"
            strokeDasharray="6 6"
            opacity="0.6"
          />

          {/* Ground Floor Accent Bar */}
          <rect x="40" y="415" width="720" height="16" rx="8" fill={isDark ? "#0284C7" : "#0284C7"} />

          {/* ===================================================================== */}
          {/* LEFT BOTANICAL TABLE & POTTED PLANT */}
          {/* ===================================================================== */}
          <g filter="url(#ultraSoftShadow)">
            {/* Side Table Stand */}
            <rect x="150" y="340" width="120" height="10" rx="2" fill="#0F172A" />
            <line x1="160" y1="350" x2="160" y2="415" stroke="#0F172A" strokeWidth="5" />
            <line x1="190" y1="350" x2="190" y2="415" stroke="#0F172A" strokeWidth="5" />
            <line x1="230" y1="350" x2="230" y2="415" stroke="#0F172A" strokeWidth="5" />
            <line x1="260" y1="350" x2="260" y2="415" stroke="#0F172A" strokeWidth="5" />
            <line x1="160" y1="380" x2="260" y2="380" stroke="#0F172A" strokeWidth="4" />

            {/* Glossy Ceramic Pot */}
            <ellipse cx="205" cy="340" rx="30" ry="6" fill="#0284C7" />
            <path d="M 180 310 L 230 310 L 225 340 L 185 340 Z" fill="#0EA5E9" />
            <ellipse cx="205" cy="310" rx="25" ry="5" fill="#38BDF8" />

            {/* Natural Leaf Sway */}
            <motion.g
              animate={{ rotate: [-1.8, 1.8, -1.8] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '205px 310px' }}
            >
              <path d="M 205 310 Q 160 250 170 270 Q 190 295 205 310" fill="url(#leafGrad1)" />
              <path d="M 205 310 Q 185 220 200 215 Q 215 260 205 310" fill="url(#leafGrad2)" />
              <path d="M 205 310 Q 235 225 245 245 Q 225 285 205 310" fill="url(#leafGrad1)" />
              <path d="M 205 310 Q 250 270 245 290 Q 220 300 205 310" fill="url(#leafGrad2)" />
            </motion.g>
          </g>

          {/* ===================================================================== */}
          {/* RIGHT BOTANICAL FLOOR PLANT */}
          {/* ===================================================================== */}
          <g filter="url(#ultraSoftShadow)">
            <path d="M 560 350 L 620 350 L 612 415 L 568 415 Z" fill="#0284C7" />
            <ellipse cx="590" cy="350" rx="30" ry="7" fill="#38BDF8" />

            {/* 5-Leaf Rich Botanical Sway */}
            <motion.g
              animate={{ rotate: [2, -2, 2] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ transformOrigin: '590px 350px' }}
            >
              <path d="M 590 350 Q 530 260 540 285 Q 570 320 590 350" fill="url(#leafGrad1)" />
              <path d="M 590 350 Q 555 200 580 190 Q 600 260 590 350" fill="url(#leafGrad2)" />
              <path d="M 590 350 Q 640 210 655 235 Q 625 290 590 350" fill="url(#leafGrad1)" />
              <path d="M 590 350 Q 665 270 655 300 Q 620 325 590 350" fill="url(#leafGrad2)" />
              <path d="M 590 350 Q 610 240 620 220 Q 615 270 590 350" fill="#4ADE80" />
            </motion.g>
          </g>

          {/* ===================================================================== */}
          {/* WORKSTATION: WOODEN DESK & MONITOR WITH DASHBOARD UI */}
          {/* ===================================================================== */}
          <g filter="url(#ultraSoftShadow)">
            {/* Desk Surface */}
            <rect x="350" y="270" width="200" height="10" rx="2" fill="url(#deskWood)" />
            <rect x="350" y="278" width="200" height="2" fill="#B45309" opacity="0.6" />

            {/* Wooden A-Frame Legs */}
            <line x1="380" y1="280" x2="345" y2="415" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
            <line x1="530" y1="280" x2="565" y2="415" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />

            {/* Ultra-Slim Monitor with Backlight Glow */}
            <g filter="url(#screenGlow)">
              <path d="M 515 270 L 525 270 Q 520 240 500 240 L 485 240" stroke="#CBD5E1" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Bezel */}
              <rect x="475" y="155" width="18" height="92" rx="5" fill="#0F172A" />
              {/* Screen Display */}
              <rect x="473" y="159" width="4" height="84" rx="2" fill="url(#monitorScreenGrad)" />
              {/* Live HRMS Leave Dashboard Tracks Preview */}
              <rect x="474" y="165" width="2" height="12" rx="1" fill="#38BDF8" />
              <rect x="474" y="181" width="2" height="18" rx="1" fill="#10B981" />
              <rect x="474" y="203" width="2" height="14" rx="1" fill="#F59E0B" />
              <rect x="474" y="221" width="2" height="10" rx="1" fill="#EC4899" />
            </g>

            {/* Keyboard on Desk */}
            <rect x="420" y="267" width="45" height="3" rx="1" fill="#94A3B8" />
          </g>

          {/* ===================================================================== */}
          {/* TASK CHAIR & REFINED EDITORIAL FEMALE PROFESSIONAL */}
          {/* ===================================================================== */}

          {/* Ergonomic Executive Task Chair */}
          <g filter="url(#ultraSoftShadow)">
            <rect x="310" y="340" width="8" height="75" fill="#0F172A" />
            <rect x="285" y="410" width="58" height="5" rx="2" fill="#0F172A" />
            <path d="M 270 280 C 265 310 270 340 335 340 L 335 325 C 285 325 285 300 285 280 Z" fill="#1E3A8A" />
          </g>

          {/* ANATOMICAL FEMALE PROFESSIONAL (EDITORIAL SAAS ILLUSTRATION) */}
          <g>
            {/* Lower Legs & Subtle Foot Tap */}
            <motion.g
              animate={{ y: [0, -1.5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 275 330 Q 340 330 365 375 L 390 375 Q 385 415 375 415 L 355 415 Q 350 365 275 345 Z" fill="#1E3A8A" />
              <path d="M 375 415 Q 395 415 405 402 Q 395 400 375 405 Z" fill="url(#skinGrad)" />
              <path d="M 355 415 Q 375 415 385 402 Q 375 400 355 405 Z" fill="url(#skinGrad)" opacity="0.85" />
            </motion.g>

            {/* Torso & Head (Breathing & Posture Movement) */}
            <motion.g
              animate={{
                y: [-1.8, 1.8, -1.8],
                rotate: [-0.6, 0.6, -0.6]
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '280px 330px' }}
            >
              {/* 1. BACK & MAIN HAIR VOLUME LAYER (Renders behind neck & head) */}
              <motion.g
                animate={{ rotate: [-0.6, 0.6, -0.6] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '290px 180px' }}
              >
                {/* Back Hair Cascading down her back */}
                <path
                  d="M 280 168 C 240 168 232 205 240 275 C 254 285 272 268 276 230 C 278 195 284 175 292 168 Z"
                  fill="url(#hairBaseGrad)"
                />
                <path
                  d="M 245 215 Q 235 245 250 280 C 262 285 268 265 262 238 Z"
                  fill="#1B1226"
                />
                {/* Back Hair Highlights */}
                <path
                  d="M 280 174 Q 255 200 246 250"
                  fill="none"
                  stroke="url(#hairHighlightGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 272 182 Q 252 210 248 260"
                  fill="none"
                  stroke="url(#hairHighlightGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </motion.g>

              {/* Tailored Navy Blazer & Silk Sky-Blue Inner Shirt */}
              <path d="M 280 230 Q 300 225 325 250 L 320 335 L 270 335 Z" fill="url(#blazerGradient)" stroke="#334155" strokeWidth="0.75" />
              <path d="M 298 230 L 312 255 L 290 260 Z" fill="url(#shirtGradient)" />

              {/* Slender Neck & Refined Head Profile */}
              <rect x="295" y="210" width="14" height="25" rx="6" fill="url(#skinGrad)" />
              <ellipse cx="292" cy="208" rx="3.5" ry="5" fill="url(#skinGrad)" />
              <ellipse cx="308" cy="205" rx="18" ry="22" fill="url(#skinGrad)" />

              {/* Facial Expression & Clear Eyes, Nose, Lips */}
              <g>
                {/* Eyebrow */}
                <path d="M 312 195 Q 318 193 323 196" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                {/* Eye Lid & Lash */}
                <path d="M 313 201 Q 318 198 322 201" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                {/* Eye Pupil & Blink */}
                <motion.ellipse
                  animate={{ scaleY: [1, 0.1, 1, 1, 0.1, 1] }}
                  transition={{ duration: 6, repeat: Infinity, times: [0, 0.03, 0.06, 0.5, 0.53, 0.56] }}
                  cx="318" cy="202" rx="2" ry="2.5" fill="#0F172A"
                />
                <circle cx="319" cy="201" r="0.7" fill="#FFFFFF" />
                {/* Cheek Soft Blush */}
                <ellipse cx="314" cy="210" rx="4" ry="2.5" fill="#F43F5E" opacity="0.25" />
                {/* Nose */}
                <path d="M 325 205 Q 329 208 325 211" stroke="#D97706" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                {/* Lip / Gentle Smile */}
                <path d="M 321 216 Q 325 218 322 220" stroke="#E11D48" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </g>

              {/* 2. FULL CROWN & ELEGANT FRONT HAIR (Framing head & temple without covering face) */}
              <motion.g
                animate={{ rotate: [-0.6, 0.6, -0.6] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '290px 180px' }}
              >
                {/* Voluminous Full Hair Crown covering top & back skull seamlessly */}
                <path
                  d="M 282 166 C 302 160 328 168 328 192 C 324 196 318 190 310 188 C 298 186 288 188 280 192 Z"
                  fill="url(#hairBaseGrad)"
                />
                {/* Stylish Side-Swept Bang & Temple Wave (above eyebrow level M 312 195) */}
                <path
                  d="M 286 168 C 304 166 322 178 326 191 C 318 191 306 188 292 191 Z"
                  fill="url(#hairBaseGrad)"
                />
                {/* Glossy Silk Crown Highlight Lines */}
                <path
                  d="M 288 168 Q 308 171 322 184"
                  fill="none"
                  stroke="url(#hairHighlightGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 282 176 Q 298 178 312 187"
                  fill="none"
                  stroke="url(#hairHighlightGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </motion.g>

              {/* Arm Working / Typing Gesture */}
              <motion.g
                animate={{
                  rotate: [0, -3, 0, 2, 0],
                  y: [0, -2, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '295px 240px' }}
              >
                <path d="M 295 240 Q 345 250 410 270 L 405 280 Q 340 260 290 250 Z" fill="url(#blazerGradient)" />
                <path d="M 405 270 L 440 240 L 443 244 L 410 278 Z" fill="url(#skinGrad)" />
                <ellipse cx="442" cy="240" rx="4" ry="3" fill="url(#skinGrad)" />
              </motion.g>

              {/* Right Arm Support */}
              <path d="M 290 245 Q 350 260 430 273 L 425 281 Q 345 268 285 252 Z" fill="#1E293B" opacity="0.85" />
            </motion.g>
          </g>
        </svg>
      </div>
    </div>
  );
};

