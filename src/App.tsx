import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import AdminLayout from './AdminLayout';
import DashboardPage from './DashboardPage';
import ProductListPage from './ProductListPage';
import ProductEditPage from './ProductEditPage';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Facing Website */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Section */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/add" element={<ProductEditPage />} />
          <Route path="products/edit/:id" element={<ProductEditPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
