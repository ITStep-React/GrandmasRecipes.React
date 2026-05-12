import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

const PAGE_SIZE = 10;

export const fetchComments = createAsyncThunk(
    'comment/fetchByRecipe',
    async ({ recipeId, page = 0 }, { rejectWithValue }) => {
        try {
            const data = await api.get(`/reviews/recipe/${recipeId}?page=${page}`);
            return {
                recipeId,
                items: data.items ?? [],
                total: data.totalCount ?? 0,
                page: data.pageNumber ?? page,
                pageSize: data.pageSize ?? PAGE_SIZE,
            };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addComment = createAsyncThunk(
    'comment/add',
    async ({ recipeId, comment }, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            const authorId = getState().auth.user?.id;
            await api.post(`/reviews/recipe/${recipeId}`, { recipeId, authorId, comment }, token);
            return {
                id: Date.now(),
                recipeId,
                authorId,
                authorNickname: getState().auth.user?.nickname,
                authorImageUrl: null,
                comment,
            };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const commentSlice = createSlice({
    name: 'comment',
    initialState: {
        items: [],
        recipeId: null,
        total: 0,
        page: 0,
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
            state.page = 0;
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
                state.pageSize = payload.pageSize;
                state.items = payload.page === 0 ? payload.items : [...state.items, ...payload.items];
            })
            .addCase(fetchComments.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(addComment.pending, (state, { meta }) => {
                state.adding = true;
                state.pendingComment = {
                    id: `pending-${Date.now()}`,
                    recipeId: meta.arg.recipeId,
                    authorId: null,
                    authorNickname: '...',
                    authorImageUrl: null,
                    comment: meta.arg.comment,
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
            .addCase(addComment.rejected, (state, { payload, error }) => {
                state.adding = false;
                state.items = state.items.filter((c) => !c.pending);
                state.total = Math.max(0, state.total - 1);
                state.pendingComment = null;
                state.error = payload ?? error.message;
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