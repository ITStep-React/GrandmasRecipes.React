import { createSlice } from '@reduxjs/toolkit';

const LS_KEY = 'search_filters';

const EMPTY_FILTERS = { cuisineIds: [], categoryIds: [], difficultyIds: [], productIds: [] };

function readSaved() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? { ...EMPTY_FILTERS, ...JSON.parse(raw) } : EMPTY_FILTERS;
    } catch { return EMPTY_FILTERS; }
}

function persist(filters) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(filters)); } catch { }
}

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        query: '',
        filters: readSaved(),
    },
    reducers: {
        setQuery(state, { payload }) {
            state.query = payload;
        },
        setFilters(state, { payload }) {
            state.filters = payload;
            persist(payload);
        },
        setFilter(state, { payload: { groupKey, id } }) {
            state.filters = { ...EMPTY_FILTERS, [groupKey]: [id] };
            persist(state.filters);
        },
        removeFilter(state, { payload: { groupKey, id } }) {
            state.filters = {
                ...state.filters,
                [groupKey]: state.filters[groupKey].filter((v) => v !== id),
            };
            persist(state.filters);
        },
        clearFilters(state) {
            state.filters = EMPTY_FILTERS;
            persist(EMPTY_FILTERS);
        },
    },
});

export const { setQuery, setFilters, setFilter, removeFilter, clearFilters } = searchSlice.actions;
export default searchSlice.reducer;

export const selectQuery = (state) => state.search.query;
export const selectFilters = (state) => state.search.filters;
export const selectTotalActiveFilters = (state) => Object.values(state.search.filters).flat().length;
