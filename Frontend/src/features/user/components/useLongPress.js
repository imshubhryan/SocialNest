import { useState, useRef, useCallback } from "react";

export const useLongPress = (onLongPress, onClick, { delay = 450 } = {}) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timerRef = useRef(null);

  const start = useCallback((e) => {
    e.preventDefault();
    setLongPressTriggered(false);
    timerRef.current = setTimeout(() => {
      onLongPress(e);
      setLongPressTriggered(true);
    }, delay);
  }, [onLongPress, delay]);

  const stop = useCallback((e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!longPressTriggered && onClick) {
      onClick(e);
    }
    setLongPressTriggered(false);
  }, [onClick, longPressTriggered]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: stop,
    onTouchEnd: stop,
    onMouseLeave: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };
};
