import { useState, useEffect } from 'react';

import styles from './ThemeButton.module.scss';

function ThemeButton({ styles: buttonStyles }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }

    return (
        <button
            className={`${styles.themeToggle} ${theme === 'dark' ? styles.dark : styles.light}`}
            onClick={toggleTheme}
            style={{...buttonStyles}}
        >
            <div className={styles.icons}>
                <span className={styles.sun}>
                    <svg viewBox="0 0 24 24">
                        <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M12 2V3.5M12 20.5V22M19.0708 19.0713L18.0101 18.0106M5.98926 5.98926L4.9286 4.9286M22 12H20.5M3.5 12H2M19.0713 4.92871L18.0106 5.98937M5.98975 18.0107L4.92909 19.0714" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                    </svg>
                </span> 

                <span className={styles.moon}>
                    <svg viewBox="0 0 24 24">
                        <path d='M19.5483 18C20.7476 16.9645 21.5819 15.6272 22 14.1756C19.5473 14.4746 17.0369 13.3432 15.7234 11.1113C14.4099 8.87928 14.6664 6.1807 16.1567 4.2463C14.1701 3.75234 11.9929 3.98823 10.0779 5.07295C7.30713 6.64236 5.83056 9.56635 6.0155 12.5' stroke='currentColor' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round'></path>
                        <path d='M2 15.3739C3.13649 16.1865 4.59053 16.1865 5.72702 15.3739C6.41225 14.8754 7.31476 14.8754 7.99999 15.3739C9.13648 16.1865 10.6072 16.2049 11.727 15.3924M17 19.6352C15.8635 18.8226 14.4095 18.8226 13.273 19.6352C12.5877 20.1338 11.6685 20.1153 10.9833 19.6167C9.8468 18.8042 8.39277 18.8042 7.27299 19.6167C6.57104 20.1153 5.68524 20.1153 5 19.6167' stroke='currentColor' strokeWidth='1' strokeLinecap='round'></path>
                    </svg>
                </span>
            </div>
        </button>
    );
}

export default ThemeButton;