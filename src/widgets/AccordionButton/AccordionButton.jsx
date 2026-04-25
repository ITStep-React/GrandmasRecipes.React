import { useRef, useEffect, useState } from "react";

import styles from "./AccordionButton.module.scss";

function AccordionButton({label, backgroundImage, backgroundColor, isOpen, onToggle, styles: buttonStyles, children}) {
    const contentRef = useRef(null);
    const [height, setHeight] = useState("0px");

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) {
                setHeight(contentRef.current.scrollHeight + "px");
            } else {
                setHeight("0px");
            }
        }
    }, [isOpen, children]);
    
    return (
        <div className={styles.item}>
            <button
                className={`btn ${styles.button} ${isOpen ? styles.open : ""}`}
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                    backgroundColor: backgroundColor ? backgroundColor : undefined,
                    ...buttonStyles,
                }}
                onClick={onToggle}
            >
                <span>{label}</span>
                <span className={`${styles.arrow} ${isOpen ? styles.up : ""}`}>
                    ▼
                </span>
            </button>

            <div ref={contentRef} className={styles.contentContainer} style={{ height }}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AccordionButton;