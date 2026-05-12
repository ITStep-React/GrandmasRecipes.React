import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import ImageCarousel from '@/widgets/ImageCarousel/ImageCarousel.jsx';
import RecipeStep from '@/widgets/RecipeStep/RecipeStep.jsx';
import HorizontalScroll from '@/widgets/HorizontalScroll/HorizontalScroll.jsx';

import {
    fetchRecipeById,
    selectCurrentRecipe,
    selectRecipeLoadingCurrent,
    toggleLike,
    clearCurrentRecipe,
} from '@/features/recipeSlice';
import {
    fetchComments,
    addComment,
    selectComments,
    selectCommentsLoading,
    selectCommentsAdding,
    selectCommentsError,
    selectHasMoreComments,
    selectCommentsPage,
    clearComments,
} from '@/features/commentSlice';
import { setFilter } from '@/features/searchSlice';
import { fetchAuthorById, selectAuthorById } from '@/features/accountSlice';
import { selectIsAuthenticated, selectMyId } from '@/features/authSlice';

import useInfiniteScroll from '@/shared/lib/useInfiniteScroll';

import styles from './RecipePage.module.scss';

function RecipePage() {
    const { i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const recipeId = id;

    const recipe = useSelector(selectCurrentRecipe);
    const loadingRecipe = useSelector(selectRecipeLoadingCurrent);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const myId = useSelector(selectMyId);
    const author = useSelector(selectAuthorById(recipe?.author?.id));
    const comments = useSelector(selectComments);
    const loadingComments = useSelector(selectCommentsLoading);
    const addingComment = useSelector(selectCommentsAdding);
    const commentError = useSelector(selectCommentsError);
    const hasMoreComments = useSelector(selectHasMoreComments);
    const commentsPage = useSelector(selectCommentsPage);

    const [commentText, setCommentText] = useState('');

    const observerRef = useRef(null);

    const getObserver = useCallback(() => {
        if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(
                (entries) => entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.reviewVisible);
                        observerRef.current.unobserve(entry.target);
                    }
                }),
                { threshold: 0.1 }
            );
        }
        return observerRef.current;
    }, []);

    const reviewCallbackRef = useCallback((el) => {
        if (el) getObserver().observe(el);
    }, [getObserver]);

    useEffect(() => {
        return () => observerRef.current?.disconnect();
    }, []);

    useEffect(() => {
        dispatch(fetchRecipeById({ id: recipeId, userId: myId }));
        dispatch(fetchComments({ recipeId, page: 0 }));
        return () => {
            dispatch(clearCurrentRecipe());
            dispatch(clearComments());
        };
    }, [dispatch, recipeId, myId]);

    useEffect(() => {
        if (recipe?.author?.id) dispatch(fetchAuthorById(recipe.author.id));
    }, [dispatch, recipe?.author?.id]);

    const loadMoreComments = useCallback(() => {
        if (!loadingComments && hasMoreComments) {
            dispatch(fetchComments({ recipeId, page: commentsPage + 1 }));
        }
    }, [dispatch, loadingComments, hasMoreComments, commentsPage, recipeId]);

    const commentSentinelRef = useInfiniteScroll(loadMoreComments, hasMoreComments, loadingComments);

    const handleLike = () => {
        if (!isAuthenticated || !myId) { navigate('/account'); return; }
        dispatch(toggleLike({ recipeId: recipe.id, accountId: myId, isLiked: recipe.isLiked }));
    };

    const handleSendComment = () => {
        if (!isAuthenticated) { navigate('/account'); return; }
        const comment = commentText.trim();
        if (!comment) return;
        dispatch(addComment({ recipeId, comment }));
        setCommentText('');
    };

    const handleFilter = (groupKey, id) => {
        dispatch(setFilter({ groupKey, id }));
        navigate('/search');
    };

    if (loadingRecipe || !recipe) return null;

    const authorNickname = recipe.author?.nickname ?? '';
    const authorImageUrl = author?.imageUrl ?? recipe.author?.imageUrl ?? null;
    const authorId = recipe.author?.id;

    return (
        <div className={styles.page}>
            <section className={styles.mediaContent}>
                <ImageCarousel images={recipe.imageUrls ?? []} />
                <div className={styles.info}>
                    <div className={styles.item}>
                        <span className={styles.label}>{i18n.t('cuisine')}</span>
                        <button onClick={() => handleFilter('cuisineIds', recipe.cuisine?.id)} className={`lnk ${styles.value}`}>
                            {recipe.cuisine?.name}
                        </button>
                    </div>
                    <div className={styles.item}>
                        <span className={styles.label}>{i18n.t('difficulty')}</span>
                        <button onClick={() => handleFilter('difficultyIds', recipe.difficulty?.id)} className={`lnk ${styles.value}`}>
                            {recipe.difficulty?.name}
                        </button>
                    </div>
                    <div className={styles.item}>
                        <span className={styles.label}>{i18n.t('calories')}</span>
                        <span className={styles.value}>{recipe.calories}</span>
                    </div>
                </div>
            </section>

            <section className={styles.socialContent}>
                <div className={styles.info}>
                    <h1 className={styles.title}>{recipe.title}</h1>
                    <div className={styles.categories}>
                        {recipe.categories?.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleFilter('categoryIds', cat.id)}
                                className={`btn ${styles.category}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.social}>
                    <button
                        className={`${styles.like} ${recipe.isLiked ? styles.likeActive : ''}`}
                        onClick={handleLike}
                        title={!isAuthenticated ? (i18n.t('login-to-like') ?? 'Log in to like') : undefined}
                    >
                        <svg viewBox='0 0 24 24' width={24} height={24}>
                            <path
                                d='M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2Z'
                                fill={recipe.isLiked ? 'currentColor' : 'none'}
                                stroke='currentColor'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                        <span>{recipe.likes}</span>
                    </button>
                    <a href={`/account/${authorId}`} className={`lnk ${styles.nickname}`}>
                        @{authorNickname}
                    </a>
                    <img
                        src={authorImageUrl}
                        alt={authorNickname}
                        className={styles.avatar}
                    />
                </div>
            </section>

            <section className={styles.ingredients}>
                <h2 className={styles.sectionTitle}>{i18n.t('ingredients')}</h2>
                <ul className={styles.content}>
                    {recipe.ingredients?.map((ing) => (
                        <li key={ing.productId} className={styles.ingredient}>
                            <button
                                onClick={() => handleFilter('productIds', ing.productId)}
                                className={`lnk ${styles.name}`}
                            >
                                {ing.productName}
                            </button>
                            <span className={styles.amount}>{ing.amount} {ing.measure}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={styles.description}>
                <h2 className={styles.sectionTitle}>{i18n.t('description')}</h2>
                <p>{recipe.description}</p>
            </section>

            <HorizontalScroll title={i18n.t('steps')}>
                {recipe.steps?.map((step) => (
                    <RecipeStep
                        key={step.number}
                        step={step.number}
                        title={step.title}
                        description={step.description}
                        image={step.imageUrl}
                        substeps={step.subSteps ?? []}
                    />
                ))}
            </HorizontalScroll>

            <section className={styles.reviews}>
                <h2 className={styles.sectionTitle}>{i18n.t('reviews')}</h2>
                <textarea
                    placeholder={i18n.t('write-your-review')}
                    className={styles.textarea}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onClick={!isAuthenticated ? () => navigate('/account') : undefined}
                    readOnly={!isAuthenticated}
                />
                <button
                    className={`btn ${styles.submit}`}
                    onClick={handleSendComment}
                    disabled={addingComment || !commentText.trim()}
                >
                    {addingComment ? '...' : i18n.t('send')}
                </button>
                {commentError && (
                    <p className={styles.commentError}>{commentError}</p>
                )}

                <div className={styles.content}>
                    {comments.map((comment, idx) => (
                        <div
                            key={comment.id}
                            className={`${styles.review} ${comment.pending ? styles.reviewPending : ''}`}
                            ref={reviewCallbackRef}
                            style={{ '--delay': `${idx * 0.08}s` }}
                        >
                            <div className={styles.info}>
                                <img src={comment.authorImageUrl} alt={comment.authorNickname} className={styles.avatar} />
                                <a href={`/account/${comment.authorId}`} className={`lnk ${styles.nickname}`}>
                                    @{comment.authorNickname}
                                </a>
                            </div>
                            <p className={styles.text}>{comment.comment}</p>
                        </div>
                    ))}
                </div>

                <div ref={commentSentinelRef} style={{ height: 1 }} />
            </section>
        </div>
    );
}

export default RecipePage;