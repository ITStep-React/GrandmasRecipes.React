import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ProfileModal.module.scss';

function ProfileModal({ isOpen, onClose, user, onSave }) {
    const { i18n } = useTranslation()

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState(user?.username ?? '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            requestAnimationFrame(() =>
                requestAnimationFrame(() => setVisible(true))
            );
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    const handleTransitionEnd = (e) => {
        if (e.target === e.currentTarget && !isOpen) setMounted(false);
    };

    if (!mounted) return null;

    const handleClose = () => onClose?.();
    const handleOverlayClick = () => handleClose();
    const handleContentClick = (e) => e.stopPropagation();

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        e.target.value = '';
    };

    const handleSubmit = () => {
        if (newPassword && !password) {
            setPasswordError(true);
            return;
        }
        setPasswordError(false);
        onSave?.({ username, avatarUrl, password, newPassword });
        handleClose();
    };

    return (
        <div
            className={`${styles.overlay} ${visible ? styles.visible : ''}`}
            onClick={handleOverlayClick}
            onTransitionEnd={handleTransitionEnd}
        >
            <div
                className={`${styles.modal} ${visible ? styles.visible : ''}`}
                onClick={handleContentClick}
            >
                <button className={styles.closeBtn} onClick={handleClose}>
                    <svg viewBox='0 0 24 24' width={24} height={24} color={'currentColor'} fill={'none'}>
                        <path d='M18 6L6.00081 17.9992M17.9992 18L6 6.00085' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                    </svg>
                </button>

                <div className={styles.header}>
                    <div className={styles.avatar} onClick={handleAvatarClick}>
                        {avatarUrl
                            ? <img src={avatarUrl} alt='avatar' className={styles.image} />
                            : <div className={styles.fallback}>@</div>
                        }
                        <div className={styles.overlay}></div>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            className={styles.input}
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className={styles.info}>
                        <span className={styles.email}>{user?.email ?? 'email@gmail.com'}</span>
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.field}>
                        <label className={styles.label}>{i18n.t('username')}</label>
                        <input
                            type='text'
                            className={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{i18n.t('password')}</label>
                        <input
                            type='password'
                            className={`${styles.input} ${passwordError ? styles.inputError : ''}`}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>{i18n.t('new-password')}</label>
                        <input
                            type='password'
                            className={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={`btn ${styles.submit}`} onClick={handleSubmit}>
                        {i18n.t('submit')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;
