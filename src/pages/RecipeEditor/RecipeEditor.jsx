import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import ImageUploader from '@/widgets/ImageUploader/ImageUploader.jsx';
import StepCard from '@/widgets/StepCard/StepCard.jsx';

import { createRecipe } from '@/features/recipeSlice';
import { selectIsAuthenticated, selectMyId } from '@/features/authSlice';
import { fetchCuisines, selectCuisines } from '@/features/cuisineSlice';
import { fetchDifficulties, selectDifficulties } from '@/features/difficultySlice';
import { fetchCategories, selectCategories } from '@/features/categorySlice';
import { fetchProducts, fetchUnits, selectProducts, selectUnits } from '@/features/productSlice';

import { uploadToCloud, uploadManyToCloud } from '@/shared/lib/cloudUpload.js';

import styles from './RecipeEditor.module.scss';

function RecipeEditor() {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isAuth = useSelector(selectIsAuthenticated);
    const myId = useSelector(selectMyId);

    const cuisines = useSelector(selectCuisines);
    const difficulties = useSelector(selectDifficulties);
    const categories = useSelector(selectCategories);
    const products = useSelector(selectProducts);
    const units = useSelector(selectUnits);

    useEffect(() => {
        if (!isAuth) navigate('/account', { replace: true });
    }, [isAuth, navigate]);

    useEffect(() => {
        dispatch(fetchCuisines());
        dispatch(fetchDifficulties());
        dispatch(fetchCategories());
        dispatch(fetchProducts());
        dispatch(fetchUnits());
    }, [dispatch]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState(0);

    const [cuisine, setCuisine] = useState(null);
    const [difficulty, setDifficulty] = useState(null);

    const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());

    const [ingredients, setIngredients] = useState([]);

    const [recipeImages, setRecipeImages] = useState([]);
    const [saving, setSaving] = useState(false);

    const [steps, setSteps] = useState([{
        id: 1, number: 1,
        title: '', description: '',
        imagePreview: null, imageFile: null,
        substeps: [],
    }]);

    useEffect(() => {
        if (cuisines.length && !cuisine) setCuisine(cuisines[0]);
    }, [cuisines]);

    useEffect(() => {
        if (difficulties.length && !difficulty) setDifficulty(difficulties[0]);
    }, [difficulties]);

    useEffect(() => {
        return () => {
            recipeImages.forEach((img) => URL.revokeObjectURL(img.preview));
            steps.forEach((step) => { if (step.imagePreview) URL.revokeObjectURL(step.imagePreview); });
        };
    }, []);

    if (!isAuth) return null;

    const toggleCategory = (categoryId) =>
        setSelectedCategoryIds((prev) => {
            const next = new Set(prev);
            next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
            return next;
        });

    const addIngredient = () => {
        if (!products.length) return;
        const firstProduct = products[0];
        const firstUnit = units[0] ?? null;
        setIngredients((prev) => [
            ...prev,
            {
                id: Date.now(),
                productId: firstProduct.id,
                measureId: firstUnit?.id ?? null,
                amount: 100,
            },
        ]);
    };

    const removeIngredient = (rowId) =>
        setIngredients((prev) => prev.filter((ing) => ing.id !== rowId));

    const updateIngredient = (rowId, field, value) =>
        setIngredients((prev) =>
            prev.map((ing) => {
                if (ing.id !== rowId) return ing;
                if (field === 'productId' || field === 'measureId') {
                    return { ...ing, [field]: Number(value) };
                }
                return { ...ing, [field]: value };
            })
        );

    const addStep = () =>
        setSteps((prev) => [
            ...prev,
            { id: Date.now(), number: prev.length + 1, title: '', description: '', imagePreview: null, imageFile: null, substeps: [] },
        ]);

    const removeStep = (id) =>
        setSteps((prev) => {
            const step = prev.find((s) => s.id === id);
            if (step?.imagePreview) URL.revokeObjectURL(step.imagePreview);
            return prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 }));
        });

    const updateStep = (id, field, value) =>
        setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

    const handleStepImageUpload = (stepId, file) =>
        setSteps((prev) =>
            prev.map((step) => {
                if (step.id !== stepId) return step;
                if (step.imagePreview) URL.revokeObjectURL(step.imagePreview);
                return { ...step, imageFile: file, imagePreview: URL.createObjectURL(file) };
            })
        );

    const addSubstep = (stepId) =>
        setSteps((prev) =>
            prev.map((s) => s.id === stepId ? { ...s, substeps: [...s.substeps, ''] } : s)
        );

    const updateSubstep = (stepId, index, value) =>
        setSteps((prev) =>
            prev.map((s) =>
                s.id === stepId
                    ? { ...s, substeps: s.substeps.map((sub, i) => (i === index ? value : sub)) }
                    : s
            )
        );

    const removeSubstep = (stepId, index) =>
        setSteps((prev) =>
            prev.map((s) =>
                s.id === stepId
                    ? { ...s, substeps: s.substeps.filter((_, i) => i !== index) }
                    : s
            )
        );

    const handleSave = async () => {
        if (!title.trim() || !cuisine || !difficulty || !myId) return;

        setSaving(true);
        try {
            let imageUrls = [];
            if (recipeImages.length > 0) {
                const files = recipeImages.map((img) => img.file);
                imageUrls = await uploadManyToCloud(files);
            }

            const stepsWithUrls = await Promise.all(
                steps.map(async (step) => {
                    let imageUrl = null;
                    if (step.imageFile) {
                        imageUrl = await uploadToCloud(step.imageFile);
                    }
                    return {
                        number: step.number,
                        title: step.title,
                        description: step.description,
                        imageUrl,
                        subSteps: step.substeps,
                    };
                })
            );

            const formattedIngredients = ingredients.map((ing) => ({
                productId: ing.productId,
                measureId: ing.measureId,
                amount: ing.amount,
            }));

            const created = await dispatch(createRecipe({
                title,
                description,
                calories,
                authorId: myId,
                cuisineId: cuisine.id,
                difficultyId: difficulty.id,
                categoryIds: [...selectedCategoryIds],
                ingredients: formattedIngredients,
                steps: stepsWithUrls,
                imageUrls,
            })).unwrap();

            if (created?.id) navigate(`/recipe/${created.id}`);
            else navigate('/');
        } catch (err) { } finally {
            setSaving(false);
        }
    };

    const isBusy = saving;

    const getProductName = (productId) => products.find((p) => p.id === productId)?.name ?? '';
    const getMeasureName = (measureId) => units.find((u) => u.id === measureId)?.name ?? '';

    return (
        <div className={styles.editor}>

            <ImageUploader images={recipeImages} onChange={setRecipeImages} />

            <input
                type='text'
                placeholder={i18n.t('title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.titleInput}
            />

            <textarea
                placeholder={i18n.t('description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={styles.descriptionTextarea}
            />

            <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                    <label className={styles.metaLabel}>{i18n.t('calories')}</label>
                    <input
                        type='number'
                        min={0}
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value) || 0)}
                        className={styles.metaInput}
                    />
                </div>

                <div className={styles.metaItem}>
                    <label className={styles.metaLabel}>{i18n.t('cuisine')}</label>
                    <select
                        value={cuisine?.id ?? ''}
                        onChange={(e) => setCuisine(cuisines.find((c) => c.id === Number(e.target.value)))}
                        className={styles.metaSelect}
                    >
                        {cuisines.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.metaItem}>
                    <label className={styles.metaLabel}>{i18n.t('difficulty')}</label>
                    <select
                        value={difficulty?.id ?? ''}
                        onChange={(e) => setDifficulty(difficulties.find((d) => d.id === Number(e.target.value)))}
                        className={styles.metaSelect}
                    >
                        {difficulties.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{i18n.t('categories')}</h2>
                <div className={styles.categories}>
                    {categories.map((cat) => {
                        const active = selectedCategoryIds.has(cat.id);
                        return (
                            <button
                                key={cat.id}
                                type='button'
                                className={`${styles.categoryChip} ${active ? styles.categoryChipActive : ''}`}
                                onClick={() => toggleCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{i18n.t('ingredients')}</h2>
                    <button type='button' onClick={addIngredient} className={`btn ${styles.addIngredientBtn}`}>
                        🞢 {i18n.t('add')}
                    </button>
                </div>
                <div className={styles.ingredientsContent}>
                    {ingredients.map((ing) => (
                        <div key={ing.id} className={styles.ingredientRow}>
                            <select
                                value={ing.productId}
                                onChange={(e) => updateIngredient(ing.id, 'productId', e.target.value)}
                                className={styles.ingredientSelect}
                            >
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input
                                type='number'
                                min={0}
                                value={ing.amount}
                                onChange={(e) => updateIngredient(ing.id, 'amount', Number(e.target.value) || 0)}
                                className={styles.quantityInput}
                            />
                            <select
                                value={ing.measureId ?? ''}
                                onChange={(e) => updateIngredient(ing.id, 'measureId', e.target.value)}
                                className={styles.unitSelect}
                            >
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <button type='button' className={styles.removeBtn} onClick={() => removeIngredient(ing.id)}>
                                ╳
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>{i18n.t('steps')}</h2>
                    <button type='button' onClick={addStep} className={`btn ${styles.addStepBtn}`}>
                        🞢 {i18n.t('add')}
                    </button>
                </div>
                <div className={styles.stepsScroll}>
                    {steps.map((step) => (
                        <StepCard
                            key={step.id}
                            step={step}
                            onUpdate={updateStep}
                            onRemove={removeStep}
                            onImageUpload={handleStepImageUpload}
                            onAddSubstep={addSubstep}
                            onUpdateSubstep={updateSubstep}
                            onRemoveSubstep={removeSubstep}
                        />
                    ))}
                </div>
            </div>

            <button
                type='button'
                onClick={handleSave}
                disabled={isBusy || !title.trim()}
                className='btn'
            >
                {i18n.t('save')}
            </button>
        </div>
    );
}

export default RecipeEditor;