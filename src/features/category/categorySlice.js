import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_CATEGORIES = [
    { id: 1, name: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80' },
    { id: 2, name: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&q=80' },
    { id: 3, name: 'Desserts', imageUrl: null },
    { id: 4, name: 'Vegan', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
    { id: 5, name: 'Pasta', imageUrl: null },
    { id: 6, name: 'Main Course', imageUrl: null },
    { id: 7, name: 'Asian', imageUrl: null },
    { id: 8, name: 'Healthy', imageUrl: null },
    { id: 9, name: 'Soup', imageUrl: null },
    { id: 10, name: 'Salad', imageUrl: null },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const fetchCategories = createAsyncThunk('category/fetchAll', async () => {
    await delay();
    return [...MOCK_CATEGORIES];
});

export const addCategory = createAsyncThunk(
    'category/add',
    async ({ name, imageUrl = null }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        if (MOCK_CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase()))
            return rejectWithValue('Category already exists');
        await delay();
        const item = { id: Date.now(), name, imageUrl };
        MOCK_CATEGORIES.push(item);
        return item;
    }
);

export const updateCategory = createAsyncThunk(
    'category/update',
    async ({ id, name, imageUrl }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
        if (idx === -1) return rejectWithValue('Category not found');
        await delay();
        MOCK_CATEGORIES[idx] = {
            ...MOCK_CATEGORIES[idx],
            ...(name !== undefined && { name }),
            ...(imageUrl !== undefined && { imageUrl }),
        };
        return MOCK_CATEGORIES[idx];
    }
);

export const deleteCategory = createAsyncThunk(
    'category/delete',
    async (id, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
        if (idx === -1) return rejectWithValue('Category not found');
        await delay();
        MOCK_CATEGORIES.splice(idx, 1);
        return id;
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
            .addCase(fetchCategories.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })

            .addCase(addCategory.fulfilled, (state, { payload }) => { state.items.push(payload); })
            .addCase(addCategory.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(updateCategory.fulfilled, (state, { payload }) => {
                const idx = state.items.findIndex((c) => c.id === payload.id);
                if (idx !== -1) state.items[idx] = payload;
            })
            .addCase(updateCategory.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteCategory.fulfilled, (state, { payload: id }) => {
                state.items = state.items.filter((c) => c.id !== id);
            })
            .addCase(deleteCategory.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default categorySlice.reducer;

export const selectCategories = (state) => state.category.items;
export const selectCategoriesLoading = (state) => state.category.loading;
export const selectCategoryById = (id) => (state) => state.category.items.find((c) => c.id === id) ?? null;
