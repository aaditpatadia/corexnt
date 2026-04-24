import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export const variants = {
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  },
  message: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
  },
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
  },
  staggerItem: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  },
  card: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    whileHover: { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
  },
  chip: {
    initial: { opacity: 0, scale: 0.8, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    whileHover: { scale: 1.04, transition: { duration: 0.15 } },
    whileTap: { scale: 0.96 }
  },
  slideRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }
  },
  slideDown: {
    initial: { y: -40, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { y: -40, opacity: 0, transition: { duration: 0.25 } }
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
  },
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  },
  welcomeHero: {
    initial: { opacity: 0, y: 30, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  },
  button: {
    whileHover: { scale: 1.02, transition: { duration: 0.15 } },
    whileTap: { scale: 0.97, transition: { duration: 0.1 } }
  },
};

export function dotVariant(i) {
  return {
    animate: {
      y: [0, -8, 0],
      opacity: [0.4, 1, 0.4],
      transition: { duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }
    }
  };
}

export function useMagneticEffect(ref, strength = 0.3) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };
  return { springX, springY, handleMouseMove, handleMouseLeave };
}
