import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const PanicButton = ({ onPanic, disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);

  const handleMouseDown = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      if (onPanic) onPanic();
      setIsPressed(false);
    }, 2000);
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsPressed(false);
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="panic-button-container">
      <motion.div
        animate={isPressed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: isPressed ? Infinity : 0 }}
      >
        <Button
          data-testid="panic-button"
          size="lg"
          disabled={disabled}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className={`h-32 w-32 rounded-full bg-signal-red hover:bg-red-700 text-white shadow-2xl transition-all duration-300 ${
            isPressed ? 'panic-button-active' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle size={48} />
            <span className="text-sm font-semibold">SOS</span>
          </div>
        </Button>
      </motion.div>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {isPressed ? 'Keep holding for 2 seconds...' : 'Press and hold for 2 seconds to activate emergency alert'}
      </p>
    </div>
  );
};

export default PanicButton;