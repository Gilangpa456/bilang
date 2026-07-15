import { useState, useRef, useEffect } from 'react';
import './JournalCarousel.css';

// Import foto (Pastikan foto ini adalah format landscape / 16:9)
import bilaImg from '../assets/bila.jpeg';
import gilangImg from '../assets/gilang.jpeg';
import usImg from '../assets/US.jpeg';
import timeZoneImg from '../assets/Timezonedate.jpg'; 

import rapunzelTower from '../assets/tower.jpg';
import rapunzelPascal from '../assets/pascal.jpg';
import rapunzelLanterns from '../assets/lanterns.jpg';
import rapunzelButterfly from '../assets/butterfly.jpg';
import rapunzelSun from '../assets/sun.jpg';

import spidermanBg from '../assets/spiderman.jpg';
import loveBg from '../assets/love.jpg';
import bilaSong from '../assets/bilaSong.mp3';

function JournalCarousel() {
  // Setiap item di array ini dihitung sebagai 1 SPREAD (2 Halaman Buku Kiri Kanan)
  const spreads = [timeZoneImg, bilaImg, usImg, gilangImg]; 

const colors = [
    { bg: '#2b2b36', text: '#fca311' }, // Timezone
    { bg: '#2b2b36', text: '#fca311' }, // Bila
    { bg: '#2b2b36', text: '#fca311' }, // US
    { bg: '#2b2b36', text: '#fca311' }, // Gilang
  ];

  const [activeIndex, setActiveIndex] = useState(0); 
  
 const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // DRAG / SWIPE STATE
  const dragStartX = useRef(null);
  const isDragging = useRef(false);

 const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
    // Kunci pointer ke elemen ini, biar gesture gak "lepas" ke browser
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    // Kalau gesernya cukup jauh secara horizontal, cegah browser ambil alih (back gesture dll)
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current || dragStartX.current === null) return;

    const dragEndX = e.clientX;
    const deltaX = dragEndX - dragStartX.current;
    const threshold = 60; // minimal jarak geser (px) biar dianggap swipe

    if (deltaX < -threshold) {
      // Geser ke kiri = halaman berikutnya
      goNext();
    } else if (deltaX > threshold) {
      // Geser ke kanan = halaman sebelumnya
      goPrev();
    }

    dragStartX.current = null;
    isDragging.current = false;
  };

  const goNext = () => {
    if (activeIndex < spreads.length - 1) setActiveIndex(activeIndex + 1);
  };

  const goPrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const isBilaActive = spreads[activeIndex] === bilaImg;
  const isGilangActive = spreads[activeIndex] === gilangImg;
  const isUsActive = spreads[activeIndex] === usImg;
  const isTimeZoneActive = spreads[activeIndex] === timeZoneImg; 

  let currentSong = null;
  if (isBilaActive) {
    currentSong = bilaSong;
  }

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentSong) {
        setTimeout(() => {
          audioRef.current.play().catch(e => console.log("Menunggu interaksi:", e));
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
    <div 
      className="carousel-container" 
      style={{ backgroundColor: currentTheme.bg }}
    >
      <audio ref={audioRef} src={currentSong || ''} loop />

      <button 
        className="music-toggle" 
        onClick={toggleMusic}
        style={{ borderColor: currentTheme.text, color: currentTheme.text }}
      >
        {isPlaying ? '⏸' : '🎵'}
      </button>


      {/* WADAH BUKU 3D */}
      <div className="carousel-stage">
        <div 
          className="book-wrapper"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ cursor: 'grab', touchAction: 'pan-y' }}
        >

          {/* STACK KIRI - sliver tipis, subtle (halaman yang sudah dibaca) */}
          <div className="page-stack">
            {(() => {
              const displayItems = spreads.slice(0, activeIndex);

              return displayItems.slice(-10).reverse().map((img, i) => {
                const distance = i + 1;
                return (
                  <div
                    key={`stack-left-${i}`}
                    className="stack-sliver stack-sliver-left"
                    style={{
                      left: `-${distance * 14}px`,
                      zIndex: 20 - distance,
                      opacity: Math.max(1 - distance * 0.11, 0.15),
                      transform: `rotateY(${Math.min(distance * 1.2, 10)}deg)`,
                      transformOrigin: 'right center',
                      width: '55px',
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
                  </div>
                );
              });
            })()}
          </div>

          <div className="book">
            
            {/* COVER KIRI STATIS: Selalu menampilkan setengah sisi kiri dari Spread Pertama */}
            <div className="book-left-base">
              <img src={spreads[0]} className="img-left" alt="Base Left" />
              <div className="spine-shadow spine-shadow-left"></div>
            </div>

            {/* HALAMAN-HALAMAN YANG BISA MEMBALIK */}
            {spreads.map((img, index) => {
              const isFlipped = index < activeIndex;
              const zIndex = isFlipped ? index + 1 : spreads.length - index;

              return (
                <div 
                  key={index} 
                  className={`book-page ${isFlipped ? 'flipped' : ''}`} 
                  style={{ zIndex: zIndex }}
                >
                  <div className="page-front">
                    <img src={img} className="img-right" alt={`Spread ${index} Right`} />
                    <div className="spine-shadow spine-shadow-right"></div>
                  </div>

                  <div className="page-back">
                    {index + 1 < spreads.length ? (
                      <img src={spreads[index + 1]} className="img-left" alt={`Spread ${index + 1} Left`} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#e8e3d5' }}></div>
                    )}
                    <div className="spine-shadow spine-shadow-left"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* STACK KANAN - sliver banyak, menyebar (halaman yang belum dibaca) */}
          <div className="page-stack">
            {(() => {
              const displayItems = spreads.slice(activeIndex + 1);

              return displayItems.slice(0, 10).map((img, i) => {
                const distance = i + 1;
                return (
                  <div
                    key={`stack-right-${i}`}
                    className="stack-sliver stack-sliver-right"
                    style={{
                      right: `-${distance * 22}px`,
                      zIndex: 20 - distance,
                      opacity: Math.max(1 - distance * 0.08, 0.25),
                      transform: `rotateY(-${Math.min(distance * 2, 16)}deg)`,
                      transformOrigin: 'left center',
                      width: '90px',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: '800px',
                        height: '600px',
                        position: 'absolute',
                        left: '-710px',
                        top: 0,
                        objectFit: 'cover',
                        filter: 'brightness(0.88)',
                      }}
                    />
                  </div>
                );
              });
            })()}
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