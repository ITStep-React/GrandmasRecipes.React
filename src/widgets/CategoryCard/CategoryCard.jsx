import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';

import { setFilter } from '@/features/searchSlice';

import styles from './CategoryCard.module.scss';

function CategoryCard({ id, name, imageUrl }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleFilter = (id) => {
        dispatch(setFilter({ groupKey: 'categoryIds', id }));
        navigate('/search');
    }

    return (
        <button className={styles.card} onClick={() => handleFilter(id)}>
            <div className={styles.imageWrap}>
                {imageUrl ?

                    (
                        <img src={imageUrl} alt={name} className={styles.image} />
                    ) :
                    (
                        <div className={styles.placeholder} />
                    )}
            </div>
            <span className={styles.label}>{name ?? 'Category'}</span>
        </button>
    );
}

export default CategoryCard;
