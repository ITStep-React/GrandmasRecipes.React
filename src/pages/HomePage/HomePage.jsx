import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Banner from '@/widgets/Banner/Banner.jsx';
import HorizontalScroll from '@/widgets/HorizontalScroll/HorizontalScroll.jsx';
import RecipeCard from '@/widgets/RecipeCard/RecipeCard.jsx';
import CategoryCard from '@/widgets/CategoryCard/CategoryCard.jsx';
import RecipeGrid from '@/widgets/RecipeGrid/RecipeGrid.jsx';

import { fetchBanners, selectBanners } from '@/features/banner/bannerSlice';
import { fetchCategories, selectCategories } from '@/features/category/categorySlice';
import {
    fetchRecipes,
    fetchLatestRecipes,
    fetchRecentlyViewed,
    selectRecipeList,
    selectRecipeLoadingList,
    selectHasMoreRecipes,
    selectRecipePage,
    selectLatestRecipes,
    selectLatestRecipesLoading,
    selectRecentlyViewed,
    selectRecentlyViewedLoading,
    toggleLike,
    clearRecipeList,
} from '@/features/recipe/recipeSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll';

import styles from './HomePage.module.scss';

function HomePage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();

    const banners = useSelector(selectBanners);
    const categories = useSelector(selectCategories);
    const recipes = useSelector(selectRecipeList);
    const loading = useSelector(selectRecipeLoadingList);
    const hasMore = useSelector(selectHasMoreRecipes);
    const currentPage = useSelector(selectRecipePage);
    const latestRecipes = useSelector(selectLatestRecipes);
    const recentlyViewed = useSelector(selectRecentlyViewed);
    const loadingRecent = useSelector(selectRecentlyViewedLoading);

    useEffect(() => {
        dispatch(fetchBanners());
        dispatch(fetchCategories());
        dispatch(fetchRecipes({ page: 1 }));
        dispatch(fetchLatestRecipes());
        dispatch(fetchRecentlyViewed());
        return () => { dispatch(clearRecipeList()); };
    }, [dispatch]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            dispatch(fetchRecipes({ page: currentPage + 1 }));
        }
    }, [dispatch, loading, hasMore, currentPage]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleLike = (recipeId) => dispatch(toggleLike(recipeId));

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
