import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCookie, setCookie } from '@/shared/lib/cookie.js';


let MOCK_RECIPES = [
    {
        id: 1,
        images: [
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=80',
        ],
        name: 'Margherita Napoletana',
        description: 'A classic Neapolitan pizza with San Marzano tomato sauce and fresh mozzarella.',
        calories: 1000, likes: 248, likedByMe: false,
        publishedAt: '2026-03-15T10:30:00Z',
        authorId: 1, authorName: 'chefalex', authorImageUrl: 'https://i.pravatar.cc/80?img=5',
        cuisineId: 1, cuisineName: 'Italian',
        difficultyId: 3, difficultyName: 'Hard',
        categories: [{ id: 1, name: 'Breakfast' }, { id: 4, name: 'Vegan' }],
        ingredients: [
            { id: 1, ingredientId: 11, productName: 'Wheat Flour', amount: 500, unit: 'g' },
            { id: 2, ingredientId: 13, productName: 'Olive Oil', amount: 3, unit: 'tbsp' },
            { id: 3, ingredientId: 8, productName: 'Mozzarella', amount: 150, unit: 'g' },
            { id: 4, ingredientId: 25, productName: 'Basil', amount: 1, unit: 'bunch' },
        ],
        steps: [
            {
                id: 1, number: 1,
                imageUrl: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400&q=80',
                name: 'Подготовка теста', description: 'Замешиваем до однородности.',
                substeps: [
                    { id: 1, number: 1, text: 'Смешать муку и воду' },
                    { id: 2, number: 2, text: 'Добавить дрожжи' },
                ],
            },
            { id: 2, number: 2, imageUrl: null, name: 'Make the sauce', description: 'Simmer tomatoes 15 min.', substeps: [] },
            { id: 3, number: 3, imageUrl: null, name: 'Assemble & bake', description: 'Bake at 220°C, 12–14 min.', substeps: [] },
        ],
    },
    {
        id: 2,
        images: ['https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1400&q=80'],
        name: 'Spaghetti Carbonara',
        description: 'A Roman classic — silky egg and cheese sauce with crispy pancetta.',
        calories: 820, likes: 312, likedByMe: false,
        publishedAt: '2024-04-02T08:00:00Z',
        authorId: 2, authorName: 'marco_cooks', authorImageUrl: 'https://i.pravatar.cc/80?img=8',
        cuisineId: 1, cuisineName: 'Italian',
        difficultyId: 2, difficultyName: 'Medium',
        categories: [{ id: 5, name: 'Pasta' }, { id: 6, name: 'Main Course' }],
        ingredients: [
            { id: 5, ingredientId: 6, productName: 'Pasta', amount: 400, unit: 'g' },
            { id: 6, ingredientId: 29, productName: 'Pancetta', amount: 150, unit: 'g' },
            { id: 7, ingredientId: 30, productName: 'Pecorino Romano', amount: 100, unit: 'g' },
            { id: 8, ingredientId: 10, productName: 'Egg', amount: 4, unit: 'pcs' },
            { id: 9, ingredientId: 27, productName: 'Black Pepper', amount: 1, unit: 'tsp' },
        ],
        steps: [
            { id: 4, number: 1, imageUrl: null, name: 'Boil pasta', description: 'Cook al dente in well-salted water.', substeps: [] },
            { id: 5, number: 2, imageUrl: null, name: 'Crisp pancetta', description: 'Fry until golden and fat renders.', substeps: [] },
            { id: 6, number: 3, imageUrl: null, name: 'Make egg mixture', description: 'Whisk eggs with grated Pecorino.', substeps: [] },
            { id: 7, number: 4, imageUrl: null, name: 'Combine off heat', description: 'Toss pasta with egg mixture away from direct heat to avoid scrambling.', substeps: [] },
        ],
    },
    {
        id: 3,
        images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1400&q=80'],
        name: 'Miso Ramen Bowl',
        description: 'Rich miso broth with chashu, jammy egg, and chewy noodles.',
        calories: 650, likes: 198, likedByMe: false,
        publishedAt: '2024-04-10T14:20:00Z',
        authorId: 3, authorName: 'sakura_eats', authorImageUrl: 'https://i.pravatar.cc/80?img=20',
        cuisineId: 2, cuisineName: 'Japanese',
        difficultyId: 3, difficultyName: 'Hard',
        categories: [{ id: 7, name: 'Asian' }, { id: 9, name: 'Soup' }],
        ingredients: [
            { id: 10, ingredientId: 6, productName: 'Ramen Noodles', amount: 200, unit: 'g' },
            { id: 11, ingredientId: 13, productName: 'Miso paste', amount: 3, unit: 'tbsp' },
            { id: 12, ingredientId: 4, productName: 'Chicken Breast', amount: 300, unit: 'g' },
            { id: 13, ingredientId: 10, productName: 'Egg', amount: 2, unit: 'pcs' },
            { id: 14, ingredientId: 17, productName: 'Broccoli', amount: 100, unit: 'g' },
        ],
        steps: [
            { id: 8, number: 1, imageUrl: null, name: 'Make broth', description: 'Simmer dashi stock with miso paste for 20 min.', substeps: [] },
            { id: 9, number: 2, imageUrl: null, name: 'Prepare chashu', description: 'Braise pork belly in soy, mirin and sake for 2 hours.', substeps: [] },
            { id: 10, number: 3, imageUrl: null, name: 'Soft-boil eggs', description: 'Cook 6.5 minutes, shock in ice water, marinate in soy.', substeps: [] },
            { id: 11, number: 4, imageUrl: null, name: 'Cook noodles', description: 'Boil per package instructions, drain well.', substeps: [] },
            { id: 12, number: 5, imageUrl: null, name: 'Assemble bowl', description: 'Pour hot broth, arrange toppings, serve immediately.', substeps: [] },
        ],
    },
    {
        id: 4,
        images: ['https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=1400&q=80'],
        name: 'Avocado Toast',
        description: 'Creamy avocado on toasted sourdough with lemon and chilli flakes.',
        calories: 380, likes: 87, likedByMe: false,
        publishedAt: '2024-04-18T09:45:00Z',
        authorId: 4, authorName: 'brunch_queen', authorImageUrl: 'https://i.pravatar.cc/80?img=32',
        cuisineId: 3, cuisineName: 'American',
        difficultyId: 1, difficultyName: 'Easy',
        categories: [{ id: 1, name: 'Breakfast' }, { id: 8, name: 'Healthy' }],
        ingredients: [
            { id: 15, ingredientId: 20, productName: 'Avocado', amount: 2, unit: 'pcs' },
            { id: 16, ingredientId: 19, productName: 'Lemon', amount: 1, unit: 'pcs' },
            { id: 17, ingredientId: 28, productName: 'Salt', amount: 1, unit: 'pinch' },
            { id: 18, ingredientId: 27, productName: 'Black Pepper', amount: 1, unit: 'pinch' },
        ],
        steps: [
            { id: 13, number: 1, imageUrl: null, name: 'Toast bread', description: 'Toast sourdough slices until golden and crisp.', substeps: [] },
            { id: 14, number: 2, imageUrl: null, name: 'Mash avocado', description: 'Mash with lemon juice, salt and pepper.', substeps: [] },
            { id: 15, number: 3, imageUrl: null, name: 'Top and serve', description: 'Spread on toast, add chilli flakes and a drizzle of olive oil.', substeps: [] },
        ],
    },
    {
        id: 5,
        images: ['https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1400&q=80'],
        name: 'Chicken Tikka Masala',
        description: 'Tender grilled chicken in a rich, creamy tomato-spiced sauce.',
        calories: 720, likes: 431, likedByMe: false,
        publishedAt: '2024-05-03T12:00:00Z',
        authorId: 5, authorName: 'spice_master', authorImageUrl: 'https://i.pravatar.cc/80?img=11',
        cuisineId: 5, cuisineName: 'Indian',
        difficultyId: 2, difficultyName: 'Medium',
        categories: [{ id: 6, name: 'Main Course' }],
        ingredients: [
            { id: 19, ingredientId: 4, productName: 'Chicken Breast', amount: 700, unit: 'g' },
            { id: 20, ingredientId: 1, productName: 'Tomato', amount: 4, unit: 'pcs' },
            { id: 21, ingredientId: 9, productName: 'Milk', amount: 200, unit: 'ml' },
            { id: 22, ingredientId: 3, productName: 'Garlic', amount: 4, unit: 'pcs' },
            { id: 23, ingredientId: 13, productName: 'Olive Oil', amount: 2, unit: 'tbsp' },
            { id: 24, ingredientId: 26, productName: 'Oregano', amount: 1, unit: 'tsp' },
        ],
        steps: [
            { id: 16, number: 1, imageUrl: null, name: 'Marinate chicken', description: 'Coat in yogurt and spices, rest for 2 hours.', substeps: [] },
            { id: 17, number: 2, imageUrl: null, name: 'Grill chicken', description: 'Grill or broil until charred at edges.', substeps: [] },
            { id: 18, number: 3, imageUrl: null, name: 'Make sauce', description: 'Sauté onion, garlic, add tomatoes and cream, simmer 20 min.', substeps: [] },
            { id: 19, number: 4, imageUrl: null, name: 'Combine', description: 'Add chicken to sauce and simmer 10 more minutes.', substeps: [] },
        ],
    },
    {
        id: 6,
        images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1400&q=80'],
        name: 'Greek Salad',
        description: 'Crisp cucumber, tomatoes, olives and feta with a simple oregano dressing.',
        calories: 290, likes: 156, likedByMe: false,
        publishedAt: '2024-05-20T11:15:00Z',
        authorId: 6, authorName: 'mediterranean_life', authorImageUrl: 'https://i.pravatar.cc/80?img=44',
        cuisineId: 9, cuisineName: 'Greek',
        difficultyId: 1, difficultyName: 'Easy',
        categories: [{ id: 10, name: 'Salad' }, { id: 4, name: 'Vegan' }, { id: 8, name: 'Healthy' }],
        ingredients: [
            { id: 25, ingredientId: 1, productName: 'Tomato', amount: 3, unit: 'pcs' },
            { id: 26, ingredientId: 21, productName: 'Bell Pepper', amount: 1, unit: 'pcs' },
            { id: 27, ingredientId: 8, productName: 'Feta', amount: 150, unit: 'g' },
            { id: 28, ingredientId: 13, productName: 'Olive Oil', amount: 3, unit: 'tbsp' },
            { id: 29, ingredientId: 19, productName: 'Lemon', amount: 1, unit: 'pcs' },
            { id: 30, ingredientId: 26, productName: 'Oregano', amount: 1, unit: 'tsp' },
        ],
        steps: [
            { id: 20, number: 1, imageUrl: null, name: 'Chop vegetables', description: 'Cut tomatoes, cucumber and pepper into chunky pieces.', substeps: [] },
            { id: 21, number: 2, imageUrl: null, name: 'Make dressing', description: 'Whisk olive oil, lemon juice and oregano.', substeps: [] },
            { id: 22, number: 3, imageUrl: null, name: 'Assemble', description: 'Toss everything together, top with feta and olives.', substeps: [] },
        ],
    },
    {
        id: 7,
        images: ['https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1400&q=80'],
        name: 'Beef Tacos',
        description: 'Juicy seasoned ground beef in crispy shells with all the toppings.',
        calories: 610, likes: 274, likedByMe: false,
        publishedAt: '2024-06-07T18:30:00Z',
        authorId: 7, authorName: 'tex_mex_tony', authorImageUrl: 'https://i.pravatar.cc/80?img=15',
        cuisineId: 6, cuisineName: 'Mexican',
        difficultyId: 1, difficultyName: 'Easy',
        categories: [{ id: 6, name: 'Main Course' }],
        ingredients: [
            { id: 31, ingredientId: 5, productName: 'Beef', amount: 500, unit: 'g' },
            { id: 32, ingredientId: 2, productName: 'Onion', amount: 1, unit: 'pcs' },
            { id: 33, ingredientId: 3, productName: 'Garlic', amount: 3, unit: 'pcs' },
            { id: 34, ingredientId: 1, productName: 'Tomato', amount: 2, unit: 'pcs' },
            { id: 35, ingredientId: 21, productName: 'Bell Pepper', amount: 1, unit: 'pcs' },
            { id: 36, ingredientId: 27, productName: 'Black Pepper', amount: 1, unit: 'tsp' },
        ],
        steps: [
            { id: 23, number: 1, imageUrl: null, name: 'Brown the beef', description: 'Cook ground beef in a skillet until browned. Drain excess fat.', substeps: [] },
            { id: 24, number: 2, imageUrl: null, name: 'Add aromatics', description: 'Add onion, garlic, pepper and spices, cook 5 min.', substeps: [] },
            { id: 25, number: 3, imageUrl: null, name: 'Warm shells', description: 'Heat taco shells in oven at 180°C for 3 min.', substeps: [] },
            { id: 26, number: 4, imageUrl: null, name: 'Fill and serve', description: 'Fill shells with beef, top with salsa, cheese and sour cream.', substeps: [] },
        ],
    },
    {
        id: 8,
        images: ['https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1400&q=80'],
        name: 'Banana Pancakes',
        description: 'Fluffy pancakes with mashed banana batter — naturally sweet and golden.',
        calories: 430, likes: 189, likedByMe: false,
        publishedAt: '2024-06-14T08:00:00Z',
        authorId: 4, authorName: 'brunch_queen', authorImageUrl: 'https://i.pravatar.cc/80?img=32',
        cuisineId: 3, cuisineName: 'American',
        difficultyId: 1, difficultyName: 'Easy',
        categories: [{ id: 1, name: 'Breakfast' }, { id: 3, name: 'Desserts' }],
        ingredients: [
            { id: 37, ingredientId: 11, productName: 'Wheat Flour', amount: 200, unit: 'g' },
            { id: 38, ingredientId: 9, productName: 'Milk', amount: 250, unit: 'ml' },
            { id: 39, ingredientId: 10, productName: 'Egg', amount: 2, unit: 'pcs' },
            { id: 40, ingredientId: 14, productName: 'Butter', amount: 30, unit: 'g' },
            { id: 41, ingredientId: 12, productName: 'Sugar', amount: 2, unit: 'tbsp' },
        ],
        steps: [
            { id: 27, number: 1, imageUrl: null, name: 'Make batter', description: 'Whisk flour, eggs, milk and mashed banana until smooth.', substeps: [] },
            { id: 28, number: 2, imageUrl: null, name: 'Rest batter', description: 'Let the batter rest for 10 minutes.', substeps: [] },
            { id: 29, number: 3, imageUrl: null, name: 'Cook pancakes', description: 'Cook in buttered pan over medium heat, 2 min each side.', substeps: [] },
        ],
    },
    {
        id: 9,
        images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1400&q=80'],
        name: 'Tom Yum Soup',
        description: 'Hot and sour Thai soup with shrimp, lemongrass and kaffir lime.',
        calories: 310, likes: 223, likedByMe: false,
        publishedAt: '2024-07-01T13:00:00Z',
        authorId: 8, authorName: 'bangkok_bites', authorImageUrl: 'https://i.pravatar.cc/80?img=27',
        cuisineId: 8, cuisineName: 'Thai',
        difficultyId: 2, difficultyName: 'Medium',
        categories: [{ id: 9, name: 'Soup' }, { id: 7, name: 'Asian' }],
        ingredients: [
            { id: 42, ingredientId: 24, productName: 'Shrimp', amount: 300, unit: 'g' },
            { id: 43, ingredientId: 22, productName: 'Mushroom', amount: 150, unit: 'g' },
            { id: 44, ingredientId: 1, productName: 'Tomato', amount: 2, unit: 'pcs' },
            { id: 45, ingredientId: 19, productName: 'Lemon', amount: 2, unit: 'pcs' },
            { id: 46, ingredientId: 3, productName: 'Garlic', amount: 3, unit: 'pcs' },
        ],
        steps: [
            { id: 30, number: 1, imageUrl: null, name: 'Prepare broth', description: 'Boil water with lemongrass, galangal and kaffir lime leaves.', substeps: [] },
            { id: 31, number: 2, imageUrl: null, name: 'Add vegetables', description: 'Add mushrooms and tomatoes, simmer 5 min.', substeps: [] },
            { id: 32, number: 3, imageUrl: null, name: 'Add shrimp', description: 'Add shrimp and cook until pink, about 3 min.', substeps: [] },
            { id: 33, number: 4, imageUrl: null, name: 'Season', description: 'Add fish sauce, lime juice and chilli. Adjust to taste.', substeps: [] },
        ],
    },
    {
        id: 10,
        images: ['https://images.unsplash.com/photo-1574484284002-952d92456975?w=1400&q=80'],
        name: 'Beef Bourguignon',
        description: 'Classic French braised beef in red wine with mushrooms and pearl onions.',
        calories: 890, likes: 367, likedByMe: false,
        publishedAt: '2024-07-20T17:00:00Z',
        authorId: 9, authorName: 'pierre_cuisine', authorImageUrl: 'https://i.pravatar.cc/80?img=60',
        cuisineId: 4, cuisineName: 'French',
        difficultyId: 3, difficultyName: 'Hard',
        categories: [{ id: 6, name: 'Main Course' }, { id: 2, name: 'Dinner' }],
        ingredients: [
            { id: 47, ingredientId: 5, productName: 'Beef', amount: 1000, unit: 'g' },
            { id: 48, ingredientId: 22, productName: 'Mushroom', amount: 250, unit: 'g' },
            { id: 49, ingredientId: 2, productName: 'Onion', amount: 2, unit: 'pcs' },
            { id: 50, ingredientId: 16, productName: 'Carrot', amount: 3, unit: 'pcs' },
            { id: 51, ingredientId: 3, productName: 'Garlic', amount: 4, unit: 'pcs' },
            { id: 52, ingredientId: 14, productName: 'Butter', amount: 50, unit: 'g' },
        ],
        steps: [
            { id: 34, number: 1, imageUrl: null, name: 'Sear beef', description: 'Pat beef dry, sear in batches in hot oil until browned on all sides.', substeps: [] },
            { id: 35, number: 2, imageUrl: null, name: 'Sauté vegetables', description: 'Cook onion, carrot and garlic in the same pot until softened.', substeps: [] },
            { id: 36, number: 3, imageUrl: null, name: 'Braise', description: 'Return beef, add wine and stock. Cover and cook at 160°C for 2.5 hours.', substeps: [] },
            { id: 37, number: 4, imageUrl: null, name: 'Finish with mushrooms', description: 'Sauté mushrooms in butter and stir in before serving.', substeps: [] },
        ],
    },
    {
        id: 11,
        images: ['https://images.unsplash.com/photo-1615361200141-f45040f367be?w=1400&q=80'],
        name: 'Shakshuka',
        description: 'Eggs poached in spiced tomato and pepper sauce — a Middle Eastern breakfast staple.',
        calories: 340, likes: 295, likedByMe: false,
        publishedAt: '2024-08-05T09:00:00Z',
        authorId: 1, authorName: 'chefalex', authorImageUrl: 'https://i.pravatar.cc/80?img=5',
        cuisineId: 5, cuisineName: 'Indian',
        difficultyId: 1, difficultyName: 'Easy',
        categories: [{ id: 1, name: 'Breakfast' }, { id: 4, name: 'Vegan' }],
        ingredients: [
            { id: 53, ingredientId: 10, productName: 'Egg', amount: 4, unit: 'pcs' },
            { id: 54, ingredientId: 1, productName: 'Tomato', amount: 5, unit: 'pcs' },
            { id: 55, ingredientId: 21, productName: 'Bell Pepper', amount: 2, unit: 'pcs' },
            { id: 56, ingredientId: 2, productName: 'Onion', amount: 1, unit: 'pcs' },
            { id: 57, ingredientId: 3, productName: 'Garlic', amount: 3, unit: 'pcs' },
            { id: 58, ingredientId: 13, productName: 'Olive Oil', amount: 2, unit: 'tbsp' },
        ],
        steps: [
            { id: 38, number: 1, imageUrl: null, name: 'Cook base', description: 'Sauté onion and pepper in olive oil until soft.', substeps: [] },
            { id: 39, number: 2, imageUrl: null, name: 'Add tomatoes', description: 'Add crushed tomatoes and spices, simmer 15 min.', substeps: [] },
            { id: 40, number: 3, imageUrl: null, name: 'Poach eggs', description: 'Make wells in sauce, crack in eggs, cover and cook 5–7 min.', substeps: [] },
        ],
    },
    {
        id: 12,
        images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1400&q=80'],
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten flowing centre — serve with vanilla ice cream.',
        calories: 560, likes: 512, likedByMe: false,
        publishedAt: '2024-08-22T20:00:00Z',
        authorId: 10, authorName: 'pastry_art', authorImageUrl: 'https://i.pravatar.cc/80?img=49',
        cuisineId: 4, cuisineName: 'French',
        difficultyId: 2, difficultyName: 'Medium',
        categories: [{ id: 3, name: 'Desserts' }],
        ingredients: [
            { id: 59, ingredientId: 14, productName: 'Butter', amount: 100, unit: 'g' },
            { id: 60, ingredientId: 12, productName: 'Sugar', amount: 80, unit: 'g' },
            { id: 61, ingredientId: 10, productName: 'Egg', amount: 3, unit: 'pcs' },
            { id: 62, ingredientId: 11, productName: 'Wheat Flour', amount: 50, unit: 'g' },
        ],
        steps: [
            { id: 41, number: 1, imageUrl: null, name: 'Melt chocolate', description: 'Melt butter and dark chocolate together over a double boiler.', substeps: [] },
            { id: 42, number: 2, imageUrl: null, name: 'Make batter', description: 'Whisk eggs and sugar, fold in chocolate mixture and flour.', substeps: [] },
            { id: 43, number: 3, imageUrl: null, name: 'Fill ramekins', description: 'Butter ramekins, fill ¾ full. Refrigerate 30 min.', substeps: [] },
            { id: 44, number: 4, imageUrl: null, name: 'Bake', description: 'Bake at 200°C for exactly 12 minutes. Serve immediately.', substeps: [] },
        ],
    },
    {
        id: 13,
        images: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1400&q=80'],
        name: 'Salmon Teriyaki',
        description: 'Glazed salmon fillet in sweet soy teriyaki sauce, served with steamed rice.',
        calories: 580, likes: 341, likedByMe: false,
        publishedAt: '2024-09-10T19:00:00Z',
        authorId: 3, authorName: 'sakura_eats', authorImageUrl: 'https://i.pravatar.cc/80?img=20',
        cuisineId: 2, cuisineName: 'Japanese',
        difficultyId: 1, difficultyName: 'Easy',
        categories: [{ id: 6, name: 'Main Course' }, { id: 8, name: 'Healthy' }],
        ingredients: [
            { id: 63, ingredientId: 23, productName: 'Salmon', amount: 600, unit: 'g' },
            { id: 64, ingredientId: 7, productName: 'Rice', amount: 300, unit: 'g' },
            { id: 65, ingredientId: 18, productName: 'Spinach', amount: 100, unit: 'g' },
            { id: 66, ingredientId: 3, productName: 'Garlic', amount: 2, unit: 'pcs' },
            { id: 67, ingredientId: 13, productName: 'Olive Oil', amount: 1, unit: 'tbsp' },
        ],
        steps: [
            { id: 45, number: 1, imageUrl: null, name: 'Make teriyaki glaze', description: 'Combine soy sauce, mirin, sake and sugar. Simmer until thickened.', substeps: [] },
            { id: 46, number: 2, imageUrl: null, name: 'Cook rice', description: 'Rinse rice, cook with 1:1.5 water ratio for 18 min.', substeps: [] },
            { id: 47, number: 3, imageUrl: null, name: 'Pan-fry salmon', description: 'Sear skin-side down 4 min, flip and glaze with teriyaki sauce.', substeps: [] },
            { id: 48, number: 4, imageUrl: null, name: 'Plate', description: 'Serve salmon over rice with wilted spinach on the side.', substeps: [] },
        ],
    },
    {
        id: 14,
        images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1400&q=80'],
        name: 'Creamy Mushroom Risotto',
        description: 'Slow-stirred Arborio rice with porcini mushrooms, white wine and Parmesan.',
        calories: 670, likes: 288, likedByMe: false,
        publishedAt: '2024-09-28T18:45:00Z',
        authorId: 2, authorName: 'marco_cooks', authorImageUrl: 'https://i.pravatar.cc/80?img=8',
        cuisineId: 1, cuisineName: 'Italian',
        difficultyId: 2, difficultyName: 'Medium',
        categories: [{ id: 6, name: 'Main Course' }, { id: 2, name: 'Dinner' }],
        ingredients: [
            { id: 69, ingredientId: 7, productName: 'Rice', amount: 350, unit: 'g' },
            { id: 70, ingredientId: 22, productName: 'Mushroom', amount: 300, unit: 'g' },
            { id: 71, ingredientId: 2, productName: 'Onion', amount: 1, unit: 'pcs' },
            { id: 72, ingredientId: 3, productName: 'Garlic', amount: 2, unit: 'pcs' },
            { id: 73, ingredientId: 14, productName: 'Butter', amount: 40, unit: 'g' },
            { id: 74, ingredientId: 13, productName: 'Olive Oil', amount: 2, unit: 'tbsp' },
            { id: 75, ingredientId: 30, productName: 'Pecorino Romano', amount: 60, unit: 'g' },
        ],
        steps: [
            { id: 49, number: 1, imageUrl: null, name: 'Sauté aromatics', description: 'Cook onion and garlic in olive oil and butter until translucent.', substeps: [] },
            { id: 50, number: 2, imageUrl: null, name: 'Toast rice', description: 'Add Arborio rice, stir until edges turn translucent, about 2 min.', substeps: [] },
            { id: 51, number: 3, imageUrl: null, name: 'Add wine', description: 'Pour in white wine and stir until absorbed.', substeps: [] },
            { id: 52, number: 4, imageUrl: null, name: 'Add stock ladle by ladle', description: 'Add warm stock one ladle at a time, stirring constantly for 18–20 min.', substeps: [] },
            { id: 53, number: 5, imageUrl: null, name: 'Finish', description: 'Stir in butter, Parmesan and mushrooms. Rest 2 min before serving.', substeps: [] },
        ],
    },
];

const RECENTLY_VIEWED_COOKIE = 'recently_viewed_recipes';
const RECENTLY_VIEWED_MAX = 20;

function readRecentIds() {
    try {
        const raw = getCookie(RECENTLY_VIEWED_COOKIE);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function pushRecentId(id) {
    const ids = readRecentIds().filter((x) => x !== id);
    const next = [id, ...ids].slice(0, RECENTLY_VIEWED_MAX);
    setCookie(RECENTLY_VIEWED_COOKIE, JSON.stringify(next));
    return next;
}

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const PAGE_SIZE = 10;

const toCard = (r) => ({
    id: r.id,
    imageUrl: r.images[0] ?? null,
    name: r.name,
    likes: r.likes,
    likedByMe: r.likedByMe,
    authorName: r.authorName,
    publishedAt: r.publishedAt,
});

const applyFilters = (recipes, { categoryIds, cuisineIds, difficultyIds, productIds, authorId } = {}) =>
    recipes.filter((r) => {
        if (authorId && r.authorId !== authorId) return false;
        if (categoryIds?.length && !categoryIds.some((id) => r.categories.some((c) => c.id === id))) return false;
        if (cuisineIds?.length && !cuisineIds.includes(r.cuisineId)) return false;
        if (difficultyIds?.length && !difficultyIds.includes(r.difficultyId)) return false;
        if (productIds?.length && !productIds.every((id) => r.ingredients.some((i) => i.ingredientId === id))) return false;
        return true;
    });

export const fetchRecipeById = createAsyncThunk(
    'recipe/fetchById',
    async (id, { rejectWithValue }) => {
        await delay();
        const recipe = MOCK_RECIPES.find((r) => r.id === Number(id));
        if (!recipe) return rejectWithValue(`Recipe ${id} not found`);
        return recipe;
    }
);

export const fetchRecipes = createAsyncThunk(
    'recipe/fetchList',
    async ({ page = 1, categoryIds, cuisineIds, difficultyIds, productIds, authorId } = {}) => {
        await delay();
        const filtered = applyFilters(MOCK_RECIPES, { categoryIds, cuisineIds, difficultyIds, productIds, authorId });
        const total = filtered.length;
        const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toCard);
        return { items, total, page, pageSize: PAGE_SIZE };
    }
);

export const fetchLatestRecipes = createAsyncThunk(
    'recipe/fetchLatest',
    async () => {
        await delay();
        return [...MOCK_RECIPES]
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, 20)
            .map(toCard);
    }
);

export const fetchRecentlyViewed = createAsyncThunk(
    'recipe/fetchRecentlyViewed',
    async () => {
        const ids = readRecentIds();
        if (!ids.length) return [];
        await delay(200);
        return ids
            .map((id) => MOCK_RECIPES.find((r) => r.id === id))
            .filter(Boolean)
            .map(toCard);
    }
);

export const fetchLikedRecipes = createAsyncThunk(
    'recipe/fetchLiked',
    async ({ userId, page = 1 } = {}, { rejectWithValue }) => {
        if (!userId) return rejectWithValue('userId is required');
        await delay();
        const liked = MOCK_RECIPES.filter((r) => r.likedByMe);
        const total = liked.length;
        const items = liked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toCard);
        return { items, total, page, pageSize: PAGE_SIZE };
    }
);

export const createRecipe = createAsyncThunk(
    'recipe/create',
    async (data, { getState, rejectWithValue }) => {
        await delay();
        const me = getState().auth.user;
        if (!me) return rejectWithValue('Not authenticated');
        const newRecipe = {
            id: Date.now(),
            images: data.images ?? [],
            name: data.name,
            description: data.description,
            calories: data.calories,
            likes: 0,
            likedByMe: false,
            publishedAt: new Date().toISOString(),
            authorId: me.id,
            authorName: me.username,
            authorImageUrl: me.avatarUrl,
            cuisineId: data.cuisineId, cuisineName: data.cuisineName ?? '',
            difficultyId: data.difficultyId, difficultyName: data.difficultyName ?? '',
            categories: data.categories ?? [],
            ingredients: data.ingredients ?? [],
            steps: data.steps ?? [],
        };
        // Пушим копию — чтобы Immer не заморозил оригинал в моке
        // после того как объект попадёт в Redux state
        MOCK_RECIPES.push({ ...newRecipe });
        return newRecipe;
    }
);

export const updateRecipe = createAsyncThunk(
    'recipe/update',
    async ({ id, ...data }, { getState, rejectWithValue }) => {
        await delay();
        const me = getState().auth.user;
        const idx = MOCK_RECIPES.findIndex((r) => r.id === id);
        if (idx === -1) return rejectWithValue('Recipe not found');
        if (MOCK_RECIPES[idx].authorId !== me?.id && me?.status !== 'admin')
            return rejectWithValue('Forbidden');
        MOCK_RECIPES[idx] = { ...MOCK_RECIPES[idx], ...data };
        return MOCK_RECIPES[idx];
    }
);

export const deleteRecipe = createAsyncThunk(
    'recipe/delete',
    async (id, { getState, rejectWithValue }) => {
        await delay();
        const me = getState().auth.user;
        const idx = MOCK_RECIPES.findIndex((r) => r.id === id);
        if (idx === -1) return rejectWithValue('Recipe not found');
        if (MOCK_RECIPES[idx].authorId !== me?.id && me?.status !== 'admin')
            return rejectWithValue('Forbidden');
        MOCK_RECIPES.splice(idx, 1);
        return id;
    }
);

export const uploadRecipeImages = createAsyncThunk('recipe/uploadImages', async (files) => {
    await delay(800);
    return files.map((f) => URL.createObjectURL(f));
});

export const uploadStepImage = createAsyncThunk('recipe/uploadStepImage', async (file) => {
    await delay(600);
    return URL.createObjectURL(file);
});

export const toggleLike = createAsyncThunk(
    'recipe/toggleLike',
    async (recipeId, { rejectWithValue }) => {
        const id = Number(recipeId);
        await delay(200);
        const recipe = MOCK_RECIPES.find((r) => r.id === id);
        if (!recipe) return rejectWithValue('Not found');
        return { id, likedByMe: !recipe.likedByMe, likes: recipe.likedByMe ? recipe.likes - 1 : recipe.likes + 1 };
    }
);

const flip = (item) => {
    item.likedByMe = !item.likedByMe;
    item.likes += item.likedByMe ? 1 : -1;
};

const recipeSlice = createSlice({
    name: 'recipe',
    initialState: {
        current: null,
        loadingCurrent: false,

        list: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        loadingList: false,

        latestRecipes: [],
        loadingLatest: false,

        recentlyViewed: [],
        loadingRecent: false,

        likedList: [],
        likedTotal: 0,
        likedPage: 1,
        likedPageSize: PAGE_SIZE,
        loadingLiked: false,

        uploadingImages: false,
        error: null,
    },
    reducers: {
        clearCurrentRecipe(state) { state.current = null; },
        clearRecipeList(state) { state.list = []; state.total = 0; state.page = 1; },
        clearLikedList(state) { state.likedList = []; state.likedTotal = 0; state.likedPage = 1; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecipeById.pending, (state) => { state.loadingCurrent = true; state.current = null; state.error = null; })
            .addCase(fetchRecipeById.fulfilled, (state, { payload }) => {
                state.loadingCurrent = false;
                state.current = payload;
                pushRecentId(payload.id);
            })
            .addCase(fetchRecipeById.rejected, (state, { payload, error }) => { state.loadingCurrent = false; state.error = payload ?? error.message; })

            .addCase(fetchRecipes.pending, (state) => { state.loadingList = true; state.error = null; })
            .addCase(fetchRecipes.fulfilled, (state, { payload }) => {
                state.loadingList = false;
                state.list = payload.page === 1 ? payload.items : [...state.list, ...payload.items];
                state.total = payload.total;
                state.page = payload.page;
                state.pageSize = payload.pageSize;
            })
            .addCase(fetchRecipes.rejected, (state, { error }) => { state.loadingList = false; state.error = error.message; })

            .addCase(fetchLatestRecipes.pending, (state) => { state.loadingLatest = true; })
            .addCase(fetchLatestRecipes.fulfilled, (state, { payload }) => { state.loadingLatest = false; state.latestRecipes = payload; })
            .addCase(fetchLatestRecipes.rejected, (state) => { state.loadingLatest = false; })

            .addCase(fetchRecentlyViewed.pending, (state) => { state.loadingRecent = true; })
            .addCase(fetchRecentlyViewed.fulfilled, (state, { payload }) => { state.loadingRecent = false; state.recentlyViewed = payload; })
            .addCase(fetchRecentlyViewed.rejected, (state) => { state.loadingRecent = false; })

            .addCase(fetchLikedRecipes.pending, (state) => { state.loadingLiked = true; state.error = null; })
            .addCase(fetchLikedRecipes.fulfilled, (state, { payload }) => {

                state.likedList = payload.page === 1 ? payload.items : [...state.likedList, ...payload.items];
                state.likedTotal = payload.total;
                state.likedPage = payload.page;
                state.likedPageSize = payload.pageSize;
            })
            .addCase(fetchLikedRecipes.rejected, (state, { payload, error }) => {
                state.loadingLiked = false;
                state.error = payload ?? error.message;
            })
            .addCase(createRecipe.fulfilled, (state, { payload }) => { state.current = payload; })
            .addCase(updateRecipe.fulfilled, (state, { payload }) => {
                state.current = payload;
                const idx = state.list.findIndex((r) => r.id === payload.id);
                if (idx !== -1) state.list[idx] = toCard(payload);
            })

            .addCase(deleteRecipe.fulfilled, (state, { payload: id }) => {
                state.list = state.list.filter((r) => r.id !== id);
                state.total = Math.max(0, state.total - 1);
                state.current = null;
            })

            .addCase(uploadRecipeImages.pending, (state) => { state.uploadingImages = true; })
            .addCase(uploadRecipeImages.fulfilled, (state) => { state.uploadingImages = false; })
            .addCase(uploadRecipeImages.rejected, (state) => { state.uploadingImages = false; })

            .addCase(toggleLike.pending, (state, { meta }) => {
                const id = Number(meta.arg);
                if (state.current?.id === id) flip(state.current);
                const card = state.list.find((r) => r.id === id); if (card) flip(card);
                const recent = state.recentlyViewed.find((r) => r.id === id); if (recent) flip(recent);
                const likedCard = state.likedList.find((r) => r.id === id);
                if (likedCard) {
                    flip(likedCard);
                    if (!likedCard.likedByMe) {
                        state.likedList = state.likedList.filter((r) => r.id !== id);
                        state.likedTotal = Math.max(0, state.likedTotal - 1);
                    }
                }
            })
            .addCase(toggleLike.fulfilled, (_, { payload }) => {
                const idx = MOCK_RECIPES.findIndex((r) => r.id === payload.id);
                if (idx !== -1) {
                    MOCK_RECIPES[idx] = { ...MOCK_RECIPES[idx], likedByMe: payload.likedByMe, likes: payload.likes };
                }
            })
            .addCase(toggleLike.rejected, (state, { meta }) => {
                const id = Number(meta.arg);
                if (state.current?.id === id) flip(state.current);
                const card = state.list.find((r) => r.id === id); if (card) flip(card);
                const recent = state.recentlyViewed.find((r) => r.id === id); if (recent) flip(recent);
                const likedCard = state.likedList.find((r) => r.id === id);
                if (likedCard) flip(likedCard);
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
export const selectRecipeUploadingImages = (state) => state.recipe.uploadingImages;
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