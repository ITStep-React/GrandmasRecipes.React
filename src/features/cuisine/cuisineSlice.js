import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_CUISINES = [
    { id: 1, name: 'Italian', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
    { id: 2, name: 'Japanese', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80' },
    { id: 3, name: 'American', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
    { id: 4, name: 'French', imageUrl: null },
    { id: 5, name: 'Indian', imageUrl: null },
    { id: 6, name: 'Mexican', imageUrl: null },
    { id: 7, name: 'Chinese', imageUrl: null },
    { id: 8, name: 'Thai', imageUrl: null },
    { id: 9, name: 'Greek', imageUrl: null },
    { id: 10, name: 'Spanish', imageUrl: null },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const fetchCuisines = createAsyncThunk('cuisine/fetchAll', async () => {
    await delay();
    return [...MOCK_CUISINES];
});

export const addCuisine = createAsyncThunk(
    'cuisine/add',
    async ({ name, imageUrl = null }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        if (MOCK_CUISINES.find((c) => c.name.toLowerCase() === name.toLowerCase()))
            return rejectWithValue('Cuisine already exists');
        await delay();
        const item = { id: Date.now(), name, imageUrl };
        MOCK_CUISINES.push(item);
        return item;
    }
);

export const updateCuisine = createAsyncThunk(
    'cuisine/update',
    async ({ id, name, imageUrl }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_CUISINES.findIndex((c) => c.id === id);
        if (idx === -1) return rejectWithValue('Cuisine not found');
        await delay();
        MOCK_CUISINES[idx] = {
            ...MOCK_CUISINES[idx],
            ...(name !== undefined && { name }),
            ...(imageUrl !== undefined && { imageUrl }),
        };
        return MOCK_CUISINES[idx];
    }
);

export const deleteCuisine = createAsyncThunk(
    'cuisine/delete',
    async (id, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_CUISINES.findIndex((c) => c.id === id);
        if (idx === -1) return rejectWithValue('Cuisine not found');
        await delay();
        MOCK_CUISINES.splice(idx, 1);
        return id;
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
            .addCase(fetchCuisines.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })

            .addCase(addCuisine.fulfilled, (state, { payload }) => { state.items.push(payload); })
            .addCase(addCuisine.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(updateCuisine.fulfilled, (state, { payload }) => {
                const idx = state.items.findIndex((c) => c.id === payload.id);
                if (idx !== -1) state.items[idx] = payload;
            })
            .addCase(updateCuisine.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteCuisine.fulfilled, (state, { payload: id }) => {
                state.items = state.items.filter((c) => c.id !== id);
            })
            .addCase(deleteCuisine.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default cuisineSlice.reducer;

export const selectCuisines = (state) => state.cuisine.items;
export const selectCuisinesLoading = (state) => state.cuisine.loading;
export const selectCuisineById = (id) => (state) => state.cuisine.items.find((c) => c.id === id) ?? null;
