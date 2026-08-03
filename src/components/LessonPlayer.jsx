import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Constants ────────────────────────────────────────────────────── */

const COLORS = {
  navy: '#16181d',
  heading: '#16181d',
  sky: '#0284c7',
  skyLight: 'rgba(2,132,199,.12)',
  skyBorder: 'rgba(2,132,199,.30)',
  green: '#10b981',
  amber: '#f59e0b',
  slate: '#565a63',
  slateLight: '#8a8f98',
  border: '#e4e0d5',
  bg: '#f7f5ef',
  white: '#ffffff',
  text: '#3f434b',
}

const FONT = "Fraunces, Georgia, serif"

/* ─── SVG Tutor Avatar ─────────────────────────────────────────────── */

function TutorAvatar({ isSpeaking }) {
  const [mouthOpen, setMouthOpen] = useState(false)
  const frameRef = useRef(null)
  const lastToggle = useRef(0)

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }

    const animate = (timestamp) => {
      if (timestamp - lastToggle.current > 120) {
        setMouthOpen(prev => !prev)
        lastToggle.current = timestamp
      }
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isSpeaking])

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow ring when speaking */}
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${COLORS.skyLight} 60%, transparent 100%)`,
            border: `2px solid ${COLORS.skyBorder}`,
          }}
        />
      )}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head circle */}
        <circle cx="32" cy="32" r="28" fill={COLORS.navy} />
        <circle cx="32" cy="32" r="26" fill="url(#headGradient)" />

        {/* Eyes */}
        <circle cx="23" cy="28" r="2.5" fill={COLORS.white} />
        <circle cx="41" cy="28" r="2.5" fill={COLORS.white} />

        {/* Mouth */}
        {mouthOpen ? (
          <ellipse cx="32" cy="40" rx="5" ry="3.5" fill={COLORS.white} opacity="0.9" />
        ) : (
          <path d="M26 39 Q32 44 38 39" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
        )}

        <defs>
          <linearGradient id="headGradient" x1="6" y1="6" x2="58" y2="58">
            <stop offset="0%" stopColor="#16181d" />
            <stop offset="100%" stopColor={COLORS.navy} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ─── Typewriter Text ──────────────────────────────────────────────── */

function TypewriterText({ text, isPlaying, speed = 30 }) {
  const [visibleLength, setVisibleLength] = useState(0)
  const intervalRef = useRef(null)
  const fullText = useMemo(() => (Array.isArray(text) ? text.join('\n') : String(text || '')), [text])

  useEffect(() => {
    setVisibleLength(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [fullText])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setVisibleLength(prev => {
        if (prev >= fullText.length) {
          clearInterval(intervalRef.current)
          return prev
        }
        return prev + 1
      })
    }, speed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, fullText, speed])

  const displayed = fullText.slice(0, visibleLength)
  const cursor = isPlaying && visibleLength < fullText.length

  return (
    <span>
      {displayed}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{ color: COLORS.sky, fontWeight: 700 }}
        >
          |
        </motion.span>
      )}
    </span>
  )
}

/* ─── Slide Type Renderers ─────────────────────────────────────────── */

function SlideIntro({ slide, isPlaying }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: COLORS.heading, marginBottom: 16, lineHeight: 1.3 }}
      >
        {slide.title}
      </motion.div>
      <div style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
        <TypewriterText text={slide.content} isPlaying={isPlaying} speed={25} />
      </div>
    </div>
  )
}

function SlideStrategy({ slide, isPlaying }) {
  const bullets = Array.isArray(slide.content) ? slide.content : [slide.content]
  return (
    <div style={{ padding: '16px 0' }}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: COLORS.heading, marginBottom: 16 }}
      >
        {slide.title}
      </motion.div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        {bullets.map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: COLORS.text, lineHeight: 1.65 }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,.12)',
              color: COLORS.green, fontSize: 13, fontWeight: 600, flexShrink: 0, marginTop: 2,
            }}>
              &#10003;
            </span>
            <span>{isPlaying ? <TypewriterText text={bullet} isPlaying={isPlaying} speed={20} /> : bullet}</span>
          </motion.li>
        ))}
      </ul>
      {slide.highlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: COLORS.skyLight, border: `1px solid ${COLORS.skyBorder}`,
            fontSize: 13, fontWeight: 700, color: COLORS.sky,
          }}
        >
          {slide.highlight}
        </motion.div>
      )}
    </div>
  )
}

function SlideTip({ slide, isPlaying }) {
  return (
    <div style={{ padding: '16px 0' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          background: '#fffbeb',
          border: '1.5px solid rgba(245,158,11,.35)',
          borderRadius: 12,
          padding: '20px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,158,11,.18)',
            fontSize: 18,
          }}>
            &#128161;
          </span>
          <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: '#92400e' }}>
            {slide.title}
          </span>
        </div>
        <div style={{ fontSize: 15, color: '#78350f', lineHeight: 1.7, fontWeight: 600 }}>
          <TypewriterText text={slide.content} isPlaying={isPlaying} speed={22} />
        </div>
      </motion.div>
    </div>
  )
}

function SlideExample({ slide, isPlaying }) {
  return (
    <div style={{ padding: '16px 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: COLORS.heading, marginBottom: 14 }}
      >
        {slide.title}
      </motion.div>
      <div style={{
        background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
        padding: '18px 20px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>
          Sample Question &amp; Approach
        </div>
        <div style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.7 }}>
          <TypewriterText text={slide.content} isPlaying={isPlaying} speed={20} />
        </div>
      </div>
      {slide.highlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)',
            fontSize: 13, fontWeight: 700, color: COLORS.green,
          }}
        >
          {slide.highlight}
        </motion.div>
      )}
    </div>
  )
}

function SlideRecap({ slide, isPlaying }) {
  const items = Array.isArray(slide.content) ? slide.content : [slide.content]
  return (
    <div style={{ padding: '16px 0' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: COLORS.heading, marginBottom: 14 }}
      >
        {slide.title}
      </motion.div>
      <div style={{
        background: '#faf9f6',
        border: `1.5px solid ${COLORS.skyBorder}`,
        borderRadius: 12,
        padding: '18px 20px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 12 }}>
          Key Takeaways
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%', background: COLORS.skyLight,
                color: COLORS.sky, fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 2,
              }}>
                {i + 1}
              </span>
              <span>{isPlaying ? <TypewriterText text={item} isPlaying={isPlaying} speed={20} /> : item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const SLIDE_RENDERERS = {
  intro: SlideIntro,
  strategy: SlideStrategy,
  tip: SlideTip,
  example: SlideExample,
  recap: SlideRecap,
}

/* ─── Speech helpers ───────────────────────────────────────────────── */

function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

function getSlideScript(slide) {
  if (Array.isArray(slide.content)) return slide.content.join('. ')
  return String(slide.content || '')
}

/* ─── Main Component ───────────────────────────────────────────────── */

export default function LessonPlayer({ title, slides = [], voiceUrl }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const [hasSpeech, setHasSpeech] = useState(true)
  const utteranceRef = useRef(null)
  const audioRef = useRef(null)

  const slide = slides[currentIndex] || null
  const totalSlides = slides.length

  // Check speech support on mount
  useEffect(() => {
    setHasSpeech(speechSupported())
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (speechSupported()) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const stopSpeech = useCallback(() => {
    if (speechSupported()) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    utteranceRef.current = null
    setIsSpeaking(false)
  }, [])

  const speakSlide = useCallback((slideData) => {
    stopSpeech()

    // If a voiceUrl is provided, use the audio element
    if (voiceUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      audioRef.current.src = voiceUrl
      audioRef.current.onplay = () => setIsSpeaking(true)
      audioRef.current.onpause = () => setIsSpeaking(false)
      audioRef.current.onended = () => setIsSpeaking(false)
      audioRef.current.onerror = () => setIsSpeaking(false)
      audioRef.current.play().catch(() => setIsSpeaking(false))
      return
    }

    // Fall back to Web Speech API
    if (!speechSupported()) return

    const script = getSlideScript(slideData)
    if (!script) return

    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Prefer a natural-sounding English voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha'))
      || voices.find(v => v.lang.startsWith('en') && !v.localService)
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utterance.onpause = () => setIsSpeaking(false)
    utterance.onresume = () => setIsSpeaking(true)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [stopSpeech, voiceUrl])

  // When slide changes while playing, restart speech
  useEffect(() => {
    if (isPlaying && slide) {
      speakSlide(slide)
    } else {
      stopSpeech()
    }
  }, [currentIndex, isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // Chrome pauses long utterances after ~15s. This workaround resumes them.
  useEffect(() => {
    if (!isPlaying || !isSpeaking || !speechSupported()) return
    const interval = setInterval(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [isPlaying, isSpeaking])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      stopSpeech()
    } else {
      setIsPlaying(true)
      // speech will start via the useEffect watching isPlaying
    }
  }, [isPlaying, stopSpeech])

  const goNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, totalSlides])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index)
    }
  }, [totalSlides])

  if (!slides.length) return null

  const SlideRenderer = SLIDE_RENDERERS[slide?.type] || SlideIntro

  return (
    <div style={{
      background: COLORS.white,
      border: `1.5px solid ${COLORS.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ─── Header ──────────────────────────────────── */}
      <div style={{
        padding: '16px 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <TutorAvatar isSpeaking={isSpeaking} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: COLORS.heading, lineHeight: 1.3 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: COLORS.slateLight, marginTop: 2 }}>
            Slide {currentIndex + 1} of {totalSlides}
            {!hasSpeech && ' (speech not supported in this browser)'}
          </div>
        </div>
      </div>

      {/* ─── Progress Bar ────────────────────────────── */}
      <div style={{ display: 'flex', gap: 3, padding: '12px 20px 0' }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'background .25s ease',
              background: i < currentIndex
                ? COLORS.sky
                : i === currentIndex
                  ? COLORS.heading
                  : '#e4e0d5',
            }}
          />
        ))}
      </div>

      {/* ─── Slide Content ───────────────────────────── */}
      <div style={{ padding: '8px 24px 16px', minHeight: 200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <SlideRenderer slide={slide} isPlaying={isPlaying} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Controls ────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${COLORS.border}`,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.white,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.4 : 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: COLORS.heading,
              transition: 'opacity .2s',
            }}
          >
            &#9664;
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              width: 44, height: 44, borderRadius: 12,
              border: 'none',
              background: isPlaying
                ? '#dc2626'
                : '#0284c7',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: COLORS.white, fontSize: 18,
              boxShadow: isPlaying
                ? '0 1px 3px rgba(22,24,29,.06)'
                : '0 1px 3px rgba(22,24,29,.06)',
              transition: 'background .25s, box-shadow .25s',
            }}
          >
            {isPlaying ? (
              /* Pause icon */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect x="4" y="3" width="3.5" height="12" rx="1" />
                <rect x="10.5" y="3" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              /* Play icon */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M5 3.5v11l10-5.5z" />
              </svg>
            )}
          </button>

          <button
            onClick={goNext}
            disabled={currentIndex === totalSlides - 1}
            aria-label="Next slide"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.white,
              cursor: currentIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === totalSlides - 1 ? 0.4 : 1,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: COLORS.heading,
              transition: 'opacity .2s',
            }}
          >
            &#9654;
          </button>
        </div>

        {/* Script toggle */}
        <button
          onClick={() => setShowScript(prev => !prev)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: `1.5px solid ${showScript ? COLORS.skyBorder : COLORS.border}`,
            background: showScript ? COLORS.skyLight : COLORS.white,
            color: showScript ? COLORS.sky : COLORS.slate,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          {showScript ? 'Hide Script' : 'Show Script'}
        </button>
      </div>

      {/* ─── Script panel ────────────────────────────── */}
      <AnimatePresence>
        {showScript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: `1px solid ${COLORS.border}`,
              padding: '14px 20px',
              background: COLORS.bg,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                Slide {currentIndex + 1} Script
              </div>
              <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {getSlideScript(slide)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
