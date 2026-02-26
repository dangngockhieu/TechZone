import { Routes, Route } from 'react-router-dom';

import Homepage from './components/user/HomePage.js';
import NotFound from './pages/error.js';
import Login from './pages/login.js';
import ResetPassword from './pages/resetPassword.js';
import Register from './pages/register.js';
import Privacy from './components/term/Privacy.js';
import Warranty from './components/term/Warranty.js';
const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Homepage />} errorElement={<NotFound />}>
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