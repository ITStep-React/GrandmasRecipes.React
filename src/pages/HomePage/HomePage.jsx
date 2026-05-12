import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Banner from '@/widgets/Banner/Banner.jsx';
import HorizontalScroll from '@/widgets/HorizontalScroll/HorizontalScroll.jsx';
import RecipeCard from '@/widgets/RecipeCard/RecipeCard.jsx';
import CategoryCard from '@/widgets/CategoryCard/CategoryCard.jsx';
import RecipeGrid from '@/widgets/RecipeGrid/RecipeGrid.jsx';

import { fetchBanners, selectBanners } from '@/features/bannerSlice';
import { fetchCategories, selectCategories } from '@/features/categorySlice';
import {
    fetchRecipes,
    fetchLatestRecipes,
    fetchRecentlyViewed,
    selectRecipeList,
    selectRecipeLoadingList,
    selectHasMoreRecipes,
    selectRecipePage,
    selectLatestRecipes,
    selectRecentlyViewed,
    toggleLike,
    clearRecipeList,
} from '@/features/recipeSlice';
import { selectIsAuthenticated, selectMyId } from '@/features/authSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll';

import styles from './HomePage.module.scss';

function HomePage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const myId = useSelector(selectMyId);

    const banners = useSelector(selectBanners);
    const categories = useSelector(selectCategories);
    const recipes = useSelector(selectRecipeList);
    const loading = useSelector(selectRecipeLoadingList);
    const hasMore = useSelector(selectHasMoreRecipes);
    const currentPage = useSelector(selectRecipePage);
    const latestRecipes = useSelector(selectLatestRecipes);
    const recentlyViewed = useSelector(selectRecentlyViewed);

    useEffect(() => {
        dispatch(fetchBanners());
        dispatch(fetchCategories());
        dispatch(fetchRecipes({ page: 0, userId: myId }));
        dispatch(fetchLatestRecipes());
        dispatch(fetchRecentlyViewed());
        return () => { dispatch(clearRecipeList()); };
    }, [dispatch, myId]);

    const loadMore = useCallback(() => {
        dispatch(fetchRecipes({ page: currentPage + 1, userId: myId }));
    }, [dispatch, currentPage, myId]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleLike = (recipeId) => {
        if (!isAuthenticated || !myId) return;
        const recipe = recipes.find((r) => r.id === recipeId)
            ?? latestRecipes.find((r) => r.id === recipeId)
            ?? recentlyViewed.find((r) => r.id === recipeId);
        dispatch(toggleLike({ recipeId, accountId: myId, isLiked: recipe?.isLiked ?? false }));
    };

    return (
        <div className={styles.page}>
            <Banner slides={banners} />

            {recentlyViewed.length > 0 && (
                <HorizontalScroll title={i18n.t('last-reviewed')}>
                    {recentlyViewed.map((r) => (
                        <RecipeCard key={r.id} {...r} size="lg" onLike={handleLike} />
                    ))}
                </HorizontalScroll>
            )}

            <HorizontalScroll title={i18n.t('newest-recipes')}>
                {latestRecipes.map((r) => (
                    <RecipeCard key={r.id} {...r} size="md" onLike={handleLike} />
                ))}
            </HorizontalScroll>

            <HorizontalScroll title={i18n.t('categories')}>
                {categories.map((c) => (
                    <CategoryCard key={c.id} {...c} />
                ))}
            </HorizontalScroll>

            <RecipeGrid
                title={i18n.t('popular-recipes')}
                recipes={recipes}
                loading={loading}
                onLike={handleLike}
            />

            <div ref={sentinelRef} style={{ height: 1 }} />
        </div>
    );
}

export default HomePage;