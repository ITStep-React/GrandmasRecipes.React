import React, { useRef } from 'react';

import styles from './HorizontalScroll.module.scss';

function HorizontalScroll({ title, children }) {
    const trackRef = useRef(null);

    const scroll = (dir) => {
        if (!trackRef.current) return;
        trackRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.arrows}>
                    <button className={styles.arrow} onClick={() => scroll(-1)}>
                        <svg viewBox='0 0 24 24' width={24} height={24} fill={'none'}>
                            <path d='M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18' stroke={'currentColor'} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                        </svg>
                    </button>
                    <button className={styles.arrow} onClick={() => scroll(1)}>
                        <svg viewBox='0 0 24 24' width={24} height={24} fill={'none'}>
                            <path d='M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18' stroke={'currentColor'} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className={styles.track} ref={trackRef}>
                {React.Children.map(children, (child) =>
                    React.cloneElement(child, {
                        next: () => scroll(1),
                        prev: () => scroll(-1),
                    })
                )}
            </div>
        </section>
    );
}

export default HorizontalScroll;