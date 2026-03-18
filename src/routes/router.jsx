import { BrowserRouter, Route, Routes } from "react-router";

import HomePage from '@/pages/HomePage/HomePage.jsx'

function AppRouter () {
    return <BrowserRouter>
        <Routes>
            <Route path='/' element={<HomePage />} />
            {/* <Route path='/account' element={<AccountPage />}>
                <Route path='info' element={<AccountBlock />} />
                <Route path='orders' element={<OrdersBlock />} />
                <Route index element={<Navigate to='info' replace />} />
            </Route>
            <Route path='/login' element={<LoginPage form={<LoginForm />} />} />
            <Route path='/registration' element={<LoginPage form={<RegistrationForm />} />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/checkout' element={<CheckOutPage />} />
            <Route path='/categories' element={<CategoriesPage />} />
            <Route path='/categories/:name' element={<CategoryPage />} />
            <Route path='/products' element={<Navigate to='/' replace />} />
            <Route path='/products/:id' element={<ProductPage />} />
            <Route path='*' element={<NotFoundPage />} /> */}
        </Routes>
    </BrowserRouter>
}

export default AppRouter;