import styles from './BurgerButton.module.scss';

function BurgerButton({ isOpen, onClick }) {
    return (
        <button
            className={`${styles.btnBurger} ${isOpen ? styles.active : ''}`}
            onClick={onClick}
        >
            <span className={`${styles.line} ${styles.line1}`}></span>
            <span className={`${styles.line} ${styles.line2}`}></span>
            <span className={`${styles.line} ${styles.line3}`}></span>
        </button>
    );
}

export default BurgerButton;
