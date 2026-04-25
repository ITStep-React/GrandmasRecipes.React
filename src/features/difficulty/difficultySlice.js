import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_DIFFICULTIES = [
    { id: 1, name: 'Easy', imageUrl: null },
    { id: 2, name: 'Medium', imageUrl: null },
    { id: 3, name: 'Hard', imageUrl: null },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const fetchDifficulties = createAsyncThunk('difficulty/fetchAll', async () => {
    await delay();
    return [...MOCK_DIFFICULTIES];
});

export const addDifficulty = createAsyncThunk(
    'difficulty/add',
    async ({ name, imageUrl = null }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        if (MOCK_DIFFICULTIES.find((d) => d.name.toLowerCase() === name.toLowerCase()))
            return rejectWithValue('Difficulty already exists');
        await delay();
        const item = { id: Date.now(), name, imageUrl };
        MOCK_DIFFICULTIES.push(item);
        return item;
    }
);

export const updateDifficulty = createAsyncThunk(
    'difficulty/update',
    async ({ id, name, imageUrl }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_DIFFICULTIES.findIndex((d) => d.id === id);
        if (idx === -1) return rejectWithValue('Difficulty not found');
        await delay();
        MOCK_DIFFICULTIES[idx] = {
            ...MOCK_DIFFICULTIES[idx],
            ...(name !== undefined && { name }),
            ...(imageUrl !== undefined && { imageUrl }),
        };
        return MOCK_DIFFICULTIES[idx];
    }
);

export const deleteDifficulty = createAsyncThunk(
    'difficulty/delete',
    async (id, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_DIFFICULTIES.findIndex((d) => d.id === id);
        if (idx === -1) return rejectWithValue('Difficulty not found');
        await delay();
        MOCK_DIFFICULTIES.splice(idx, 1);
        return id;
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
            .addCase(fetchDifficulties.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })

            .addCase(addDifficulty.fulfilled, (state, { payload }) => { state.items.push(payload); })
            .addCase(addDifficulty.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(updateDifficulty.fulfilled, (state, { payload }) => {
                const idx = state.items.findIndex((d) => d.id === payload.id);
                if (idx !== -1) state.items[idx] = payload;
            })
            .addCase(updateDifficulty.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteDifficulty.fulfilled, (state, { payload: id }) => {
                state.items = state.items.filter((d) => d.id !== id);
            })
            .addCase(deleteDifficulty.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default difficultySlice.reducer;

export const selectDifficulties = (state) => state.difficulty.items;
export const selectDifficultiesLoading = (state) => state.difficulty.loading;
export const selectDifficultyById = (id) => (state) => state.difficulty.items.find((d) => d.id === id) ?? null;
