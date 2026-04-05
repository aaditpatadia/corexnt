import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const mouse   = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  useEffect(() => {
    // Skip on touch devices
    if ("ontouchstart" in window) return;
    document.documentElement.style.cursor = "none";

    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
      }
    };

    const onMouseOver = (e) => {
      const el = e.target;
      hovering.current = !!(el.closest("button, a, [role='button'], input, textarea, select"));
    };

    let raf;
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        const scale = hovering.current ? 1.8 : 1;
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px) scale(${scale})`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseover",  onMouseOver);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseover",  onMouseOver);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  return (
    <>
      <div ref={dotRef} style={{
        position:      "fixed",
        width:         "12px",
        height:        "12px",
        borderRadius:  "50%",
        background:    "conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, #34d399, #60a5fa)",
        pointerEvents: "none",
        zIndex:        99999,
        mixBlendMode:  "screen",
        filter:        "brightness(1.5)",
        transition:    "none",
        willChange:    "transform",
        animation:     "holo-spin 3s linear infinite",
      }} />
      <div ref={ringRef} style={{
        position:      "fixed",
        width:         "40px",
        height:        "40px",
        borderRadius:  "50%",
        border:        "1.5px solid rgba(45,214,104,0.5)",
        pointerEvents: "none",
        zIndex:        99998,
        transition:    "transform 0.05s linear, scale 0.3s ease",
        willChange:    "transform",
        background:    "transparent",
      }} />
    </>
  );
}
