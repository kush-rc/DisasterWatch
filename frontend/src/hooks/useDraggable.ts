import { useState, useCallback, useRef } from 'react';

export function useDraggable(initialPosition = { x: 0, y: 0 }) {
  const [position, setPosition] = useState(initialPosition);
  const isDragging = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const initialRef = useRef(initialPosition);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only accept left clicks
    if (e.button !== 0) return;
    
    isDragging.current = true;
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: moveEvent.clientX - dragStartOffset.current.x,
        y: moveEvent.clientY - dragStartOffset.current.y
      });
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [position.x, position.y]);

  const resetPosition = useCallback(() => {
    setPosition(initialRef.current);
  }, []);

  return { position, handleMouseDown, resetPosition, setPosition };
}
