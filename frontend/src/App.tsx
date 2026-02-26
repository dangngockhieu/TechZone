import { Routes, Route } from 'react-router-dom';

import Homepage from './components/user/HomePage.js';
import NotFound from './pages/error.js';
const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Homepage />} errorElement={<NotFound />}>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
  );
};

export default App;