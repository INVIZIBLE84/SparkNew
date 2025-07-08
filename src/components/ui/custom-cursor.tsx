"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!hasMoved) {
        setHasMoved(true);
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', updatePosition);

    // Add hover effect listeners
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"], .cursor-pointer, select, [tabindex]:not([tabindex="-1"])');
    
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [hasMoved]);

  return (
    <>
      <div
        className={cn(
          "cursor-dot",
          isHovering ? "cursor-hover" : "",
          !hasMoved ? "hidden" : ""
        )}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div
        className={cn(
          "cursor-follower",
           isHovering ? "cursor-hover" : "",
           !hasMoved ? "hidden" : ""
        )}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
    </>
  );
};

export default CustomCursor;
