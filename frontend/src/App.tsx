import { Routes, Route } from 'react-router-dom';

import Homepage from './components/user/HomePage.js';
import NotFound from './pages/error.js';
import Login from './pages/login.js';
import ResetPassword from './pages/resetPassword.js';
import Register from './pages/register.js';
import Privacy from './components/term/Privacy.js';
import Warranty from './components/term/Warranty.js';
import PrivateRoute from './pages/private.route.js';
import OrderHistory from './components/user/Order/OrderHistory.js';
import Checkout from './components/user/Cart-Checkout/CheckOut.js';
import CartPage from './components/user/Cart-Checkout/CartPage.js';
import Product_Detail from './components/user/Product/Product_Detail.js';
import Product from './components/user/Product/Product.js';
import LandingPage from './components/user/Product/LandingPage.js';
const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Homepage />} errorElement={<NotFound />}>
          <Route index element={<LandingPage />} />
          <Route path="product" element={<Product />} />
          <Route path="product/:id" element={<Product_Detail />} />
          <Route path="cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
          <Route path="warranty" element={<Warranty />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default App;