import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_COMMENTS = [
    { id: 1, recipeId: 1, authorId: 2, authorName: 'marco_cooks', authorImageUrl: 'https://i.pravatar.cc/80?img=8', text: 'Absolutely stunning! My whole family loved it.' },
    { id: 2, recipeId: 1, authorId: 3, authorName: 'sakura_eats', authorImageUrl: 'https://i.pravatar.cc/80?img=20', text: 'Easy to follow and the result is incredible.' },
    { id: 3, recipeId: 2, authorId: 1, authorName: 'chefalex', authorImageUrl: 'https://i.pravatar.cc/80?img=5', text: 'Best carbonara I have ever made at home.' },
    { id: 4, recipeId: 1, authorId: 4, authorName: 'brunch_queen', authorImageUrl: 'https://i.pravatar.cc/80?img=32', text: 'Perfetto! The crust came out perfectly crispy.' },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const PAGE_SIZE = 10;

export const fetchComments = createAsyncThunk(
    'comment/fetchByRecipe',
    async ({ recipeId, page = 1 }) => {
        await delay();
        const filtered = MOCK_COMMENTS.filter((c) => c.recipeId === recipeId);
        const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        return { recipeId, items, total: filtered.length, page, pageSize: PAGE_SIZE };
    }
);

export const addComment = createAsyncThunk(
    'comment/add',
    async ({ recipeId, text }, { getState, rejectWithValue }) => {
        const me = getState().auth.user;
        if (!me) return rejectWithValue('Not authenticated');

        await delay();

        const newComment = {
            id: Date.now(),
            recipeId,
            authorId: me.id,
            authorName: me.username,
            authorImageUrl: me.avatarUrl ?? null,
            text,
        };
        MOCK_COMMENTS.push(newComment);
        return newComment;
    }
);

const commentSlice = createSlice({
    name: 'comment',
    initialState: {
        items: [],
        recipeId: null,
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,

        pendingComment: null,

        loading: false,
        adding: false,
        error: null,
    },
    reducers: {
        clearComments(state) {
            state.items = [];
            state.recipeId = null;
            state.total = 0;
            state.page = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchComments.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.recipeId = payload.recipeId;
                state.total = payload.total;
                state.page = payload.page;
                state.items = payload.page === 1
                    ? payload.items
                    : [...state.items, ...payload.items];
            })
            .addCase(fetchComments.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })

            .addCase(addComment.pending, (state, { meta }) => {
                state.adding = true;
                state.pendingComment = {
                    id: `pending-${Date.now()}`,
                    recipeId: meta.arg.recipeId,
                    authorId: null,
                    authorName: '...',
                    text: meta.arg.text,
                    pending: true,
                };
                state.items = [state.pendingComment, ...state.items];
                state.total += 1;
            })
            .addCase(addComment.fulfilled, (state, { payload }) => {
                state.adding = false;
                state.pendingComment = null;
                state.items = state.items.map((c) => c.pending ? payload : c);
            })
            .addCase(addComment.rejected, (state, { error }) => {
                state.adding = false;
                state.items = state.items.filter((c) => !c.pending);
                state.total = Math.max(0, state.total - 1);
                state.pendingComment = null;
                state.error = error.message;
            });
    },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;

export const selectComments = (state) => state.comment.items;
export const selectCommentsTotal = (state) => state.comment.total;
export const selectCommentsPage = (state) => state.comment.page;
export const selectCommentsLoading = (state) => state.comment.loading;
export const selectCommentsAdding = (state) => state.comment.adding;
export const selectCommentsError = (state) => state.comment.error;
export const selectHasMoreComments = (state) => state.comment.items.length < state.comment.total;