import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { login, register, selectAuthStatus, selectAuthError } from '@/features/auth/authSlice';

import AuthBanner from '@/assets/images/banners/auth_banner.avif';

import styles from './AuthModal.module.scss';

const TABS = ['registration', 'login'];

const inputProps = (value, setter, errorKey, clearError) => ({
    value,
    onChange: (e) => { setter(e.target.value); clearError(errorKey); },
    onInput: (e) => { setter(e.target.value); clearError(errorKey); },
});

function AuthModal({ isOpen, onClose }) {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();

    const authStatus = useSelector(selectAuthStatus);
    const authError = useSelector(selectAuthError);

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [tab, setTab] = useState('login');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localErrors, setLocalErrors] = useState({});

    const isLoading = authStatus === 'loading';
    const isLogin = tab === 'login';

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (authStatus === 'authenticated' && isOpen) {
            onClose?.();
        }
    }, [authStatus, isOpen, onClose]);

    const handleTransitionEnd = (e) => {
        if (e.target === e.currentTarget && !isOpen) {
            setMounted(false);
            resetForm();
        }
    };

    if (!mounted) return null;

    const resetForm = () => {
        setUsername(''); setEmail('');
        setPassword(''); setConfirmPassword('');
        setLocalErrors({});
    };

    const handleTabChange = (next) => {
        setTab(next);
        resetForm();
    };

    const clearError = (key) =>
        localErrors[key] && setLocalErrors((prev) => ({ ...prev, [key]: false }));

    const validate = () => {
        const e = {};
        if (!isLogin && !username.trim()) e.username = 'required';
        if (!isLogin && !email.trim()) e.email = 'required';
        if (!password) e.password = 'required';
        if (!isLogin && password !== confirmPassword) e.confirmPassword = 'mismatch';
        if (password && password.length < 4) e.password = 'too-short';
        return e;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length) { setLocalErrors(errors); return; }
        setLocalErrors({});

        if (isLogin) {
            await dispatch(login({ username, password }));
        } else {
            const result = await dispatch(register({ username, email, password }));
            if (register.fulfilled.match(result)) {
                await dispatch(login({ username, password }));
            }
        }
    };

    const showServerError = authStatus === 'unauthenticated' && authError &&
        Object.keys(localErrors).length === 0;

    return (
        <div
            className={`${styles.overlay} ${visible ? styles.visible : ''}`}
            onClick={() => onClose?.()}
            onTransitionEnd={handleTransitionEnd}
        >
            <div
                className={`${styles.modal} ${visible ? styles.visible : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Табы */}
                <div className={styles.tabs}>
                    {TABS.map((t) => (
                        <button
                            key={t}
                            type='button'
                            className={`btn ${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                            onClick={() => handleTabChange(t)}
                        >
                            {i18n.t(t)}
                        </button>
                    ))}
                </div>

                <div className={styles.content}>
                    <div className={styles.picture}>
                        <img src={AuthBanner} alt='' className={styles.image} />
                    </div>

                    <form
                        className={styles.body}
                        onSubmit={handleSubmit}
                        autoComplete='on'
                        id={isLogin ? 'form-login' : 'form-register'}
                    >
                        {showServerError && (
                            <p className={styles.serverError}>{authError}</p>
                        )}

                        {!isLogin && (
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor='reg-username'>
                                    {i18n.t('username')}
                                </label>
                                <input
                                    id='reg-username'
                                    name='username'
                                    type='text'
                                    autoComplete='username'
                                    className={`${styles.input} ${localErrors.username ? styles.inputError : ''}`}
                                    disabled={isLoading}
                                    {...inputProps(username, setUsername, 'username', clearError)}
                                />
                                {localErrors.username && (
                                    <span className={styles.fieldError}>{i18n.t('required') ?? 'Required'}</span>
                                )}
                            </div>
                        )}

                        {isLogin ? (
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor='login-username'>
                                    {i18n.t('username')}
                                </label>
                                <input
                                    id='login-username'
                                    name='username'
                                    type='text'
                                    autoComplete='username'
                                    className={`${styles.input} ${localErrors.username ? styles.inputError : ''}`}
                                    disabled={isLoading}
                                    {...inputProps(username, setUsername, 'username', clearError)}
                                />
                            </div>
                        ) : (
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor='reg-email'>
                                    {i18n.t('email')}
                                </label>
                                <input
                                    id='reg-email'
                                    name='email'
                                    type='email'
                                    autoComplete='email'
                                    className={`${styles.input} ${localErrors.email ? styles.inputError : ''}`}
                                    disabled={isLoading}
                                    {...inputProps(email, setEmail, 'email', clearError)}
                                />
                                {localErrors.email && (
                                    <span className={styles.fieldError}>{i18n.t('required') ?? 'Required'}</span>
                                )}
                            </div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor={isLogin ? 'login-password' : 'reg-password'}>
                                {i18n.t('password')}
                            </label>
                            <input
                                id={isLogin ? 'login-password' : 'reg-password'}
                                name='password'
                                type='password'
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                className={`${styles.input} ${localErrors.password ? styles.inputError : ''}`}
                                disabled={isLoading}
                                {...inputProps(password, setPassword, 'password', clearError)}
                            />
                            {localErrors.password === 'too-short' && (
                                <span className={styles.fieldError}>
                                    {i18n.t('password-too-short') ?? 'Min 4 characters'}
                                </span>
                            )}
                            {localErrors.password === 'required' && (
                                <span className={styles.fieldError}>{i18n.t('required') ?? 'Required'}</span>
                            )}
                        </div>

                        {!isLogin && (
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor='reg-confirm-password'>
                                    {i18n.t('confirm-password')}
                                </label>
                                <input
                                    id='reg-confirm-password'
                                    name='confirm-password'
                                    type='password'
                                    autoComplete='new-password'
                                    className={`${styles.input} ${localErrors.confirmPassword ? styles.inputError : ''}`}
                                    disabled={isLoading}
                                    {...inputProps(confirmPassword, setConfirmPassword, 'confirmPassword', clearError)}
                                />
                                {localErrors.confirmPassword === 'mismatch' && (
                                    <span className={styles.fieldError}>
                                        {i18n.t('passwords-mismatch')}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className={styles.footer}>
                            <button
                                type='submit'
                                className={`btn ${styles.submit}`}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? (i18n.t('loading') ?? '...')
                                    : i18n.t('submit')
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;