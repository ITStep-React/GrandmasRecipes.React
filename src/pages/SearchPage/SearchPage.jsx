import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import RecipeGrid from '@/widgets/RecipeGrid/RecipeGrid.jsx';

import { fetchCategories } from '@/features/categorySlice';
import { fetchCuisines } from '@/features/cuisineSlice';
import { fetchDifficulties } from '@/features/difficultySlice';
import { fetchProducts, fetchUnits } from '@/features/productSlice';
import {
    fetchRecipes,
    selectRecipeList,
    selectRecipeLoadingList,
    selectHasMoreRecipes,
    selectRecipePage,
    toggleLike,
    clearRecipeList,
} from '@/features/recipeSlice';
import {
    selectQuery, selectFilters, selectTotalActiveFilters,
    removeFilter, clearFilters, setQuery,
} from '@/features/searchSlice';
import { selectCategoryById } from '@/features/categorySlice';
import { selectCuisineById } from '@/features/cuisineSlice';
import { selectDifficultyById } from '@/features/difficultySlice';
import { selectProductById } from '@/features/productSlice';
import { selectIsAuthenticated, selectMyId } from '@/features/authSlice';

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

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const myId = useSelector(selectMyId);

    const query = useSelector(selectQuery);
    const filters = useSelector(selectFilters);
    const totalActiveFilters = useSelector(selectTotalActiveFilters);

    const recipes = useSelector(selectRecipeList);
    const loading = useSelector(selectRecipeLoadingList);
    const hasMore = useSelector(selectHasMoreRecipes);
    const currentPage = useSelector(selectRecipePage);
    const debounceRef = useRef(null);
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    // Debounce query changes by 400ms before hitting the API
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
    }, [query]);

    const [gridVisible, setGridVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchUnits());
        return () => { dispatch(clearRecipeList()); };
    }, [dispatch]);

    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

    useEffect(() => {
        setGridVisible(false);
        dispatch(clearRecipeList());
        dispatch(fetchRecipes({ page: 0, userId: myId, query: debouncedQuery, ...filters })).then(() => {
            requestAnimationFrame(() => setGridVisible(true));
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, filtersKey, debouncedQuery, myId]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            dispatch(fetchRecipes({ page: currentPage + 1, userId: myId, query: debouncedQuery, ...filters }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, loading, hasMore, currentPage, filtersKey, debouncedQuery, myId]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleRemoveFilter = (groupKey, id) => dispatch(removeFilter({ groupKey, id }));
    const handleClearAll = () => dispatch(clearFilters());

    const handleLike = (recipeId) => {
        if (!isAuthenticated || !myId) return;
        const recipe = recipes.find((r) => r.id === recipeId);
        dispatch(toggleLike({ recipeId, accountId: myId, isLiked: recipe?.isLiked ?? false }));
    };

    const activeChips = Object.entries(filters).flatMap(([groupKey, ids]) =>
        ids.map((id) => ({ groupKey, id }))
    );

    // Server handles query filtering via /recipes/filter — use results directly
    const displayedRecipes = recipes;

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
                    recipes={displayedRecipes}
                    loading={loading}
                    onLike={handleLike}
                />
            </div>

            <div ref={sentinelRef} style={{ height: 1 }} />
        </section>
    );
}

export default SearchPage;