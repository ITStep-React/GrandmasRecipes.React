import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

export const fetchDifficulties = createAsyncThunk(
    'difficulty/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/difficulties');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addDifficulty = createAsyncThunk(
    'difficulty/add',
    async ({ name, imageUrl = null }, { getState, dispatch, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.post('/difficulties', { name, imageUrl }, token);
            await dispatch(fetchDifficulties());
            return { name, imageUrl };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteDifficulty = createAsyncThunk(
    'difficulty/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/difficulties/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const difficultySlice = createSlice({
    name: 'difficulty',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDifficulties.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDifficulties.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
            .addCase(fetchDifficulties.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(addDifficulty.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteDifficulty.fulfilled, (state, { payload: id }) => { state.items = state.items.filter((d) => d.id !== id); })
            .addCase(deleteDifficulty.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default difficultySlice.reducer;

export const selectDifficulties = (state) => state.difficulty.items;
export const selectDifficultiesLoading = (state) => state.difficulty.loading;
export const selectDifficultyById = (id) => (state) => state.difficulty.items.find((d) => d.id === id) ?? null;