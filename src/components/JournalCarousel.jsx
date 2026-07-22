import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import './JournalCarousel.css';

import bilaImg from '../assets/bila.jpeg';
import gilangImg from '../assets/gilang.jpeg';
import usImg from '../assets/US.jpeg';
import timeZoneImg from '../assets/Timezonedate.jpg';
import bilaSong from '../assets/bilaSong.mp3';

const UNFLIPPED_ANGLE = -20; 
const FLIPPED_ANGLE = -160; 

function Page({ index, currentIndex, currentImg, nextImg }) {
  const rotateY = useTransform(currentIndex, (c) => {
    const dist = index - c;
    if (dist >= 0) return UNFLIPPED_ANGLE + dist * 5;
    if (dist <= -1) return FLIPPED_ANGLE - (Math.abs(dist + 1)) * 5;
    const progress = -dist; 
    return UNFLIPPED_ANGLE + progress * (FLIPPED_ANGLE - UNFLIPPED_ANGLE);
  });

  const x = useTransform(currentIndex, (c) => {
    const dist = index - c;
    if (dist >= -2 && dist <= 1) return 0;
    if (dist > 1) return (dist - 1) * 80; 
    if (dist < -2) return (dist + 2) * 80; 
    return 0; 
  });

  const z = useTransform(currentIndex, (c) => {
    const dist = index - c;
    if (dist >= 0) return -dist * 20; 
    if (dist <= -1) return -Math.abs(dist + 1) * 20;
    const progress = -dist;
    return Math.sin(progress * Math.PI) * 30; 
  });

  const scale = useTransform(currentIndex, (c) => {
    const dist = index - c;
    if (dist >= 0) return 1 - (dist * 0.04); 
    if (dist <= -1) return 1 - (Math.abs(dist + 1) * 0.04); 
    const progress = -dist;
    return 1 + Math.sin(progress * Math.PI) * 0.03; 
  });

  const zIndex = useTransform(currentIndex, (c) => {
    const dist = index - c;
    return Math.round(100 - Math.abs(dist) * 10);
  });

  const shadowOpacityRight = useTransform(currentIndex, (c) => {
    const dist = index - c;
    return dist >= 0 ? Math.min(dist * 0.08, 0.4) : 0;
  });

  const shadowOpacityLeft = useTransform(currentIndex, (c) => {
    const dist = index - c;
    return dist <= -1 ? Math.min(Math.abs(dist + 1) * 0.08, 0.4) : 0;
  });

  return (
    <motion.div 
      className="book-page" 
      style={{ rotateY, x, z, scale, zIndex, transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
    >
      <div className="page-front" style={{ transform: 'translateZ(1px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        <img src={currentImg} className="img-full img-right" alt="" />
        <div className="spine-shadow spine-shadow-right"></div>
        <div className="page-edge-right"></div>
        <motion.div style={{ position: 'absolute', inset: 0, backgroundColor: 'black', opacity: shadowOpacityRight, pointerEvents: 'none', borderRadius: 'inherit', zIndex: 20 }} />
      </div>
      
      <div className="page-back" style={{ transform: 'rotateY(180deg) translateZ(1px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        {nextImg ? (
          <img src={nextImg} className="img-full img-left" alt="" />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e8e3d5' }}></div>
        )}
        <div className="spine-shadow spine-shadow-left"></div>
        <div className="page-edge-left"></div>
        <motion.div style={{ position: 'absolute', inset: 0, backgroundColor: 'black', opacity: shadowOpacityLeft, pointerEvents: 'none', borderRadius: 'inherit', zIndex: 20 }} />
      </div>
    </motion.div>
  );
}

export default function JournalCarousel() {
  const initialSpreads = [timeZoneImg, bilaImg, usImg, gilangImg];
  const [spreads, setSpreads] = useState(initialSpreads);
  
  const colors = [{ bg: '#2b2e4a', text: '#ffffff' }]; 
  
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = useMotionValue(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileInputRef = useRef(null);
  
  const bookX = useTransform(currentIndex, (c) => -(c - (spreads.length / 2)) * 60);

  const baseLeftX = useTransform(currentIndex, (c) => {
    const dist = -1 - c;
    if (dist >= -2) return 0;
    return (dist + 2) * 80;
  });
  const baseLeftZ = useTransform(currentIndex, (c) => {
    const dist = -1 - c;
    return -Math.abs(dist + 1) * 20 - 1; 
  });
  const baseLeftScale = useTransform(currentIndex, (c) => 1 - c * 0.04);

  const handleDrag = (e, info) => {
    const progress = info.offset.x / -300;
    let provIndex = activeIndex + progress;
    if (provIndex < 0) provIndex = provIndex * 0.2;
    if (provIndex > spreads.length - 1) provIndex = (spreads.length - 1) + (provIndex - (spreads.length - 1)) * 0.2;
    currentIndex.set(provIndex);
  };

  const handleDragEnd = (e, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    let nextIndex = activeIndex;

    if (offset < -100 || velocity < -400) nextIndex = Math.min(activeIndex + 1, spreads.length - 1);
    else if (offset > 100 || velocity > 400) nextIndex = Math.max(activeIndex - 1, 0);
    
    setActiveIndex(nextIndex);
    animate(currentIndex, nextIndex, { type: 'spring', stiffness: 180, damping: 22 });
  };

  const goNext = () => {
    const nextIdx = Math.min(activeIndex + 1, spreads.length - 1);
    setActiveIndex(nextIdx);
    animate(currentIndex, nextIdx, { type: 'spring', stiffness: 180, damping: 22 });
  };

  const goPrev = () => {
    const prevIdx = Math.max(activeIndex - 1, 0);
    setActiveIndex(prevIdx);
    animate(currentIndex, prevIdx, { type: 'spring', stiffness: 180, damping: 22 });
  };

  // 🔥 LOGIKA UPLOAD DIPERBAIKI
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newImgUrl = URL.createObjectURL(file);
      const newSpreads = [...spreads, newImgUrl];
      setSpreads(newSpreads);
      setShowUploadMenu(false);
      
      const newIndex = newSpreads.length - 1;
      setActiveIndex(newIndex);
      animate(currentIndex, newIndex, { type: 'spring', stiffness: 180, damping: 22 });
    }
  };

  // 🔥 LOGIKA HAPUS DIPERBAIKI DAN DISINKRONISASI
  const handleDelete = () => {
    if (spreads.length <= 1) {
      alert("Ups! Jurnal tidak boleh kosong, sisakan minimal 1 halaman ya.");
      return;
    }

    // Filter array spreads, buang elemen di index yang aktif
    const newSpreads = spreads.filter((_, idx) => idx !== activeIndex);
    setSpreads(newSpreads);

    // Hitung posisi index baru supaya carousel tidak menunjuk ke halaman yang sudah hilang
    let nextActive = activeIndex;
    if (activeIndex >= newSpreads.length) {
      nextActive = newSpreads.length - 1; // Jika halaman terakhir dihapus, mundur 1 langkah
    }
    
    setActiveIndex(nextActive);
    
    // Perbarui animasi motion value
    currentIndex.set(nextActive);
    animate(currentIndex, nextActive, { type: 'spring', stiffness: 180, damping: 22 });
  };

  const isBilaActive = spreads[activeIndex] === bilaImg;
  let currentSong = isBilaActive ? bilaSong : null;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentSong) {
        setTimeout(() => audioRef.current.play().catch((e) => console.log('Menunggu interaksi:', e)), 50);
      } else {
        audioRef.current.pause();
      }
    }
  }, [activeIndex, currentSong, isPlaying]);

  const toggleMusic = () => {
    if (isPlaying) audioRef.current.pause();
    else if (currentSong) audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  let currentTheme = colors[0];

  return (
    <div className="carousel-container" style={{ backgroundColor: currentTheme.bg }}>
      <audio ref={audioRef} src={currentSong || ''} loop />

      <button className="music-toggle" onClick={toggleMusic} style={{ borderColor: currentTheme.text, color: currentTheme.text }}>
        {isPlaying ? '🔊' : '🔈'}
      </button>

      <header className="carousel-header">
        <h1 className="carousel-title" style={{ color: currentTheme.text }}>Journal</h1>
        <p className="carousel-subtitle" style={{ color: currentTheme.text }}>{spreads.length * 2} Pages</p>
      </header>

      <div className="carousel-stage">
        <motion.div 
          className="drag-overlay" 
          style={{ position: 'absolute', inset: 0, zIndex: 1000, touchAction: 'none' }} 
          drag="x" 
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag} 
          onDragEnd={handleDragEnd} 
        />
        
        <div className="book-wrapper">
          <motion.div className="book" style={{ x: bookX }}>
            <motion.div 
              className="book-left-base" 
              style={{ x: baseLeftX, z: baseLeftZ, scale: baseLeftScale, transform: 'rotateY(20deg)' }}
            >
              <img src={spreads[0]} className="img-full img-left" alt="" />
              <div className="spine-shadow spine-shadow-left"></div>
              <div className="page-edge-left"></div> 
            </motion.div>
            
            {spreads.map((img, i) => (
              <Page key={i} index={i} currentIndex={currentIndex} currentImg={img} nextImg={spreads[i + 1]} />
            ))}
          </motion.div>
        </div>
      </div>

      <footer className="carousel-footer">
        <button className="nav-btn" onClick={goPrev}>🏠</button>
        <button className="nav-btn" onClick={goNext}>⬆️</button>
        
        {/* Tombol hapus sekarang sudah dihubungkan dengan onClick={handleDelete} */}
        <button className="nav-btn" onClick={handleDelete}>🗑️</button>
        
        <div className="upload-menu-container">
          <button className="nav-btn" onClick={() => setShowUploadMenu(!showUploadMenu)}>➕</button>
          
          {showUploadMenu && (
            <div className="upload-popover">
              <button className="upload-option" onClick={() => fileInputRef.current.click()}>
                📁 File Lokal
              </button>
              <button className="upload-option" onClick={() => alert("Perlu setup OAuth Google Cloud untuk integrasi GDrive asli!")}>
                ☁️ Google Drive
              </button>
              <button className="upload-option" onClick={() => alert("Perlu setup API Photos untuk integrasi galeri cloud!")}>
                🖼️ Photos
              </button>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileUpload} 
          />
        </div>
      </footer>
    </div>
  );
}