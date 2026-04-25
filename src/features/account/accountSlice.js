import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const MOCK_ACCOUNTS = {
    chefalex: {
        id: 1,
        username: 'chefalex',
        email: 'chefalex@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/80?img=5',
        published: 20,
        likes: 100,
    },
    marco_cooks: {
        id: 2,
        username: 'marco_cooks',
        email: 'marco@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/80?img=8',
        published: 8,
        likes: 540,
    },
    sakura_eats: {
        id: 3,
        username: 'sakura_eats',
        email: 'sakura@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/80?img=20',
        published: 15,
        likes: 320,
    },
};

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const fetchMe = createAsyncThunk(
    'account/fetchMe',
    async (_, { getState, rejectWithValue }) => {
        await delay();
        const username = getState().auth.username;
        if (!username) return rejectWithValue('Not authenticated');
        return MOCK_ACCOUNTS[username] ?? null;
    }
);

export const fetchAccountByUsername = createAsyncThunk(
    'account/fetchByUsername',
    async (username, { getState }) => {
        const cached = getState().account.profiles[username];
        if (cached) return cached;
        await delay();
        return MOCK_ACCOUNTS[username] ?? null;
    }
);

const accountSlice = createSlice({
    name: 'account',
    initialState: {
        me: null,
        profiles: {},
        loadingMe: false,
        loadingProfile: false,
        error: null,
    },
    reducers: {
        clearMe(state) {
            state.me = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMe.pending, (state) => {
                state.loadingMe = true;
                state.error = null;
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.loadingMe = false;
                state.me = action.payload;
            })
            .addCase(fetchMe.rejected, (state, action) => {
                state.loadingMe = false;
                state.error = action.payload ?? action.error.message;
            })
            .addCase(fetchAccountByUsername.pending, (state) => {
                state.loadingProfile = true;
                state.error = null;
            })
            .addCase(fetchAccountByUsername.fulfilled, (state, action) => {
                state.loadingProfile = false;
                if (action.payload) {
                    state.profiles[action.payload.username] = action.payload;
                }
            })
            .addCase(fetchAccountByUsername.rejected, (state, action) => {
                state.loadingProfile = false;
                state.error = action.error.message;
            });
    },
});

export const { clearMe } = accountSlice.actions;
export default accountSlice.reducer;

export const selectMe = (state) => state.account.me;
export const selectProfileByUsername = (username) => (state) => state.account.profiles[username];
export const selectAccountLoadingMe = (state) => state.account.loadingMe;
export const selectAccountLoadingProfile = (state) => state.account.loadingProfile;
