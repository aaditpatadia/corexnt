import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const [clicking,  setClicking]  = useState(false);
  const [hovering,  setHovering]  = useState(false);
  const [isTouch,   setIsTouch]   = useState(false);
  const location = useLocation();
  const isApp = location.pathname.startsWith("/app");

  // Detect touch device
  useEffect(() => {
    if ("ontouchstart" in window) {
      setIsTouch(true);
      document.documentElement.classList.add("touch-device");
    }
  }, []);

  useEffect(() => {
    if (isTouch) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let rafId  = null;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top  = mouseY + "px";
    };

    const lerp = (a, b, n) => a + (b - a) * n;

    const animate = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.left = ringX + "px";
      ring.style.top  = ringY + "px";
      rafId = requestAnimationFrame(animate);
    };

    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);

    const onEnter = (e) => {
      const el = e.target;
      if (
        el.tagName === "BUTTON" ||
        el.tagName === "A" ||
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.closest("button") ||
        el.closest("a") ||
        el.getAttribute("role") === "button"
      ) {
        setHovering(true);
      }
    };
    const onLeave = () => setHovering(false);

    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout",  onLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout",  onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`cursor-dot ${clicking ? "clicking" : ""} ${isApp ? "app-cursor-dot" : ""}`}
        style={isApp ? { background: "#2dd668" } : {}}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? "hovering" : ""} ${isApp ? "app-cursor-ring" : ""}`}
        style={isApp ? { borderColor: "rgba(45,214,104,0.6)" } : {}}
      />
    </>
  );
}
