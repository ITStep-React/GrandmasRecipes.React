import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import RecipeGrid from '@/widgets/RecipeGrid/RecipeGrid.jsx';

import {
    fetchLikedRecipes,
    selectLikedRecipeList,
    selectLikedRecipeLoading,
    selectHasMoreLikedRecipes,
    selectLikedRecipePage,
    toggleLike,
    clearLikedList,
} from '@/features/recipe/recipeSlice';
import {
    selectIsAuthenticated,
    selectMyId,
} from '@/features/auth/authSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll.js';

import styles from './LikedPage.module.scss';

function LikedPage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuth = useSelector(selectIsAuthenticated);
    const userId = useSelector(selectMyId);

    const recipes = useSelector(selectLikedRecipeList);
    const loading = useSelector(selectLikedRecipeLoading);
    const hasMore = useSelector(selectHasMoreLikedRecipes);
    const currentPage = useSelector(selectLikedRecipePage);

    useEffect(() => {
        if (!isAuth) navigate('/account', { replace: true });
    }, [isAuth, navigate]);

    useEffect(() => {
        if (!userId) return;
        dispatch(clearLikedList());
        dispatch(fetchLikedRecipes({ userId, page: 1 }));
        return () => { dispatch(clearLikedList()); };
    }, [dispatch, userId]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            dispatch(fetchLikedRecipes({ userId, page: currentPage + 1 }));
        }
    }, [dispatch, loading, hasMore, currentPage, userId]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleLike = (recipeId) => dispatch(toggleLike(recipeId));

    if (!isAuth) return null;

    return (
        <section className={styles.page}>
            <RecipeGrid
                recipes={recipes}
                loading={loading}
                onLike={handleLike}
            />
            <div ref={sentinelRef} style={{ height: 1 }} />
        </section>
    );
}

export default LikedPage;