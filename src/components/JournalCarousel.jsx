import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import './JournalCarousel.css';

// Import foto
import bilaImg from '../assets/bila.jpeg';
import gilangImg from '../assets/gilang.jpeg';
import usImg from '../assets/US.jpeg';
import timeZoneImg from '../assets/Timezonedate.jpg';

import bilaSong from '../assets/bilaSong.mp3';

// Konstanta sudut halaman (mengikuti nilai lama biar buku tetap sedikit "melengkung")
const UNFLIPPED_ANGLE = -8;
const FLIPPED_ANGLE = -172;
const DRAG_RANGE = 160;

const completeFlipConfig = { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.45 };
const snapBackConfig = { type: 'spring', stiffness: 300, damping: 26 };

// Halaman yang sedang bisa di-drag MAJU (index === activeIndex)
function ForwardPage({ currentImg, nextImg, zIndex, onComplete }) {
  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [-DRAG_RANGE, 0], [FLIPPED_ANGLE, UNFLIPPED_ANGLE]);

  const handleDrag = (e, info) => {
    const clamped = Math.max(-DRAG_RANGE, Math.min(0, info.offset.x));
    dragX.set(clamped);
  };

  const handleDragEnd = (e, info) => {
    const shouldFlip = info.offset.x < -DRAG_RANGE * 0.3 || info.velocity.x < -400;
    if (shouldFlip) {
      animate(dragX, -DRAG_RANGE, completeFlipConfig).then(() => {
        onComplete();
      });
    } else {
      animate(dragX, 0, snapBackConfig);
    }
  };

  return (
    <motion.div
      className="book-page"
      style={{ zIndex, rotateY, transformStyle: 'preserve-3d', touchAction: 'none' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <div className="page-front">
        <img src={currentImg} className="img-right" alt="" />
        <div className="spine-shadow spine-shadow-right"></div>
      </div>
      <div className="page-back">
        <img src={nextImg} className="img-left" alt="" />
        <div className="spine-shadow spine-shadow-left"></div>
      </div>
    </motion.div>
  );
}

// Halaman yang sedang bisa di-drag MUNDUR (index === activeIndex - 1, sudah terlipat)
function BackPage({ prevImg, currentImg, zIndex, onComplete }) {
  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [0, DRAG_RANGE], [FLIPPED_ANGLE, UNFLIPPED_ANGLE]);

  const handleDrag = (e, info) => {
    const clamped = Math.max(0, Math.min(DRAG_RANGE, info.offset.x));
    dragX.set(clamped);
  };

  const handleDragEnd = (e, info) => {
    const shouldUnflip = info.offset.x > DRAG_RANGE * 0.3 || info.velocity.x > 400;
    if (shouldUnflip) {
      animate(dragX, DRAG_RANGE, completeFlipConfig).then(() => {
        onComplete();
      });
    } else {
      animate(dragX, 0, snapBackConfig);
    }
  };

  return (
    <motion.div
      className="book-page"
      style={{ zIndex, rotateY, transformStyle: 'preserve-3d', touchAction: 'none' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <div className="page-front">
        <img src={prevImg} className="img-right" alt="" />
        <div className="spine-shadow spine-shadow-right"></div>
      </div>
      <div className="page-back">
        <img src={currentImg} className="img-left" alt="" />
        <div className="spine-shadow spine-shadow-left"></div>
      </div>
    </motion.div>
  );
}

function JournalCarousel() {
  const spreads = [timeZoneImg, bilaImg, usImg, gilangImg];

  const colors = [
    { bg: '#2b2b36', text: '#fca311' },
    { bg: '#2b2b36', text: '#fca311' },
    { bg: '#2b2b36', text: '#fca311' },
    { bg: '#2b2b36', text: '#fca311' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, spreads.length - 1));
  };

  const goPrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const isBilaActive = spreads[activeIndex] === bilaImg;

  let currentSong = null;
  if (isBilaActive) {
    currentSong = bilaSong;
  }

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentSong) {
        setTimeout(() => {
          audioRef.current.play().catch((e) => console.log('Menunggu interaksi:', e));
        }, 50);
      } else {
        audioRef.current.pause();
      }
    }
  }, [activeIndex, currentSong, isPlaying]);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (currentSong) audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  let currentTheme = colors[activeIndex % colors.length];

  return (
    <div className="carousel-container" style={{ backgroundColor: currentTheme.bg }}>
      <audio ref={audioRef} src={currentSong || ''} loop />

      <button
        className="music-toggle"
        onClick={toggleMusic}
        style={{ borderColor: currentTheme.text, color: currentTheme.text }}
      >
        {isPlaying ? '⏸' : '🎵'}
      </button>

      <div className="carousel-stage">
        <div className="book-wrapper">

          {/* STACK KIRI */}
          <div className="page-stack">
            <AnimatePresence initial={false}>
              {spreads.slice(0, Math.max(activeIndex - 1, 0)).slice(-14).reverse().map((img, i) => {
                const distance = i + 1;
                return (
                  <motion.div
                    key={img}
                    className="stack-sliver stack-sliver-left"
                    initial={{ opacity: 0, left: `-${(distance + 1) * 16}px` }}
                    animate={{
                      opacity: Math.max(1 - distance * 0.07, 0.25),
                      left: `-${distance * 16}px`,
                      rotateY: Math.min(distance * 1.2, 10),
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      zIndex: 20 - distance,
                      transformOrigin: 'right center',
                      width: '75px',
                      position: 'absolute',
                      top: 0,
                      height: '100%',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: '800px',
                        height: '600px',
                        position: 'absolute',
                        left: '0px',
                        top: 0,
                        objectFit: 'cover',
                        filter: 'brightness(0.85)',
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="book">
            <div className="book-left-base">
              <img src={spreads[0]} className="img-left" alt="Base Left" />
              <div className="spine-shadow spine-shadow-left"></div>
            </div>

            {/* HALAMAN STATIS (yang sudah dibalik penuh / belum tersentuh sama sekali) */}
            {spreads.map((img, index) => {
              if (index === activeIndex || index === activeIndex - 1) return null;

              const isFlipped = index < activeIndex;
              const zIndex = isFlipped ? index + 1 : spreads.length - index;

              return (
                <div
                  key={index}
                  className={`book-page ${isFlipped ? 'flipped' : ''}`}
                  style={{ zIndex }}
                >
                  <div className="page-front">
                    <img src={img} className="img-right" alt="" />
                    <div className="spine-shadow spine-shadow-right"></div>
                  </div>
                  <div className="page-back">
                    {index + 1 < spreads.length ? (
                      <img src={spreads[index + 1]} className="img-left" alt="" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#e8e3d5' }}></div>
                    )}
                    <div className="spine-shadow spine-shadow-left"></div>
                  </div>
                </div>
              );
            })}

            {/* HALAMAN INTERAKTIF - drag mundur */}
            {activeIndex > 0 && (
              <BackPage
                key={`back-${activeIndex - 1}`}
                prevImg={spreads[activeIndex - 1]}
                currentImg={spreads[activeIndex]}
                zIndex={activeIndex}
                onComplete={goPrev}
              />
            )}

            {/* HALAMAN INTERAKTIF - drag maju */}
            {activeIndex < spreads.length - 1 ? (
              <ForwardPage
                key={`forward-${activeIndex}`}
                currentImg={spreads[activeIndex]}
                nextImg={spreads[activeIndex + 1]}
                zIndex={spreads.length - activeIndex}
                onComplete={goNext}
              />
            ) : (
              // Halaman terakhir - tidak bisa di-drag lagi, tampilkan statis
              <div className="book-page" style={{ zIndex: spreads.length, transform: 'rotateY(-8deg)', transition: 'none' }}>
                <div className="page-front">
                  <img src={spreads[activeIndex]} className="img-right" alt="" />
                  <div className="spine-shadow spine-shadow-right"></div>
                </div>
              </div>
            )}
          </div>

          {/* STACK KANAN */}
          <div className="page-stack">
            <AnimatePresence initial={false}>
              {spreads.slice(activeIndex + 1).slice(0, 14).map((img, i) => {
                const distance = i + 1;
                return (
                  <motion.div
                    key={img}
                    className="stack-sliver stack-sliver-right"
                    initial={{ opacity: 0, right: `-${(distance + 1) * 24}px` }}
                    animate={{
                      opacity: Math.max(1 - distance * 0.06, 0.3),
                      right: `-${distance * 24}px`,
                      rotateY: -Math.min(distance * 2, 16),
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      zIndex: 20 - distance,
                      transformOrigin: 'left center',
                      width: '120px',
                      position: 'absolute',
                      top: 0,
                      height: '100%',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: '800px',
                        height: '600px',
                        position: 'absolute',
                        left: '-680px',
                        top: 0,
                        objectFit: 'cover',
                        filter: 'brightness(0.88)',
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>

      <div className="carousel-controls">
        <h2 className="carousel-title" style={{ marginBottom: '20px', color: currentTheme.text }}>
          journal of us.
        </h2>

        <div className="nav-buttons">
          <button className="nav-btn" onClick={goPrev} style={{ borderColor: currentTheme.text, color: currentTheme.text }}>{'<'}</button>
          <button className="nav-btn" onClick={goNext} style={{ borderColor: currentTheme.text, color: currentTheme.text }}>{'>'}</button>
        </div>
      </div>
    </div>
  );
}

export default JournalCarousel;