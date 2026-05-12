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
} from '@/features/recipeSlice';
import {
    selectIsAuthenticated,
    selectMyId,
} from '@/features/authSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll.js';

import styles from './LikedPage.module.scss';

function LikedPage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuth = useSelector(selectIsAuthenticated);
    const myId = useSelector(selectMyId);

    const recipes = useSelector(selectLikedRecipeList);
    const loading = useSelector(selectLikedRecipeLoading);
    const hasMore = useSelector(selectHasMoreLikedRecipes);
    const currentPage = useSelector(selectLikedRecipePage);

    useEffect(() => {
        if (!isAuth) navigate('/account', { replace: true });
    }, [isAuth, navigate]);

    useEffect(() => {
        if (!myId) return;
        dispatch(clearLikedList());
        dispatch(fetchLikedRecipes({ userId: myId, page: 0 }));
        return () => { dispatch(clearLikedList()); };
    }, [dispatch, myId]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore && myId) {
            dispatch(fetchLikedRecipes({ userId: myId, page: currentPage + 1 }));
        }
    }, [dispatch, loading, hasMore, currentPage, myId]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleLike = (recipeId) => {
        if (!myId) return;
        const recipe = recipes.find((r) => r.id === recipeId);
        dispatch(toggleLike({ recipeId, accountId: myId, isLiked: recipe?.isLiked ?? false }));
    };

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