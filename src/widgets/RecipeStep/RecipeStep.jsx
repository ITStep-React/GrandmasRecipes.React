import { useTranslation } from 'react-i18next';

import styles from './RecipeStep.module.scss';

function RecipeStep({ next, step, title, substeps, description, image }) {
    const { i18n } = useTranslation()

    return (
        <div className={styles.card}>
            {image && (
                <div className={styles.imageContainer}>
                    <img
                        src={image}
                        alt={title}
                        className={styles.image}
                    />
                </div>
            )}

            <div className={styles.content}>
                <span className={styles.step}>{i18n.t('step')} {step}</span>
                <span className={styles.title}>{title}</span>
                {substeps?.length > 0 && (
                    <ul className={styles.substeps}>
                        {substeps.map((substep, index) => (
                            <li key={index} className={styles.substep}>{substep}</li>
                        ))}
                    </ul>
                )}
                <span className={styles.desc}>{description}</span>
                <button className={`btn ${styles.next}`} onClick={next}>
                    {i18n.t('next')} ▶
                </button>
            </div>
        </div >
    );
}

export default RecipeStep;