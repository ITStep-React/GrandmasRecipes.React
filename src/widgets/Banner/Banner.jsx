import { useState, useEffect, useRef, useCallback } from 'react';

import styles from './Banner.module.scss';

function Banner({ slides, autoplay = true }) {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState(null);
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef(null);
    const rafRef = useRef(null);
    const total = slides.length;

    const goTo = useCallback((index) => {
        setPrev(current);
        setCurrent(index);
        setProgress(0);
        startTimeRef.current = performance.now();
    }, [current]);

    const next_slide = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);
    const prev_slide = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);

    useEffect(() => {
        if (!autoplay) return;

        startTimeRef.current = performance.now();

        const tick = (now) => {
            const elapsed = now - startTimeRef.current;
            const p = Math.min((elapsed / 5000) * 100, 100);
            setProgress(p);
            if (p < 100) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                next_slide();
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [current, autoplay, next_slide]);

    return (
        <div className={styles.banner} role='region'>
            <div className={styles.slides}>
                {slides.map((slide, i) => (
                    <a
                        key={slide.id}
                        href={slide.href}
                        className={[styles.slide, i === current ? 'active' : i === prev ? 'prev' : ''].filter(Boolean).join(' ')}
                        tabIndex={i === current ? 0 : -1}
                        aria-hidden={i !== current}
                    >
                        <img
                            className={styles.slideImg}
                            src={slide.imageUrl}
                            alt={slide.title}
                            draggable={false}
                        />
                        <div className={styles.slideOverlay} />
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>{slide.title}</h2>
                            {slide.desc && <p className={styles.slideDesc}>{slide.desc}</p>}
                            {slide.cta && <span className='btn'>{slide.cta}</span>}
                        </div>
                    </a>
                ))}
            </div>


            <button
                className={`${styles.arrowBtn} ${styles.arrowBtnPrev}`}
                onClick={(e) => { e.stopPropagation(); prev_slide(); }}
            >
                <svg viewBox='0 0 24 24' width={24} height={24} fill='none' stroke='currentColor'>
                    <path d='M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
            </button>

            <button
                className={`${styles.arrowBtn} ${styles.arrowBtnNext}`}
                onClick={(e) => { e.stopPropagation(); next_slide(); }}
            >
                <svg viewBox='0 0 24 24' width={24} height={24} fill='none' stroke='currentColor'>
                    <path d='M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
            </button>

        </div>
    );
}

export default Banner;