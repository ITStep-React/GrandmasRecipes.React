import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

export const fetchCuisines = createAsyncThunk(
    'cuisine/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/cuisines');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addCuisine = createAsyncThunk(
    'cuisine/add',
    async ({ name, imageUrl = null }, { getState, dispatch, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.post('/cuisines', { name, imageUrl }, token);
            await dispatch(fetchCuisines());
            return { name, imageUrl };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteCuisine = createAsyncThunk(
    'cuisine/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/cuisines/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const cuisineSlice = createSlice({
    name: 'cuisine',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCuisines.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCuisines.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
            .addCase(fetchCuisines.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(addCuisine.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteCuisine.fulfilled, (state, { payload: id }) => { state.items = state.items.filter((c) => c.id !== id); })
            .addCase(deleteCuisine.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default cuisineSlice.reducer;

export const selectCuisines = (state) => state.cuisine.items;
export const selectCuisinesLoading = (state) => state.cuisine.loading;
export const selectCuisineById = (id) => (state) => state.cuisine.items.find((c) => c.id === id) ?? null;