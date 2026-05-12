import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router';

import FilterModal from '@/widgets/FilterModal/FilterModal.jsx';
import BurgerButton from '@/widgets/BurgerButton/BurgerButton.jsx';

import { selectAuthUser } from '@/features/authSlice';
import {
    setQuery,
    setFilters,
    removeFilter,
    clearFilters,
    selectQuery,
    selectFilters,
    selectTotalActiveFilters,
} from '@/features/searchSlice';

import MediumLogo from '@/assets/icons/medium-logo.png';

import styles from './Navbar.module.scss';
import { useState } from 'react';

function Navbar({ isOpen, toggleSidebar }) {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const me = useSelector(selectAuthUser);
    const query = useSelector(selectQuery);
    const filters = useSelector(selectFilters);
    const totalActiveFilters = useSelector(selectTotalActiveFilters);

    const [modalOpen, setModalOpen] = useState(false);

    const searchRef = useRef(null);
    const isOnSearch = location.pathname === '/search';

    const goToSearch = () => {
        if (!isOnSearch) navigate('/search');
    };

    const handleQueryChange = (e) => {
        dispatch(setQuery(e.target.value));
        goToSearch();
    };

    const handleQueryKeyDown = (e) => {
        if (e.key === 'Enter') goToSearch();
    };

    const handleApplyFilters = (newFilters) => {
        dispatch(setFilters(newFilters));
        goToSearch();
    };

    const handleRemoveFilter = (groupKey, id) => {
        dispatch(removeFilter({ groupKey, id }));
        goToSearch();
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.burgerButton}>
                    <BurgerButton isOpen={isOpen} onClick={toggleSidebar} />
                </div>

                <Link to='/' className={`img-container ${styles.toHide}`}>
                    <img className={styles.logo} src={MediumLogo} alt='medium_logo' />
                </Link>

                <div className={styles.search}>
                    <input
                        ref={searchRef}
                        type='text'
                        placeholder={i18n.t('search') + '...'}
                        value={query}
                        onChange={handleQueryChange}
                        onKeyDown={handleQueryKeyDown}
                        onFocus={goToSearch}
                    />

                    <button
                        className={`${styles.searchButton} ${totalActiveFilters > 0 ? styles.searchButtonActive : ''}`}
                        onClick={() => setModalOpen(true)}
                    >
                        {totalActiveFilters > 0 && (
                            <span className={styles.filterBadge}>{totalActiveFilters}</span>
                        )}
                        <svg viewBox='0 0 24 24' width={24} height={24} fill='none'>
                            <path d='M3 7H6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M3 17H9' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M18 17L21 17' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M15 7L21 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z' stroke='currentColor' strokeWidth='1.5' />
                            <path d='M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z' stroke='currentColor' strokeWidth='1.5' />
                        </svg>
                    </button>

                    <button
                        className={`${styles.searchButton} ${styles.toHide}`}
                        onClick={() => { searchRef.current?.focus(); goToSearch(); }}
                    >
                        <svg viewBox='0 0 24 24' width={24} height={24} fill='none'>
                            <path d='M17 17L21 21' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                    </button>
                </div>

                <button className={`icon-container ${styles.account}`} onClick={handleAccountClick}>
                    {<svg viewBox="0 0 24 24" width={24} height={24} color={"currentColor"} fill={"none"}>
                        <path d="M17 8.5C17 5.73858 14.7614 3.5 12 3.5C9.23858 3.5 7 5.73858 7 8.5C7 11.2614 9.23858 13.5 12 13.5C14.7614 13.5 17 11.2614 17 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M19 20.5C19 16.634 15.866 13.5 12 13.5C8.13401 13.5 5 16.634 5 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>}
                </button>
            </nav>

            <FilterModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onApply={handleApplyFilters}
                initialSelected={filters}
            />
        </>
    );
}

export default Navbar;