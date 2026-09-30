import React, { useEffect, useState } from 'react';
import Header, { NavSection } from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import AboutSection from './components/AboutSection';
import SiteFooter from './components/SiteFooter';
import FloatingCartButton from './components/FloatingCartButton';
import ReviewsDisplay from './components/ReviewsDisplay';
import { useCart } from './hooks/useCart';
import { useMenu } from './hooks/useMenu';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'cart' | 'checkout'>('home');
  const [selectedCategory, setSelectedCategory] = useState('home');
  // Section to scroll to once the home view has rendered
  const [pendingSection, setPendingSection] = useState<NavSection | null>(null);

  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();

  const { menuItems, loading } = useMenu();

  useEffect(() => {
    if (currentView !== 'home' || !pendingSection) return;
    if (pendingSection === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setPendingSection(null);
  }, [currentView, pendingSection]);

  const handleNavigate = (section: NavSection) => {
    setCurrentView('home');
    setPendingSection(section);
  };

  const handleCartClick = () => {
    setCurrentView('cart');
    window.scrollTo({ top: 0 });
  };

  const handleBackToMenu = () => handleNavigate('menu');

  const handleBackToCart = () => {
    setCurrentView('cart');
    window.scrollTo({ top: 0 });
  };

  const handleCheckout = () => {
    setCurrentView('checkout');
    window.scrollTo({ top: 0 });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin';

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen broger-chalkboard text-broger-cream flex flex-col">
      <Header
        cartItemsCount={getTotalItems()}
        onCartClick={handleCartClick}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && (
          <>
            <Hero onOrderNow={() => handleNavigate('menu')} />

            <Menu
              menuItems={menuItems}
              addToCart={addToCart}
              cartItems={cartItems}
              updateQuantity={updateQuantity}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              loading={loading}
            />

            <AboutSection />

            <div className="pb-16">
              <ReviewsDisplay />
            </div>
          </>
        )}

        {currentView === 'cart' && (
          <Cart
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            getTotalPrice={getTotalPrice}
            onContinueShopping={handleBackToMenu}
            onCheckout={handleCheckout}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            cartItems={cartItems}
            totalPrice={getTotalPrice()}
            onBack={handleBackToCart}
          />
        )}
      </main>

      <SiteFooter onNavigate={handleNavigate} />

      {currentView === 'home' && (
        <FloatingCartButton
          itemCount={getTotalItems()}
          onCartClick={handleCartClick}
        />
      )}
    </div>
  );
};

export default App;
