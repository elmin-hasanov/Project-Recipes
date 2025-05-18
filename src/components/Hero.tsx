import './Hero.css';
import hero1 from '../assets/hero/hero2.mp4';

const Hero = () => {
  return (
    <div className="hero-container">
      <video
        className="hero-video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={hero1} type="video/mp4" />
        Dein Browser unterstützt dieses Video nicht.
      </video>
    </div>
  );
};

export default Hero;
