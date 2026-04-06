import { useRef, useEffect } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  useEffect(() => {
    if ('ontouchstart' in window) return;

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX - 6 + 'px';
        dotRef.current.style.top = e.clientY - 6 + 'px';
      }
    };

    const onOver = (e) => {
      hovering.current = !!e.target.closest(
        'button,a,[role="button"],input,textarea,select'
      );
      if (ringRef.current) {
        ringRef.current.style.width =
          hovering.current ? '56px' : '40px';
        ringRef.current.style.height =
          hovering.current ? '56px' : '40px';
        ringRef.current.style.borderColor =
          hovering.current
            ? 'rgba(45,214,104,0.8)'
            : 'rgba(45,214,104,0.4)';
        ringRef.current.style.background =
          hovering.current
            ? 'rgba(45,214,104,0.05)'
            : 'transparent';
      }
    };

    let raf;
    const animate = () => {
      ring.current.x +=
        (mouse.current.x - ring.current.x) * 0.1;
      ring.current.y +=
        (mouse.current.y - ring.current.y) * 0.1;
      if (ringRef.current) {
        const w = hovering.current ? 56 : 40;
        ringRef.current.style.left =
          ring.current.x - w / 2 + 'px';
        ringRef.current.style.top =
          ring.current.y - w / 2 + 'px';
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if ('ontouchstart' in window) return null;

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, #34d399, #60a5fa)',
        filter: 'brightness(1.4)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 999999,
        willChange: 'left, top',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1.5px solid rgba(45,214,104,0.4)',
        background: 'transparent',
        pointerEvents: 'none',
        zIndex: 999998,
        transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease',
        willChange: 'left, top',
      }} />
    </>
  );
};

export default CustomCursor;
