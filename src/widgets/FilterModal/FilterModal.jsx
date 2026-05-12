import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import AccordionButton from '../AccordionButton/AccordionButton.jsx';

import { selectCategories } from '@/features/categorySlice.js';
import { selectCuisines } from '@/features/cuisineSlice.js';
import { selectDifficulties } from '@/features/difficultySlice.js';
import { selectProducts } from '@/features/productSlice.js';

import styles from './FilterModal.module.scss';

const GROUPS = [
    { key: 'cuisineIds', label: 'cuisine', selectorFn: selectCuisines },
    { key: 'categoryIds', label: 'category', selectorFn: selectCategories },
    { key: 'difficultyIds', label: 'difficulty', selectorFn: selectDifficulties },
    { key: 'productIds', label: 'ingredients', selectorFn: selectProducts },
];

const EMPTY = { cuisineIds: [], categoryIds: [], difficultyIds: [], productIds: [] };

function FilterModal({ isOpen, onClose, onApply, initialSelected }) {
    const { i18n } = useTranslation();

    const cuisines = useSelector(selectCuisines);
    const categories = useSelector(selectCategories);
    const difficulties = useSelector(selectDifficulties);
    const products = useSelector(selectProducts);

    const DATA = {
        cuisineIds: cuisines,
        categoryIds: categories,
        difficultyIds: difficulties,
        productIds: products,
    };

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = useState(initialSelected ?? EMPTY);
    const [openAccordion, setOpenAccordion] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const overlayRef = useRef(null);

    useEffect(() => {
        if (initialSelected) setSelected(initialSelected);
    }, [initialSelected]);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    const handleTransitionEnd = (e) => {
        if (e.target === e.currentTarget && !isOpen) {
            setMounted(false);
            setProductSearch('');
        }
    };

    const toggle = (groupKey, id) => {
        setSelected((prev) => {
            const cur = prev[groupKey];
            return {
                ...prev,
                [groupKey]: cur.includes(id)
                    ? cur.filter((v) => v !== id)
                    : [...cur, id],
            };
        });
    };

    const reset = () => {
        setSelected(EMPTY);
        setOpenAccordion(null);
        setProductSearch('');
    };

    const totalSelected = Object.values(selected).flat().length;

    const handleApply = () => {
        onApply?.(selected);
        onClose();
    };

    if (!mounted) return null;

    const renderGroup = (groupKey) => {
        const items = DATA[groupKey] ?? [];
        const isProductGroup = groupKey === 'productIds';

        const filtered = isProductGroup && productSearch.trim()
            ? items.filter((item) =>
                item.name.toLowerCase().includes(productSearch.trim().toLowerCase())
            )
            : items;

        return (
            <>
                {isProductGroup && (
                    <input
                        type='text'
                        className={styles.productSearch}
                        placeholder={i18n.t('search') + '...'}
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                    />
                )}
                <div className={`${styles.chipGrid} ${isProductGroup ? styles.chipGridScrollable : ''}`}>
                    {filtered.map((item) => {
                        const active = selected[groupKey].includes(item.id);
                        return (
                            <button
                                key={item.id}
                                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                                onClick={() => toggle(groupKey, item.id)}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                    {filtered.length === 0 && (
                        <span className={styles.emptyHint}>
                            {i18n.t('nothing-found') ?? 'Nothing found'}
                        </span>
                    )}
                </div>
            </>
        );
    };

    return (
        <div
            className={`${styles.overlay} ${visible ? styles.visible : ''}`}
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && onClose()}
            onTransitionEnd={handleTransitionEnd}
        >
            <div className={`${styles.modal} ${visible ? styles.visible : ''}`}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{i18n.t('filters')}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>╳</button>
                </div>

                <div className={styles.body}>
                    {isMobile ? (
                        <div className={styles.accordions}>
                            {GROUPS.map(({ key, label }) => {
                                const count = selected[key].length;
                                return (
                                    <AccordionButton
                                        key={key}
                                        label={
                                            <span className={styles.accordionLabel}>
                                                <span>{i18n.t(label)}</span>
                                                {count > 0 && (
                                                    <span className={styles.accordionBadge}>{count}</span>
                                                )}
                                            </span>
                                        }
                                        isOpen={openAccordion === key}
                                        onToggle={() => setOpenAccordion(openAccordion === key ? null : key)}
                                    >
                                        {renderGroup(key)}
                                    </AccordionButton>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.columns}>
                            {GROUPS.map(({ key, label }) => {
                                const count = selected[key].length;
                                return (
                                    <div key={key} className={styles.column}>
                                        <div className={styles.columnHeader}>
                                            <h3 className={styles.columnTitle}>{label}</h3>
                                            {count > 0 && (
                                                <span className={styles.columnBadge}>{count}</span>
                                            )}
                                        </div>
                                        {renderGroup(key)}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className='btn' onClick={handleApply}>
                        {i18n.t('submit')}
                        {totalSelected > 0 && ` (${totalSelected})`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterModal;
