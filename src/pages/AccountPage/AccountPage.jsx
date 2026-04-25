import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import ProfileModal from '@/widgets/ProfileModal/ProfileModal.jsx';
import RecipeGrid from '@/widgets/RecipeGrid/RecipeGrid.jsx';
import AuthModal from '@/widgets/AuthModal/AuthModal.jsx';

import {
    selectAuthUser,
    selectIsAuthenticated,
    updateProfile,
    uploadAvatar,
    selectUploadingAvatar,
} from '@/features/auth/authSlice';
import { fetchAuthorById, selectAuthorById } from '@/features/author/authorSlice';
import {
    fetchRecipes,
    selectRecipeList,
    selectRecipeLoadingList,
    selectHasMoreRecipes,
    selectRecipePage,
    toggleLike,
    clearRecipeList,
} from '@/features/recipe/recipeSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll';

import styles from './AccountPage.module.scss';

function AccountPage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const { id } = useParams();

    const me = useSelector(selectAuthUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const uploadingAvatar = useSelector(selectUploadingAvatar);

    const authorId = id ? Number(id) : null;
    const isOwn = !authorId || authorId === me?.id;
    const targetId = isOwn ? me?.id : authorId;

    const publicAuthor = useSelector(selectAuthorById(targetId));
    const account = isOwn ? me : publicAuthor;

    const recipes = useSelector(selectRecipeList);
    const loading = useSelector(selectRecipeLoadingList);
    const hasMore = useSelector(selectHasMoreRecipes);
    const currentPage = useSelector(selectRecipePage);

    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!isOwn && targetId) dispatch(fetchAuthorById(targetId));
        if (targetId) dispatch(fetchRecipes({ page: 1, authorId: targetId }));
        return () => { dispatch(clearRecipeList()); };
    }, [dispatch, isOwn, targetId]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore && targetId) {
            dispatch(fetchRecipes({ page: currentPage + 1, authorId: targetId }));
        }
    }, [dispatch, loading, hasMore, currentPage, targetId]);

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleSaveProfile = async ({ username, password, avatarFile }) => {
        let avatarUrl;
        if (avatarFile) {
            const result = await dispatch(uploadAvatar(avatarFile)).unwrap();
            avatarUrl = result.url;
        }
        dispatch(updateProfile({ username, password, avatarUrl }));
        setModalOpen(false);
    };

    const handleLike = (recipeId) => dispatch(toggleLike(recipeId));

    if (isOwn && !isAuthenticated) {
        return (
            <div className={styles.page}>
                <AuthModal
                    isOpen={true}
                    onClose={null}
                    onSubmit={(data) => console.log(data)}
                />
            </div>
        );
    }

    if (!account) return null;

    const displayName = account.username ?? account.name ?? '—';
    const avatarSrc = account.avatarUrl ?? account.imageUrl ?? `https://i.pravatar.cc/80?u=${targetId}`;

    return (
        <>
            <div className={styles.page}>
                <section className={styles.account}>
                    <img src={avatarSrc} alt={displayName} className={styles.avatar} />
                    <span className={styles.nickname}>@{displayName}</span>
                    <div className={styles.info}>
                        <div className={styles.item}>
                            <span className={styles.label}>{i18n.t('published')}</span>
                            <span className={styles.value}>{account.published ?? 0}</span>
                        </div>
                        <div className={styles.item}>
                            <span className={styles.label}>{i18n.t('likes')}</span>
                            <span className={styles.value}>
                                {account.likes ?? 0}
                                <svg viewBox='0 0 24 24' width={24} height={24} className={styles.like}>
                                    <path
                                        d='M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2Z'
                                        stroke='currentColor'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </section>

                {isOwn && (
                    <button onClick={() => setModalOpen(true)} className={`btn ${styles.editProfile}`}>
                        {i18n.t('edit-profile')}
                    </button>
                )}

                <RecipeGrid
                    title={i18n.t('recipes')}
                    recipes={recipes}
                    loading={loading}
                    onLike={handleLike}
                />

                <div ref={sentinelRef} style={{ height: 1 }} />
            </div>

            {isOwn && (
                <ProfileModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    uploadingAvatar={uploadingAvatar}
                    user={{
                        username: me?.username,
                        email: me?.email,
                        avatarUrl: me?.avatarUrl,
                    }}
                    onSave={handleSaveProfile}
                />
            )}
        </>
    );
}

export default AccountPage;