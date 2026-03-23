import React, { useEffect, useState } from 'react';
import '../index.css';

const Starfield = () => {
  // We'll generate a static string of stars for a pure CSS parallax effect.
  // This avoids React state thrashing for animations and is highly performant.
  const [starLayers, setStarLayers] = useState({
    layer1: '',
    layer2: '',
    layer3: '',
  });

  useEffect(() => {
    const generateStars = (count, size) => {
      let stars = '';
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 2000);
        const y = Math.floor(Math.random() * 2000);
        // Add random opacity to make some stars dimmer
        const o = (Math.random() * 0.5 + 0.3).toFixed(2);
        stars += `${x}px ${y}px rgba(255, 255, 255, ${o})${i === count - 1 ? '' : ', '}`;
      }
      return stars;
    };

    setStarLayers({
      layer1: generateStars(300, 1),
      layer2: generateStars(150, 2),
      layer3: generateStars(50, 3),
    });
  }, []);

  return (
    <div className="starfield-container" style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      <div className="stars stars-small" style={{ boxShadow: starLayers.layer1 }}></div>
      <div className="stars stars-medium" style={{ boxShadow: starLayers.layer2 }}></div>
      <div className="stars stars-large" style={{ boxShadow: starLayers.layer3 }}></div>
    </div>
  );
};

export default Starfield;
