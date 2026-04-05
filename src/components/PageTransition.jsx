import { useEffect, useRef } from "react";

export default function PageTransition({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("page-transition-enter");
    const id = requestAnimationFrame(() => {
      el.classList.remove("page-transition-enter");
      el.classList.add("page-transition-active");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}
