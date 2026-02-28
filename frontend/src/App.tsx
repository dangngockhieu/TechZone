import { Routes, Route } from 'react-router-dom';

import Homepage from './components/user/HomePage.js';
import AdminLayout from './components/admin/AdminLayout.js';
import AdminRoute from './pages/admin.private.route.js';
import PrivateRoute from './pages/private.route.js';
import NotFound from './pages/error.js';
import Login from './pages/login.js';
import Register from './pages/register.js';
import ResetPassword from "./pages/resetPassword.js";

import LandingPage from './components/user/Product/LandingPage.js';
import Product from './components/user/Product/Product.js';
import Product_Detail from './components/user/Product/Product_Detail.js';
import CartPage from './components/user/Cart-Checkout/CartPage.js';
import Checkout from './components/user/Cart-Checkout/CheckOut.js';

import ManageProduct from './components/admin/ManageProduct/ManageProduct.js';
import ManagerUser from './components/admin/ManageUser/ManagerUser.js';
import ManageOrder from './components/admin/ManageOrder/ManageOrder.js';
import Dashboard from './components/admin/DashBoard/DashBoard.js';
import OrderHistory from './components/user/Order/OrderHistory.js';

import Warranty from './components/term/Warranty.js';
import Privacy from './components/term/Privacy.js';
import PaymentSuccess from './components/user/Order/PaymentSuccess.js';

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
          <Route path="payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
          <Route path="warranty" element={<Warranty />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProduct />} />
          <Route path="orders" element={<ManageOrder />} />
          <Route path="users" element={<ManagerUser />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default App;