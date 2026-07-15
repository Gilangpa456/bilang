import HTMLFlipBook from 'react-pageflip';
import Page from './Page';
import bilaImg from '../assets/bila.jpeg';
import gilangImg from '../assets/gilang.jpeg';
import usImg from '../assets/US.jpeg';

function FlipBookScene() {
  const photoData = [bilaImg, gilangImg, usImg];
  const pages = Array.from({ length: 12 }, (_, i) => photoData[i % 3]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08070a',
      }}
    >
      <HTMLFlipBook
        width={400}
        height={600}
        size="stretch"
        minWidth={300}
        maxWidth={500}
        minHeight={450}
        maxHeight={750}
        showCover={false}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        style={{}}
      >
        {pages.map((img, i) => (
          <Page key={i} image={img} />
        ))}
      </HTMLFlipBook>
    </div>
  );
}

export default FlipBookScene;