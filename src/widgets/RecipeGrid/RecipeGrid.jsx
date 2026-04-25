import { useEffect, useRef } from 'react';

import RecipeCard from '../RecipeCard/RecipeCard';

import styles from './RecipeGrid.module.scss';

function RecipeGrid({ title, recipes }) {
    const cardRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.cardVisible);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        cardRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, [recipes]);

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.content}>
                {recipes.map((recipe, idx) => (
                    <div
                        key={idx}
                        className={styles.card}
                        ref={(el) => (cardRef.current[idx] = el)}
                        style={{ '--delay': `${idx * 0.08}s` }}
                    >
                        <RecipeCard {...recipe} size='grid' />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default RecipeGrid;