import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useServiceOptions } from '../hooks/useServiceOptions';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  const { siteSettings } = useSiteSettings();
  const { serviceOptions } = useServiceOptions();
  const freeDeliveryThreshold = siteSettings?.free_delivery_threshold || 350;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🍔</div>
          <h2 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream mb-2">Your cart is empty</h2>
          <p className="text-stone-400 mb-6">Add some delicious items to get started!</p>
          <button
            onClick={onContinueShopping}
            className="bg-broger-orange text-broger-ink font-semibold px-6 py-3 rounded-full hover:bg-broger-glow hover:shadow-neon-sm transition-all duration-200"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-stone-400 hover:text-broger-orange transition-colors duration-200 self-start"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-wide text-broger-cream text-center md:text-left">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-400 hover:text-red-300 transition-colors duration-200 text-sm md:text-base self-start md:self-auto"
        >
          Clear All
        </button>
      </div>

      <div className="bg-broger-coal rounded-xl shadow-sm overflow-hidden mb-4">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-3 md:p-4 ${index !== cartItems.length - 1 ? 'border-b border-cream-200' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                             <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-medium text-broger-cream mb-1">{item.name}</h3>
                {item.selectedVariation && (
                  <p className="text-xs md:text-sm text-stone-400 mb-1">Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-xs md:text-sm text-stone-400 mb-1 break-words">
                    Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity} (+₱${(addOn.price * addOn.quantity).toFixed(2)})`
                        : `${addOn.name} (+₱${addOn.price.toFixed(2)})`
                    ).join(', ')}
                  </p>
                )}
                <p className="text-sm font-semibold text-stone-300">
                  {item.selectedVariation ? `₱${(item.basePrice + item.selectedVariation.price).toFixed(2)}` : `₱${item.basePrice.toFixed(2)}`} base
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <span className="text-stone-400">
                      {' + ₱' + item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price * (addOn.quantity || 1), 0).toFixed(2) + ' add-ons'}
                    </span>
                  )}
                </p>
                <p className="text-base md:text-lg font-semibold text-broger-cream">Total: ₱{item.totalPrice} each</p>
              </div>
              
              <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-3 md:ml-4">
                <div className="flex items-center space-x-2 md:space-x-3 bg-broger-ash rounded-full p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 md:p-2 hover:bg-broger-line rounded-full transition-colors duration-200"
                  >
                    <Minus className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                  <span className="font-semibold text-broger-cream min-w-[24px] md:min-w-[32px] text-center text-sm md:text-base">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 md:p-2 hover:bg-broger-line rounded-full transition-colors duration-200"
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-base md:text-lg font-semibold text-broger-cream">₱{item.totalPrice * item.quantity}</p>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-broger-coal rounded-xl shadow-sm p-4">
            {/* Free Delivery Banner */}
            {getTotalPrice() >= freeDeliveryThreshold && serviceOptions.find(opt => opt.id === 'in-house-delivery' || opt.name.toLowerCase().includes('in-house'))?.active && (
              <div className="bg-green-500/10 border-2 border-green-500/40 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-green-300">Free In-House Delivery!</p>
                    <p className="text-xs text-green-400">Your order qualifies for free delivery for IN-HOUSE DELIVERY.</p>
                  </div>
                </div>
              </div>
            )}
        
        <div className="flex items-center justify-between text-xl md:text-2xl font-noto font-semibold text-broger-cream mb-3">
          <span>Total:</span>
          <span>₱{(getTotalPrice() || 0).toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-broger-orange text-broger-ink font-semibold py-3 md:py-4 rounded-xl hover:bg-broger-glow hover:shadow-neon-sm transition-all duration-200 transform hover:scale-[1.02] font-medium text-base md:text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;