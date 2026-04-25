import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';

import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { toggleLike } from '@/features/recipe/recipeSlice';

import styles from './RecipeCard.module.scss';

function RecipeCard({ id, name, authorName, likes = 0, likedByMe = false, imageUrl, size = 'md' }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const handleLike = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isAuthenticated) { navigate('/account'); return; }
        dispatch(toggleLike(id));
    };

    return (
        <Link to={`/recipe/${id}`} className={`${styles.card} ${styles[size]}`}>
            <div className={styles.imageWrap}>
                {imageUrl
                    ? <img src={imageUrl} alt={name} className={styles.image} />
                    : <div className={styles.placeholder} />
                }
                <button
                    className={`${styles.like} ${likedByMe ? styles.likeActive : ''}`}
                    onClick={handleLike}
                >
                    <svg viewBox='0 0 24 24' width={24} height={24}>
                        <path
                            d='M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2Z'
                            fill={likedByMe ? 'currentColor' : 'none'}
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                    <span>{likes}</span>
                </button>
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>{name ?? 'Unnamed Recipe'}</h3>
                <span className={styles.author}>@{authorName ?? 'chef'}</span>
            </div>
        </Link>
    );
}

export default RecipeCard;