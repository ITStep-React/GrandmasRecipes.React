import { useState } from 'react';

import Modal from '../Modal/Modal.jsx';

import styles from './ImageCarousel.module.scss';

function ImageCarousel({ images = [] }) {
    const [current, setCurrent] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div className={styles.carousel}>
                <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
                    {images.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`image_${i + 1}`}
                            className={styles.image}
                            onClick={() => {
                                setCurrent(i);
                                setModalOpen(true);
                            }}
                        />
                    ))}
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            className={`${styles.arrowBtn} ${styles.arrowBtnPrev}`}
                            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
                        >
                            <svg viewBox='0 0 24 24' width={24} height={24} fill='none' stroke='currentColor'>
                                <path d='M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            </svg>
                        </button>

                        <button
                            className={`${styles.arrowBtn} ${styles.arrowBtnNext}`}
                            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
                        >
                            <svg viewBox='0 0 24 24' width={24} height={24} fill='none' stroke='currentColor'>
                                <path d='M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                styles={{
                    background: 'none',
                    boxShadow: 'none',
                    borderRadius: '0',
                    padding: '0',
                    width: 'auto',
                    maxWidth: '95vw',
                    maxHeight: '95vh',
                    overflow: 'hidden',
                }}
            >
                <img
                    src={images[current]}
                    alt="preview"
                    style={{
                        display: 'block',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        width: 'auto',
                        height: 'auto',
                        borderRadius: '8px',
                    }}
                />
            </Modal>
        </>
    );
}


export default ImageCarousel;