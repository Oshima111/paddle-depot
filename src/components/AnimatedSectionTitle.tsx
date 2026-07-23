import { useRef, useState, useEffect, type ReactNode } from 'react';

interface AnimatedSectionTitleProps {
  children: ReactNode;
}

export default function AnimatedSectionTitle({ children }: AnimatedSectionTitleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <h2 ref={ref} className={`text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      {children}
    </h2>
  );
}