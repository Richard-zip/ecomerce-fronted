import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SellerProfilePage } from './pages/SellerProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CartPage } from './pages/CartPage';
import { MyPurchasesPage } from './pages/MyPurchasesPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { RequestsPage } from './pages/RequestsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#F5F7FA] dark:bg-[#0B1523] text-[#1F2933] dark:text-[#E2E8F0] antialiased font-sans transition-colors duration-150">
              {/* Navbar */}
              <Navbar />

            {/* Main view container */}
            <main className="flex-1">
              <ErrorBoundary>
                <Routes>
                  {/* Catálogo e Inicio */}
                  <Route path="/" element={<HomePage />} />

                  {/* Mural Se Busca / Peticiones Estudiantiles */}
                  <Route path="/requests" element={<RequestsPage />} />
                  <Route path="/se-busca" element={<Navigate to="/requests" replace />} />

                  {/* Detalle de Producto (plural y singular) */}
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />

                  {/* Perfil Público de Vendedor (plural y singular con id) */}
                  <Route path="/sellers/:id" element={<SellerProfilePage />} />
                  <Route path="/seller/:id" element={<SellerProfilePage />} />

                  {/* Autenticación */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ForgotPasswordPage />} />

                  {/* Compras y Reservas */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<MyPurchasesPage />} />
                  <Route path="/purchases" element={<Navigate to="/orders" replace />} />

                  {/* Panel de Vendedor y Aliases de Navegación */}
                  <Route path="/seller" element={<SellerDashboardPage />} />
                  <Route path="/vendedor" element={<Navigate to="/seller" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/seller" replace />} />
                  <Route path="/seller/products" element={<Navigate to="/seller" replace />} />
                  <Route path="/seller/dashboard" element={<Navigate to="/seller" replace />} />
                  <Route path="/crear-producto" element={<Navigate to="/seller?action=new" replace />} />
                  <Route path="/products/create" element={<Navigate to="/seller?action=new" replace />} />
                  <Route path="/products/new" element={<Navigate to="/seller?action=new" replace />} />

                  {/* Perfil de Usuario */}
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* 404 No encontrado */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ErrorBoundary>
            </main>

            {/* University footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
};

export default App;
