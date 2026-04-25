import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './StepCard.module.scss';


function StepCard({ step, onUpdate, onRemove, onImageUpload, onAddSubstep, onUpdateSubstep, onRemoveSubstep }) {
    const { i18n } = useTranslation();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(step.id, file);
            e.target.value = '';
        }
    };

    return (
        <div className={styles.stepCard}>

            <div className={styles.imageContainer}>
                {step.imagePreview ? (
                    <>
                        <img
                            src={step.imagePreview}
                            alt={`step_${step.number}`}
                            className={styles.image}
                        />
                        <label className={styles.imageOverlayBtn}>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleFileChange}
                                hidden
                            />
                        </label>
                    </>
                ) : (
                    <label className={styles.imagePlaceholder}>
                        <span className={styles.imageIcon}>
                            <svg viewBox='0 0 24 24' width={24} height={24} color={'currentColor'} fill={'none'}>
                                <path d='M22.0002 8.99998V15C22.0002 17.8284 22.0002 19.2426 21.1215 20.1213C20.2428 21 18.8286 21 16.0002 21H8.00018C5.17176 21 3.75754 21 2.87886 20.1213C2.00018 19.2426 2.00018 17.8284 2.00018 15V11.0537C2.00018 10.0736 2.00018 9.58356 2.1136 9.18288C2.39734 8.18054 3.18074 7.39714 4.18307 7.11341C4.58376 6.99998 5.07379 6.99998 6.05387 6.99998C6.41985 6.99998 6.60284 6.99998 6.77329 6.97027C7.19563 6.89665 7.58313 6.68926 7.87867 6.37869C7.99794 6.25335 8.29718 5.8045 8.50018 5.49998C8.89656 4.90543 9.09474 4.60815 9.36568 4.40365C9.53113 4.27877 9.71499 4.18038 9.91067 4.11198C10.2311 3.99998 10.5884 3.99998 11.303 3.99998H13.0002' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                                <path d='M16.0002 13.5C16.0002 15.7091 14.2093 17.5 12.0002 17.5C9.79104 17.5 8.00018 15.7091 8.00018 13.5C8.00018 11.2908 9.79104 9.49998 12.0002 9.49998C14.2093 9.49998 16.0002 11.2908 16.0002 13.5Z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                                <path d='M16.0002 5.49998H21.0002M18.5002 7.99998V2.99998' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'></path>
                            </svg>
                        </span>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handleFileChange}
                            hidden
                        />
                    </label>
                )}

                <span className={styles.stepNumber}>{step.number}</span>

                <button
                    type='button'
                    className={styles.removeBtn}
                    onClick={() => onRemove(step.id)}
                >
                    ╳
                </button>
            </div>

            <div className={styles.content}>
                <input
                    value={step.title}
                    onChange={(e) => onUpdate(step.id, 'title', e.target.value)}
                    className={styles.titleInput}
                    placeholder={i18n.t('title')}
                />

                <div className={styles.substeps}>
                    <div className={styles.substepsHeader}>
                        <span>{i18n.t('substeps')}</span>
                        <button
                            type='button'
                            onClick={() => onAddSubstep(step.id)}
                            className={`btn ${styles.addSubBtn}`}
                        >
                            🞢 {i18n.t('add')}
                        </button>
                    </div>

                    {step.substeps.map((sub, i) => (
                        <div key={i} className={styles.substepRow}>
                            <input
                                value={sub}
                                onChange={(e) => onUpdateSubstep(step.id, i, e.target.value)}
                                placeholder={i18n.t('substep')}
                                className={styles.substepInput}
                            />
                            <button
                                type='button'
                                className={styles.substepRemoveBtn}
                                onClick={() => onRemoveSubstep(step.id, i)}
                                aria-label='Удалить подшаг'
                            >
                                ╳
                            </button>
                        </div>
                    ))}
                </div>

                <textarea
                    value={step.description}
                    onChange={(e) => onUpdate(step.id, 'description', e.target.value)}
                    placeholder={i18n.t('description')}
                    rows={3}
                    className={styles.descriptionInput}
                />


            </div>
        </div>
    );
}

export default StepCard;