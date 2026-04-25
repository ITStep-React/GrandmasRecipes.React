import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import RecipeGrid from '@/widgets/RecipeGrid/RecipeGrid.jsx';

import { fetchCategories } from '@/features/category/categorySlice';
import { fetchCuisines } from '@/features/cuisine/cuisineSlice';
import { fetchDifficulties } from '@/features/difficulty/difficultySlice';
import { fetchProducts, fetchUnits } from '@/features/product/productSlice';
import {
    fetchRecipes,
    selectRecipeList,
    selectRecipeLoadingList,
    selectHasMoreRecipes,
    selectRecipePage,
    toggleLike,
    clearRecipeList,
} from '@/features/recipe/recipeSlice';
import {
    selectQuery, selectFilters, selectTotalActiveFilters,
    removeFilter, clearFilters,
} from '@/features/search/searchSlice';
import { selectCategoryById } from '@/features/category/categorySlice';
import { selectCuisineById } from '@/features/cuisine/cuisineSlice';
import { selectDifficultyById } from '@/features/difficulty/difficultySlice';
import { selectProductById } from '@/features/product/productSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll.js';

import styles from './SearchPage.module.scss';

function ActiveChipConnected({ groupKey, id, onRemove }) {
    const category = useSelector(selectCategoryById(id));
    const cuisine = useSelector(selectCuisineById(id));
    const difficulty = useSelector(selectDifficultyById(id));
    const product = useSelector(selectProductById(id));

    let label = String(id);
    if (groupKey === 'categoryIds') label = category?.name ?? label;
    if (groupKey === 'cuisineIds') label = cuisine?.name ?? label;
    if (groupKey === 'difficultyIds') label = difficulty?.name ?? label;
    if (groupKey === 'productIds') label = product?.name ?? label;

    return (
        <span className={styles.activeChip}>
            {label}
            <button className={styles.activeChipRemove} onClick={onRemove} aria-label='remove'>✕</button>
        </span>
    );
}

function SearchPage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();

    const query = useSelector(selectQuery);
    const filters = useSelector(selectFilters);
    const totalActiveFilters = useSelector(selectTotalActiveFilters);

    const recipes = useSelector(selectRecipeList);
    const loading = useSelector(selectRecipeLoadingList);
    const hasMore = useSelector(selectHasMoreRecipes);
    const currentPage = useSelector(selectRecipePage);
    const [gridVisible,   setGridVisible]   = useState(false);

    useEffect(() => {
        dispatch(fetchUnits());
        return () => { dispatch(clearRecipeList()); };
    }, [dispatch]);

    useEffect(() => {
        setGridVisible(false);
        dispatch(clearRecipeList());
        dispatch(fetchRecipes({ page: 1, ...filters })).then(() => {
            requestAnimationFrame(() => setGridVisible(true));
        });
    }, [dispatch, query, filters]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            dispatch(fetchRecipes({ page: currentPage + 1, ...filters }));
        }
    }, [dispatch, loading, hasMore, currentPage, filters]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleRemoveFilter = (groupKey, id) => dispatch(removeFilter({ groupKey, id }));
    const handleClearAll = () => dispatch(clearFilters());
    const handleLike = (recipeId) => dispatch(toggleLike(recipeId));

    const activeChips = Object.entries(filters).flatMap(([groupKey, ids]) =>
        ids.map((id) => ({ groupKey, id }))
    );

    return (
        <section className={styles.page}>
            {activeChips.length > 0 && (
                <div className={styles.activeFilters}>
                    {activeChips.map(({ groupKey, id }) => (
                        <ActiveChipConnected
                            key={`${groupKey}-${id}`}
                            groupKey={groupKey}
                            id={id}
                            onRemove={() => handleRemoveFilter(groupKey, id)}
                        />
                    ))}
                    <button className={styles.clearAll} onClick={handleClearAll}>
                        {i18n.t('reset-all')}
                    </button>
                </div>
            )}
            <div className={`${styles.results} ${gridVisible ? styles.resultsVisible : ''}`}>
                <RecipeGrid
                        recipes={recipes}
                        loading={loading}
                        onLike={handleLike}
                />
            </div>

            <div ref={sentinelRef} style={{ height: 1 }} />
        </section>
    );
}

export default SearchPage;
