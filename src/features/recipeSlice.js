import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';
import { getCookie, setCookie } from '@/shared/lib/cookie.js';

const RECENTLY_VIEWED_COOKIE = 'recently_viewed_recipes';
const RECENTLY_VIEWED_MAX = 20;
const PAGE_SIZE = 10;

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readRecentIds() {
    try {
        const raw = getCookie(RECENTLY_VIEWED_COOKIE);
        const ids = raw ? JSON.parse(raw) : [];
        return ids.filter((id) => GUID_REGEX.test(id));
    } catch { return []; }
}

function pushRecentId(id) {
    if (!id) return;
    const ids = readRecentIds().filter((x) => x !== id);
    const next = [id, ...ids].slice(0, RECENTLY_VIEWED_MAX);
    setCookie(RECENTLY_VIEWED_COOKIE, JSON.stringify(next));
    return next;
}

export const fetchRecipeById = createAsyncThunk(
    'recipe/fetchById',
    async ({ id, userId = null }, { rejectWithValue }) => {
        try {
            const query = userId ? `?userId=${userId}` : '';
            return await api.get(`/recipes/${id}${query}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchRecipes = createAsyncThunk(
    'recipe/fetchList',
    async (
        { page = 0, userId = null, query = '', categoryIds, cuisineIds, difficultyIds, productIds } = {},
        { rejectWithValue }
    ) => {
        try {
            const hasFilters =
                query?.trim() ||
                categoryIds?.length ||
                cuisineIds?.length ||
                difficultyIds?.length ||
                productIds?.length;

            if (hasFilters) {
                // Always use /filter when there's a search query or any filter active
                const params = new URLSearchParams({ page: String(page) });
                if (userId) params.append('userId', userId);
                if (query?.trim()) params.append('filter.searchQuery', query.trim());
                if (categoryIds?.length) categoryIds.forEach((id) => params.append('filter.categoryIds', id));
                if (cuisineIds?.length) cuisineIds.forEach((id) => params.append('filter.cuisineIds', id));
                if (difficultyIds?.length) difficultyIds.forEach((id) => params.append('filter.difficultyIds', id));
                if (productIds?.length) productIds.forEach((id) => params.append('filter.productIds', id));
                return await api.get(`/recipes/filter?${params}`);
            }

            const params = new URLSearchParams({ page: String(page) });
            if (userId) params.append('userId', userId);
            return await api.get(`/recipes?${params}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchLatestRecipes = createAsyncThunk(
    'recipe/fetchLatest',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/recipes?page=0');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchRecipesByAuthor = createAsyncThunk(
    'recipe/fetchByAuthor',
    async ({ authorId, page = 0, userId = null }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (userId) params.append('userId', userId);
            return await api.get(`/recipes/author/${authorId}?${params}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchLikedRecipes = createAsyncThunk(
    'recipe/fetchLiked',
    async ({ userId, page = 0 }, { rejectWithValue }) => {
        try {
            return await api.get(`/recipes/liked/${userId}?page=${page}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchRecentlyViewed = createAsyncThunk(
    'recipe/fetchRecentlyViewed',
    async (_, { rejectWithValue }) => {
        try {
            const ids = readRecentIds();
            if (!ids.length) return [];
            const results = await Promise.all(ids.map((id) => api.get(`/recipes/${id}`).catch(() => null)));
            return results.filter(Boolean);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const createRecipe = createAsyncThunk(
    'recipe/create',
    async (dto, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            return await api.post('/recipes', dto, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateRecipe = createAsyncThunk(
    'recipe/update',
    async (dto, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.put('/recipes', dto, token);
            return dto;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteRecipe = createAsyncThunk(
    'recipe/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/recipes/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const toggleLike = createAsyncThunk(
    'recipe/toggleLike',
    async ({ recipeId, accountId, isLiked }, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            if (isLiked) {
                await api.delete(`/recipes/${recipeId}/likes/${accountId}`, token);
            } else {
                await api.post(`/recipes/${recipeId}/likes/${accountId}`, {}, token);
            }
            return { recipeId, wasLiked: isLiked };
        } catch (e) {
            return rejectWithValue({ recipeId, wasLiked: isLiked, message: e.message });
        }
    }
);

const applyLikeState = (item, liked) => {
    if (!item) return;
    if (item.isLiked === liked) return;
    item.isLiked = liked;
    item.likes = Math.max(0, (item.likes ?? 0) + (liked ? 1 : -1));
};

const recipeSlice = createSlice({
    name: 'recipe',
    initialState: {
        current: null,
        loadingCurrent: false,

        list: [],
        total: 0,
        page: 0,
        pageSize: PAGE_SIZE,
        loadingList: false,

        latestRecipes: [],
        loadingLatest: false,

        recentlyViewed: [],
        loadingRecent: false,

        likedList: [],
        likedTotal: 0,
        likedPage: 0,
        likedPageSize: PAGE_SIZE,
        loadingLiked: false,

        error: null,
    },
    reducers: {
        clearCurrentRecipe(state) { state.current = null; },
        clearRecipeList(state) { state.list = []; state.total = 0; state.page = 0; },
        clearLikedList(state) { state.likedList = []; state.likedTotal = 0; state.likedPage = 0; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecipeById.pending, (state) => { state.loadingCurrent = true; state.current = null; state.error = null; })
            .addCase(fetchRecipeById.fulfilled, (state, { payload }) => {
                state.loadingCurrent = false;
                state.current = payload ?? null;
                if (payload?.id) pushRecentId(payload.id);
            })
            .addCase(fetchRecipeById.rejected, (state, { payload, error }) => { state.loadingCurrent = false; state.error = payload ?? error.message; })

            .addCase(fetchRecipes.pending, (state) => { state.loadingList = true; state.error = null; })
            .addCase(fetchRecipes.fulfilled, (state, { payload }) => {
                state.loadingList = false;
                state.list = payload.pageNumber === 0 ? payload.items : [...state.list, ...payload.items];
                state.total = payload.totalCount;
                state.page = payload.pageNumber;
                state.pageSize = payload.pageSize;
            })
            .addCase(fetchRecipes.rejected, (state, { payload, error }) => { state.loadingList = false; state.error = payload ?? error.message; })

            .addCase(fetchLatestRecipes.pending, (state) => { state.loadingLatest = true; })
            .addCase(fetchLatestRecipes.fulfilled, (state, { payload }) => {
                state.loadingLatest = false;
                state.latestRecipes = payload.items ?? payload;
            })
            .addCase(fetchLatestRecipes.rejected, (state) => { state.loadingLatest = false; })

            .addCase(fetchRecipesByAuthor.pending, (state) => { state.loadingList = true; state.error = null; })
            .addCase(fetchRecipesByAuthor.fulfilled, (state, { payload }) => {
                state.loadingList = false;
                state.list = payload.pageNumber === 0 ? payload.items : [...state.list, ...payload.items];
                state.total = payload.totalCount;
                state.page = payload.pageNumber;
                state.pageSize = payload.pageSize;
            })
            .addCase(fetchRecipesByAuthor.rejected, (state, { payload, error }) => { state.loadingList = false; state.error = payload ?? error.message; })

            .addCase(fetchLikedRecipes.pending, (state) => { state.loadingLiked = true; state.error = null; })
            .addCase(fetchLikedRecipes.fulfilled, (state, { payload }) => {
                state.loadingLiked = false;
                state.likedList = payload.pageNumber === 0 ? payload.items : [...state.likedList, ...payload.items];
                state.likedTotal = payload.totalCount;
                state.likedPage = payload.pageNumber;
                state.likedPageSize = payload.pageSize;
            })
            .addCase(fetchLikedRecipes.rejected, (state, { payload, error }) => { state.loadingLiked = false; state.error = payload ?? error.message; })

            .addCase(fetchRecentlyViewed.pending, (state) => { state.loadingRecent = true; })
            .addCase(fetchRecentlyViewed.fulfilled, (state, { payload }) => { state.loadingRecent = false; state.recentlyViewed = payload; })
            .addCase(fetchRecentlyViewed.rejected, (state) => { state.loadingRecent = false; })

            .addCase(createRecipe.fulfilled, (state) => { state.error = null; })
            .addCase(createRecipe.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(updateRecipe.fulfilled, (state, { payload }) => {
                const id = payload.recipeId ?? payload.RecipeId;
                if (state.current?.id === id) state.current = { ...state.current, ...payload };
                const idx = state.list.findIndex((r) => r.id === id);
                if (idx !== -1) state.list[idx] = { ...state.list[idx], ...payload };
            })
            .addCase(updateRecipe.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteRecipe.fulfilled, (state, { payload: id }) => {
                state.list = state.list.filter((r) => r.id !== id);
                state.total = Math.max(0, state.total - 1);
                state.current = null;
            })
            .addCase(deleteRecipe.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(toggleLike.pending, (state, { meta }) => {
                const { recipeId, isLiked } = meta.arg;
                const target = !isLiked;
                if (state.current?.id === recipeId) applyLikeState(state.current, target);
                applyLikeState(state.list.find((r) => r.id === recipeId), target);
                applyLikeState(state.recentlyViewed.find((r) => r.id === recipeId), target);
                applyLikeState(state.latestRecipes.find((r) => r.id === recipeId), target);
                const likedCard = state.likedList.find((r) => r.id === recipeId);
                if (likedCard) {
                    applyLikeState(likedCard, target);
                    if (!target) {
                        state.likedList = state.likedList.filter((r) => r.id !== recipeId);
                        state.likedTotal = Math.max(0, state.likedTotal - 1);
                    }
                }
            })
            .addCase(toggleLike.fulfilled, (state, { payload }) => {
                const { recipeId, wasLiked } = payload;
                const target = !wasLiked;
                if (state.current?.id === recipeId) applyLikeState(state.current, target);
                applyLikeState(state.list.find((r) => r.id === recipeId), target);
                applyLikeState(state.recentlyViewed.find((r) => r.id === recipeId), target);
                applyLikeState(state.latestRecipes.find((r) => r.id === recipeId), target);
                applyLikeState(state.likedList.find((r) => r.id === recipeId), target);
            })
            .addCase(toggleLike.rejected, (state, { payload, meta }) => {
                const recipeId = payload?.recipeId ?? meta.arg.recipeId;
                const wasLiked = payload?.wasLiked ?? meta.arg.isLiked;
                const rollback = wasLiked;
                if (state.current?.id === recipeId) applyLikeState(state.current, rollback);
                applyLikeState(state.list.find((r) => r.id === recipeId), rollback);
                applyLikeState(state.recentlyViewed.find((r) => r.id === recipeId), rollback);
                applyLikeState(state.latestRecipes.find((r) => r.id === recipeId), rollback);
                applyLikeState(state.likedList.find((r) => r.id === recipeId), rollback);
            });
    },
});

export const { clearCurrentRecipe, clearRecipeList, clearLikedList } = recipeSlice.actions;
export default recipeSlice.reducer;

export const selectCurrentRecipe = (state) => state.recipe.current;
export const selectRecipeList = (state) => state.recipe.list;
export const selectRecipeTotal = (state) => state.recipe.total;
export const selectRecipePage = (state) => state.recipe.page;
export const selectRecipePageSize = (state) => state.recipe.pageSize;
export const selectRecipeLoadingCurrent = (state) => state.recipe.loadingCurrent;
export const selectRecipeLoadingList = (state) => state.recipe.loadingList;
export const selectHasMoreRecipes = (state) => state.recipe.list.length < state.recipe.total;
export const selectLatestRecipes = (state) => state.recipe.latestRecipes;
export const selectLatestRecipesLoading = (state) => state.recipe.loadingLatest;
export const selectRecentlyViewed = (state) => state.recipe.recentlyViewed;
export const selectRecentlyViewedLoading = (state) => state.recipe.loadingRecent;
export const selectLikedRecipeList = (state) => state.recipe.likedList;
export const selectLikedRecipeTotal = (state) => state.recipe.likedTotal;
export const selectLikedRecipePage = (state) => state.recipe.likedPage;
export const selectLikedRecipeLoading = (state) => state.recipe.loadingLiked;
export const selectHasMoreLikedRecipes = (state) => state.recipe.likedList.length < state.recipe.likedTotal;