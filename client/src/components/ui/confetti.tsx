import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(active);

  // Control visibility based on active prop
  useEffect(() => {
    if (active) {
      setIsVisible(true);
      
      // Hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isVisible) return null;

  // Create array of particle elements
  const particles = Array.from({ length: 100 }).map((_, i) => (
    <div
      key={i}
      className="confetti-particle"
      style={{
        // Randomize position, size, color, and animation delay
        left: `${Math.random() * 100}%`,
        top: `-10px`,
        width: `${5 + Math.random() * 10}px`,
        height: `${5 + Math.random() * 10}px`,
        backgroundColor: [
          '#FFC700', '#FF0066', '#2BD1FC', 
          '#F222FF', '#FB33DB', '#26ff8c',
          '#4e6bff', '#ff7846', '#76c9ff'
        ][Math.floor(Math.random() * 9)],
        animationDelay: `${Math.random() * 1}s`,
        animationDuration: `${1 + Math.random() * 2}s`,
      }}
    />
  ));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles}
      
      {/* Add CSS styles inline */}
      <style dangerouslySetInnerHTML={{ __html: `
        .confetti-particle {
          position: absolute;
          animation: confetti-fall 2s linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.3;
          }
        }
      `}} />
    </div>
  );
};

export default Confetti;