import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

export const fetchCategories = createAsyncThunk(
    'category/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/categories');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addCategory = createAsyncThunk(
    'category/add',
    async ({ name, imageUrl = null }, { getState, dispatch, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.post('/categories', { name, imageUrl }, token);
            await dispatch(fetchCategories());
            return { name, imageUrl };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'category/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/categories/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
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
            .addCase(fetchCategories.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(addCategory.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteCategory.fulfilled, (state, { payload: id }) => { state.items = state.items.filter((c) => c.id !== id); })
            .addCase(deleteCategory.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default categorySlice.reducer;

export const selectCategories = (state) => state.category.items;
export const selectCategoriesLoading = (state) => state.category.loading;
export const selectCategoryById = (id) => (state) => state.category.items.find((c) => c.id === id) ?? null;