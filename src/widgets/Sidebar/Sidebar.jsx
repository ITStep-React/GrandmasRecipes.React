import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import i18nConfig from '@/shared/config/i18n/i18n.js';
import AccordionButton from '@/widgets/AccordionButton/AccordionButton.jsx';
import ThemeButton from '@/widgets/ThemeButton/ThemeButton.jsx';

import MediumLogo from '@/assets/icons/medium-logo.png';
import CategoriesImg from '@/assets/images/buttons/categories.avif';
import CuisinesImg from '@/assets/images/buttons/cuisines.avif';
import DificultiesImg from '@/assets/images/buttons/dificulties.avif';
import LanguagesImg from '@/assets/images/buttons/languages.avif';

import { fetchCategories, selectCategories } from '@/features/category/categorySlice';
import { fetchCuisines, selectCuisines } from '@/features/cuisine/cuisineSlice';
import { fetchDifficulties, selectDifficulties } from '@/features/difficulty/difficultySlice';
import { setFilter } from '@/features/search/searchSlice';
import { selectIsAuthenticated } from '@/features/auth/authSlice';

import styles from './Sidebar.module.scss';

function Sidebar({ isOpen, onClose }) {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const categories = useSelector(selectCategories);
    const cuisines = useSelector(selectCuisines);
    const difficulties = useSelector(selectDifficulties);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchCuisines());
        dispatch(fetchDifficulties());
    }, [dispatch]);

    const toggle = (id) =>
        setOpenId((prev) => (prev === id ? null : id));

    const handleFilter = (groupKey, id) => {
        dispatch(setFilter({ groupKey, id }));
        navigate('/search');
    }

    return <>
        <div
            className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
            onClick={onClose}
        />
        <section className={`${styles.section} ${isOpen ? styles.open : ''}`}>
            <Link to={'/'} className={`btn ${styles.button} ${styles.home}`}>
                {i18n.t('home')}🏠︎
            </Link>
            <Link to={isAuthenticated ? '/editor' : '/account'} className={`btn ${styles.button} ${styles.create}`}>
                {i18n.t('create-recipe')}🞢
            </Link>
            <Link to={isAuthenticated ? '/liked' : '/account'} className={`btn ${styles.button} ${styles.liked}`}>
                {i18n.t('liked-recipes')}❤
            </Link>

            <hr />

            <AccordionButton
                styles={{ height: '6vh' }}
                label={i18n.t('categories')}
                backgroundImage={CategoriesImg}
                isOpen={openId === 1}
                onToggle={() => toggle(1)}
            >
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className='btn'
                        onClick={() => handleFilter('categoryIds', cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </AccordionButton>

            <AccordionButton
                styles={{ height: '6vh' }}
                label={i18n.t('cuisines')}
                backgroundImage={CuisinesImg}
                isOpen={openId === 2}
                onToggle={() => toggle(2)}
            >
                {cuisines.map((cuisine) => (
                    <button
                        key={cuisine.id}
                        className='btn'
                        onClick={() => handleFilter('cuisineIds', cuisine.id)}
                    >
                        {cuisine.name}
                    </button>
                ))}
            </AccordionButton>

            <AccordionButton
                styles={{ height: '6vh' }}
                label={i18n.t('difficulty')}
                backgroundImage={DificultiesImg}
                isOpen={openId === 3}
                onToggle={() => toggle(3)}
            >
                {difficulties.map((diff) => (
                    <button
                        key={diff.id}
                        className='btn'
                        onClick={() => handleFilter('difficultyIds', diff.id)}
                    >
                        {diff.name}
                    </button>
                ))}
            </AccordionButton>

            <hr />

            <ThemeButton styles={{ height: '6vh' }} />

            <AccordionButton
                styles={{ height: '6vh' }}
                label={i18n.t('languages')}
                backgroundImage={LanguagesImg}
                isOpen={openId === 4}
                onToggle={() => toggle(4)}
            >
                {i18nConfig.options.supportedLngs.filter((lng) => lng !== 'cimode').map((lng) => {
                    return <button key={lng} className='btn' onClick={() => { i18n.changeLanguage(lng); setOpenId(null); }}>{i18n.getFixedT(lng)('languageName')}</button>;
                })}
            </AccordionButton>

            <Link to='/account' className={`btn ${styles.button} ${styles.account}`}>
                {i18n.t('account')}&#128100;
            </Link>
            <a href='https://github.com/ITStep-ASP-Net-Core/GrandmasRecipes#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82-%D0%B1%D0%B0%D0%B1%D1%83%D1%81%D0%B8%D0%BD%D1%96-%D1%80%D0%B5%D1%86%D0%B5%D0%BF%D1%82%D0%B8' target='_blank' rel='noopener noreferrer' className={`btn ${styles.button} ${styles.about}`}>
                {i18n.t('about-project')} &#128712;
            </a>

            <span className={styles.copyright}>
                &copy; {new Date().getFullYear()} {i18n.t('GrandmasRecipes')} - {i18n.t('GrandmasJoy')}
            </span>

        </section>
    </>
}

export default Sidebar;