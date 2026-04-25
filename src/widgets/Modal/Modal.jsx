import styles from './Modal.module.scss';

function Modal({ isOpen, onClose, styles: modalStyles, children }) {
    if (!isOpen) return null;

    const handleOverlayClick = () => {
        onClose();
    };

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                className={styles.modal}
                style={{ ...modalStyles }}
                onClick={handleContentClick}
            >
                <button
                    className={styles.closeBtn}
                    onClick={handleOverlayClick}
                >
                    <svg viewBox='0 0 24 24' width={24} height={24} color={'currentColor'} fill={'none'}>
                        <path d='M18 6L6.00081 17.9992M17.9992 18L6 6.00085' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal;
