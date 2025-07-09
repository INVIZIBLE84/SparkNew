
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SmoothCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cursorSize = isHovered ? 40 : 24;

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const smoothOptions = { damping: 25, stiffness: 400, mass: 0.5 };
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
      className="pointer-events-none fixed z-[9999] text-primary"
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: isHovered ? 1.5 : 1, transition: { duration: 0.2 } }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{
          transform: "rotate(20deg) scale(1.2)",
          transformOrigin: 'top left',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <path
          fillRule="evenodd"
          d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l2.965-7.19H4.5a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
          clipRule="evenodd"
        />
      </svg>
    </motion.div>
  );
};

export default SmoothCursor;
