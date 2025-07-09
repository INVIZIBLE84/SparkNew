
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SmoothCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cursorSize = isHovered ? 60 : 20;

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const smoothOptions = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
  };

  const manageMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    mouse.x.set(clientX);
    mouse.y.set(clientY);
  };

  const manageMouseOver = () => {
    setIsHovered(true);
  };

  const manageMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", manageMouseMove);

    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, label'
    );
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseover", manageMouseOver);
      el.addEventListener("mouseleave", manageMouseLeave);
      (el as HTMLElement).style.cursor = "none";
    });

    document.body.classList.add("cursor-none");

    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseover", manageMouseOver);
        el.removeEventListener("mouseleave", manageMouseLeave);
        (el as HTMLElement).style.cursor = "auto";
      });
      document.body.classList.remove("cursor-none");
    };
  }, []);

  return (
    <motion.div
      style={{
        left: smoothMouse.x,
        top: smoothMouse.y,
        width: cursorSize,
        height: cursorSize,
      }}
      className="pointer-events-none fixed z-[9999] rounded-full bg-primary/80 mix-blend-difference"
    />
  );
};

export default SmoothCursor;
