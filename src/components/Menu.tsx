import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';
import { Search, Plus, Trash2 } from 'lucide-react';

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  loading?: boolean;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity, selectedCategory = 'grilledburger', onCategorySelect, loading = false }) => {
  const { categories, loading: loadingCategories } = useCategories();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [showQuantityModal, setShowQuantityModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedAddOns, setSelectedAddOns] = React.useState<Record<string, number>>({});
  const [selectedVariation, setSelectedVariation] = React.useState<string | null>(null);

  // Filter menu items based on selected category and search query
  const filteredItems = React.useMemo(() => {
    let items = selectedCategory === 'home' 
      ? menuItems 
      : menuItems.filter(item => item.category === selectedCategory);

    if (searchQuery.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [menuItems, selectedCategory, searchQuery]);

  const getCartQuantity = (item: MenuItem) => {
    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedAddOns({});
    setSelectedVariation(item.variations && item.variations.length > 0 ? item.variations[0].id : null);
    setShowQuantityModal(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      // Convert selected add-ons to array format
      const addOnsArray = Object.entries(selectedAddOns)
        .filter(([_, qty]) => qty > 0)
        .flatMap(([addOnId, qty]) => {
          const addOn = selectedItem.addOns?.find(a => a.id === addOnId);
          return addOn ? Array(qty).fill(addOn) : [];
        });
      
      // Find the selected variation object
      const variationObj = selectedVariation 
        ? selectedItem.variations?.find(v => v.id === selectedVariation)
        : undefined;
      
      addToCart(selectedItem, quantity, variationObj, addOnsArray);
      setShowQuantityModal(false);
      setSelectedItem(null);
      setQuantity(1);
      setSelectedAddOns({});
      setSelectedVariation(null);
    }
  };

  const handleCloseModal = () => {
    setShowQuantityModal(false);
    setSelectedItem(null);
    setQuantity(1);
    setSelectedAddOns({});
    setSelectedVariation(null);
  };

  const updateAddOnQuantity = (addOnId: string, newQuantity: number) => {
    setSelectedAddOns(prev => {
      if (newQuantity <= 0) {
        const { [addOnId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addOnId]: newQuantity };
    });
  };

  const handleUpdateQuantity = (item: MenuItem, quantity: number) => {
    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (cartItem) {
      updateQuantity(cartItem.id, quantity);
    }
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (cartItem) {
      updateQuantity(cartItem.id, 0);
    }
  };

  // Close search when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isSearching && !target.closest('.search-container')) {
        setIsSearching(false);
      }
    };

    if (isSearching) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearching]);

  return (
    <section id="menu" className="scroll-mt-24 pt-16">
      {/* Section heading + search */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
        <div>
          <p className="font-display font-bold text-xs tracking-[0.3em] neon-text mb-2">OUR MENU</p>
          <h2 className="font-display font-black text-3xl md:text-4xl tracking-wide text-broger-cream">
            PICK YOUR <span className="neon-text">FAVORITE</span>
          </h2>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search the menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 border border-broger-line rounded-full focus:outline-none focus:ring-2 focus:ring-broger-orange focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-broger-orange"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category tabs (sticky under the header) */}
      <div className="sticky top-16 md:top-20 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6 bg-broger-ink/95 backdrop-blur-md border-b border-broger-line">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => onCategorySelect && onCategorySelect('home')}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-colors ${selectedCategory === 'home' ? 'bg-broger-orange text-broger-ink shadow-neon-sm' : 'text-stone-400 border border-broger-line hover:text-broger-orange hover:border-broger-orange/60'}`}
          >
            ALL
          </button>
          {loadingCategories ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="w-24 h-8 bg-broger-ash rounded-full animate-pulse flex-shrink-0" />
            ))
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategorySelect && onCategorySelect(cat.id)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-broger-orange text-broger-ink shadow-neon-sm' : 'text-stone-400 border border-broger-line hover:text-broger-orange hover:border-broger-orange/60'}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name.toUpperCase()}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div>
        {searchQuery && (
          <p className="text-sm text-stone-400 mb-4">
            Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 sm:h-36 bg-broger-coal border border-broger-line rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-stone-500 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-stone-400 mb-2">No items found</h3>
            <p className="text-stone-400">
              {searchQuery ? `No menu items match "${searchQuery}"` : 'No items available in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-broger-orange text-broger-ink rounded hover:bg-broger-glow transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
            {filteredItems.map((item) => {
            const quantity = getCartQuantity(item);
            return (
              <div key={item.id} className="group bg-broger-coal rounded-2xl border border-broger-line p-3 sm:p-4 flex gap-4 hover:border-broger-orange/60 hover:shadow-neon transition-all duration-300">
                {/* Product Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-broger-ash rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-4xl">🍔</div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-display font-bold text-broger-cream text-base sm:text-lg leading-snug line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-stone-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Price + Quantity Controls */}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <div className="text-lg sm:text-xl font-extrabold text-broger-orange whitespace-nowrap">
                      ₱{item.basePrice.toFixed(2)}
                    </div>
                    {quantity > 0 ? (
                      <div className="flex items-center gap-1 bg-broger-ash border border-broger-line rounded-full p-1">
                        <button 
                          onClick={() => handleRemoveFromCart(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-red-400 hover:bg-broger-line transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="min-w-[1.5rem] text-center font-bold text-broger-cream">{quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item, quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-broger-orange text-broger-ink hover:bg-broger-glow transition-colors"
                          aria-label={`Add another ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="w-10 h-10 bg-broger-orange text-broger-ink rounded-full flex items-center justify-center hover:bg-broger-glow hover:shadow-neon-sm transition-all flex-shrink-0"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
                );
              })}
            </div>
        )}
      </div>

      {/* Quantity Selection Modal */}
      {showQuantityModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-broger-coal rounded-lg max-w-md w-full my-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="w-16 h-16 bg-broger-ash rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  {selectedItem.image ? (
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-stone-500 text-2xl">🍔</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{selectedItem.name}</h3>
                  <p className="text-stone-400 text-lg mb-2">₱{selectedItem.basePrice.toFixed(2)}</p>
                  {selectedItem.description && (
                    <p className="text-sm text-stone-400">{selectedItem.description}</p>
                  )}
                </div>
              </div>

              {/* Size Variations Section */}
              {selectedItem.variations && selectedItem.variations.length > 0 && (
                <div className="mb-6 border-t border-broger-line pt-4">
                  <h4 className="font-medium text-broger-cream mb-3">Choose Size</h4>
                  <div className="space-y-2">
                    {selectedItem.variations.map((variation) => {
                      const isSelected = selectedVariation === variation.id;
                      const variationPrice = variation.price;
                      
                      return (
                        <button
                          key={variation.id}
                          onClick={() => setSelectedVariation(variation.id)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                            isSelected
                              ? 'border-broger-orange bg-broger-ash'
                              : 'border-broger-line hover:border-broger-orange/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-broger-cream">{variation.name}</span>
                            <span className="text-sm text-stone-400">₱{variation.price.toFixed(2)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons Section */}
              {selectedItem.addOns && selectedItem.addOns.length > 0 && (
                <div className="mb-6 border-t border-broger-line pt-4">
                  <h4 className="font-medium text-broger-cream mb-3">Add-ons</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedItem.addOns.map((addOn) => {
                      const currentQty = selectedAddOns[addOn.id] || 0;
                      return (
                        <div key={addOn.id} className="flex items-center justify-between p-2 bg-broger-ash rounded-lg">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-broger-cream block">{addOn.name}</span>
                            <span className="text-xs text-stone-400">
                              {addOn.price > 0 ? `₱${addOn.price.toFixed(2)}` : 'Free'}
                            </span>
                          </div>
                          <button
                            onClick={() => updateAddOnQuantity(addOn.id, currentQty > 0 ? 0 : 1)}
                            className="px-3 py-1 bg-broger-orange text-broger-ink text-xs rounded-lg hover:bg-broger-glow transition-colors"
                          >
                            {currentQty > 0 ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4 min-w-0 w-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-broger-line rounded-full flex items-center justify-center hover:bg-broger-line"
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-broger-line rounded-full flex items-center justify-center hover:bg-broger-line"
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-broger-line rounded-lg text-stone-300 hover:bg-broger-ash"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddToCart}
                  className="flex-1 px-4 py-2 bg-broger-orange text-broger-ink rounded-lg hover:bg-broger-glow"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Menu;
