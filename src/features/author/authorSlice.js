import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_AUTHORS = {
    1: { id: 1, name: 'chefalex', imageUrl: 'https://i.pravatar.cc/80?img=5', likes: 100, published: 20 },
    2: { id: 2, name: 'marco_cooks', imageUrl: 'https://i.pravatar.cc/80?img=8', likes: 540, published: 8 },
    3: { id: 3, name: 'sakura_eats', imageUrl: 'https://i.pravatar.cc/80?img=20', likes: 320, published: 15 },
    4: { id: 4, name: 'brunch_queen', imageUrl: 'https://i.pravatar.cc/80?img=32', likes: 87, published: 4 },
};

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const fetchAuthorById = createAsyncThunk(
    'author/fetchById',
    async (id, { getState }) => {
        const cached = getState().author.byId[id];
        if (cached) return cached;
        await delay();
        return MOCK_AUTHORS[id] ?? null;
    }
);

export const updateAuthorProfile = createAsyncThunk(
    'author/updateProfile',
    async ({ name, imageUrl }, { getState, rejectWithValue }) => {
        await delay();
        const myId = getState().auth.user?.id;
        if (!myId) return rejectWithValue('Not authenticated');

        if (name && Object.values(MOCK_AUTHORS).some((a) => a.name === name && a.id !== myId))
            return rejectWithValue('Username already taken');

        const existing = MOCK_AUTHORS[myId] ?? { id: myId, likes: 0, published: 0 };
        const updated = {
            ...existing,
            ...(name !== undefined && { name }),
            ...(imageUrl !== undefined && { imageUrl }),
        };
        MOCK_AUTHORS[myId] = updated;
        return updated;
    }
);

export const uploadAuthorAvatar = createAsyncThunk(
    'author/uploadAvatar',
    async (file) => {
        await delay(800);
        return { url: URL.createObjectURL(file) };
    }
);

const authorSlice = createSlice({
    name: 'author',
    initialState: {
        byId: {},
        uploadingAvatar: false,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuthorById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAuthorById.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (payload) state.byId[payload.id] = payload;
            })
            .addCase(fetchAuthorById.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })

            .addCase(updateAuthorProfile.fulfilled, (state, { payload }) => {
                state.byId[payload.id] = payload;
            })
            .addCase(updateAuthorProfile.rejected, (state, { payload, error }) => {
                state.error = payload ?? error.message;
            })

            .addCase(uploadAuthorAvatar.pending, (state) => { state.uploadingAvatar = true; })
            .addCase(uploadAuthorAvatar.fulfilled, (state) => { state.uploadingAvatar = false; })
            .addCase(uploadAuthorAvatar.rejected, (state) => { state.uploadingAvatar = false; });
    },
});

export default authorSlice.reducer;

export const selectAuthorById = (id) => (state) => state.author.byId[id] ?? null;
export const selectAuthorLoading = (state) => state.author.loading;
export const selectAuthorUploadAvatar = (state) => state.author.uploadingAvatar;
