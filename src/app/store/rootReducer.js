import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/authSlice';
import authorReducer from '@/features/author/authorSlice';
import recipeReducer from '@/features/recipe/recipeSlice';
import commentReducer from '@/features/comment/commentSlice';
import categoryReducer from '@/features/category/categorySlice';
import cuisineReducer from '@/features/cuisine/cuisineSlice';
import difficultyReducer from '@/features/difficulty/difficultySlice';
import productReducer from '@/features/product/productSlice';
import bannerReducer from '@/features/banner/bannerSlice.js';
import searchReducer from '@/features/search/searchSlice.js';

const rootReducer = combineReducers({
    auth: authReducer,
    author: authorReducer,
    recipe: recipeReducer,
    comment: commentReducer,
    category: categoryReducer,
    cuisine: cuisineReducer,
    difficulty: difficultyReducer,
    product: productReducer,
    banner: bannerReducer,
    search: searchReducer,
});

export default rootReducer;
