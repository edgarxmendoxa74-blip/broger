import React, { useState } from 'react';
import { ArrowLeft, Clock, Info } from 'lucide-react';
import { CartItem, PaymentMethod } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useServiceOptions } from '../hooks/useServiceOptions';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useSidebarContent } from '../hooks/useSidebarContent';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const { serviceOptions } = useServiceOptions();
  const { siteSettings } = useSiteSettings();
  const { content: storeInfo } = useSidebarContent();
  const freeDeliveryThreshold = siteSettings?.free_delivery_threshold || 350;
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<string>(serviceOptions.length > 0 ? serviceOptions[0].id : '');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  // Set default service type when service options are loaded
  React.useEffect(() => {
    if (serviceOptions.length > 0 && !serviceType) {
      setServiceType(serviceOptions[0].id);
    }
  }, [serviceOptions, serviceType]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  // Calculate delivery fee
  const calculateDeliveryFee = () => {
    // Get the selected service option
    const selectedService = serviceOptions.find(opt => opt.id === serviceType);
    const serviceName = selectedService?.name || '';

    // Only apply fee for In-House Delivery
    const isInHouseDelivery = serviceType === 'in-house-delivery' || serviceName.toLowerCase().includes('in-house');

    const needsDeliveryFee = isInHouseDelivery && totalPrice < freeDeliveryThreshold;

    // Debug logging
    console.log('=== DELIVERY FEE DEBUG ===');
    console.log('Service Type ID:', serviceType);
    console.log('Service Name:', serviceName);
    console.log('Is In-House Delivery:', isInHouseDelivery);
    console.log('Total Price:', totalPrice);
    console.log('Free Delivery Threshold:', freeDeliveryThreshold);
    console.log('Needs Delivery Fee:', needsDeliveryFee);
    console.log('========================');

    return needsDeliveryFee ? 40 : 0;
  };

  const deliveryFee = calculateDeliveryFee();
  const finalTotal = totalPrice + deliveryFee;
  
  // Debug logging for final values
  console.log('Delivery Fee:', deliveryFee);
  console.log('Final Total:', finalTotal);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const selectedService = serviceOptions.find(opt => opt.id === serviceType);
    const serviceName = selectedService?.name || serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
    
    const lowerServiceType = serviceType.toLowerCase();
    const isPickup = lowerServiceType.includes('pickup');
    const timeInfo = isPickup 
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';
    
    const orderDetails = `
🛒 Bro-Ger ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceName}
${!isPickup ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}
${isPickup ? `⏰ Pickup Time: ${timeInfo}` : ''}


📋 ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

💰 TOTAL: ₱${finalTotal}
${deliveryFee > 0 ? `🛵 DELIVERY FEE: ₱${deliveryFee}` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
📸 Payment Screenshot: Please attach your payment receipt screenshot

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing Bro-Ger! 🥟
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/110122211630459?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
  };

  const isDetailsValid = (() => {
    const hasName = customerName && contactNumber;
    const lowerServiceType = serviceType.toLowerCase();
    const isPickup = lowerServiceType.includes('pickup');
    
    return hasName && 
      (!isPickup ? address : true) && 
      (!isPickup || (pickupTime !== 'custom' || customTime));
  })();

  if (step === 'details') {
    return (
      <div className="w-full max-w-5xl mx-auto py-10">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-stone-400 hover:text-broger-orange transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream ml-4">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Order Summary */}
          <div className="bg-broger-coal rounded-xl shadow-sm p-4">
            <h2 className="text-xl font-display font-extrabold tracking-wide text-broger-cream mb-4">Order Summary</h2>
            
            {/* Free Delivery Banner */}
            {totalPrice >= freeDeliveryThreshold && serviceOptions.find(opt => opt.id === 'in-house-delivery' || opt.name.toLowerCase().includes('in-house'))?.active && (
              <div className="bg-green-500/10 border-2 border-green-500/40 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-green-300">Free In-House Delivery!</p>
                    <p className="text-xs text-green-400">Your order qualifies for free delivery for IN-HOUSE DELIVERY.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-broger-line">
                  <div>
                    <h4 className="font-medium text-broger-cream">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-stone-400">Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-stone-400">
                        Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-stone-400">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-broger-cream">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-broger-line pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-lg text-stone-300">
                  <span>Subtotal:</span>
                  <span>₱{totalPrice}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-lg text-stone-300">
                    <span>Delivery Fee:</span>
                    <span>₱{deliveryFee}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-2xl font-noto font-semibold text-broger-cream">
                <span>Total:</span>
                <span>₱{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-broger-coal rounded-xl shadow-sm p-4">
            <h2 className="text-xl font-display font-extrabold tracking-wide text-broger-cream mb-4">Customer Information</h2>
            
            <form className="space-y-4">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-broger-cream mb-3">Service Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {serviceOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setServiceType(option.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 w-full ${
                        serviceType === option.id
                          ? 'border-broger-orange bg-broger-orange text-broger-ink shadow-neon-sm'
                          : 'border-broger-line bg-broger-coal text-stone-300 hover:border-broger-orange/60 hover:bg-broger-ash'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-sm font-bold tracking-wide">{option.name}</span>
                    </button>
                  ))}
                </div>
                
                {/* Service Information */}
                <div className="mt-4 space-y-3">
                  {(() => {
                    const selectedService = serviceOptions.find(opt => opt.id === serviceType);
                    if (selectedService?.description) {
                      return (
                        <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-medium text-sky-200 mb-1">{selectedService.name} Information</h4>
                              <p className="text-sm text-sky-300">{selectedService.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Delivery / pickup details (editable in Admin → Sidebar Content) */}
                  {(() => {
                    const info = serviceType.includes('delivery')
                      ? { title: 'Delivery Area', text: storeInfo.deliveryInfo }
                      : serviceType.includes('pickup')
                        ? { title: 'Pickup Details', text: storeInfo.pickupInfo }
                        : null;
                    if (!info?.text) return null;
                    return (
                      <div className="bg-broger-orange/10 border border-broger-orange/40 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-broger-orange mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-broger-orange mb-1">{info.title}</h4>
                            <p className="text-sm text-stone-300">{info.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Delivery Fee Notice */}
                  {deliveryFee > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-200 mb-1">Delivery Fee</h4>
                          <p className="text-sm text-amber-300">
                            A ₱{deliveryFee} delivery fee will be added to your order. 
                            Free delivery for orders ₱{freeDeliveryThreshold} and above.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Pickup Time Selection */}
              {serviceType.includes('pickup') && (
                <div>
                  <label className="block text-sm font-medium text-broger-cream mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 minutes' },
                        { value: '15-20', label: '15-20 minutes' },
                        { value: '25-30', label: '25-30 minutes' },
                        { value: 'custom', label: 'Custom Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-sm flex flex-col items-center justify-center min-h-[80px] ${
                            pickupTime === option.value
                              ? 'border-broger-orange bg-broger-orange text-broger-ink shadow-lg scale-[1.02]'
                              : 'border-broger-line bg-broger-coal text-stone-300 hover:border-broger-orange/60 hover:bg-broger-ash hover:shadow-md'
                          }`}
                        >
                          <Clock className={`h-5 w-5 mb-2 ${pickupTime === option.value ? 'text-broger-ink' : 'text-stone-400'}`} />
                          <span className="font-medium">{option.label}</span>
                          {pickupTime === option.value && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-broger-coal rounded-full flex items-center justify-center shadow-lg">
                              <div className="w-2 h-2 bg-broger-orange rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent transition-all duration-200"
                        placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {!serviceType.toLowerCase().includes('pickup') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-broger-cream mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent transition-all duration-200"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-broger-cream mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent transition-all duration-200"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'bg-broger-orange text-broger-ink hover:bg-broger-glow hover:scale-[1.02]'
                    : 'bg-broger-line text-stone-400 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <div className="flex items-center mb-4">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-stone-400 hover:text-broger-orange transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream ml-4">Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Payment Method Selection */}
        <div className="bg-broger-coal rounded-xl shadow-sm p-4">
          <h2 className="text-xl font-display font-extrabold tracking-wide text-broger-cream mb-4">Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
            {paymentMethods.map((method) => (
              <div key={method.id}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                    paymentMethod === method.id
                      ? 'border-broger-orange bg-broger-orange text-broger-ink'
                      : 'border-broger-line bg-broger-coal text-stone-300 hover:border-broger-orange/60'
                  }`}
                >
                  <span className="text-2xl">💳</span>
                  <span className="font-medium">{method.name}</span>
                </button>
                {method.id === 'cash-on-delivery' && paymentMethod === 'cash-on-delivery' && (
                  <div className="mt-2 ml-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                    <p className="text-xs font-medium text-amber-300">
                      ⚠️ For repeated customers only
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && selectedPaymentMethod.id !== 'cash-on-delivery' && (
            <div className="bg-broger-ash rounded-lg p-4 mb-4">
              <h3 className="font-medium text-broger-cream mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-stone-400 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-broger-cream font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-stone-400 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-xl font-semibold text-broger-cream">Amount: ₱{finalTotal}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-broger-line shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-stone-400 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Reference Number */}
          {selectedPaymentMethod && selectedPaymentMethod.id !== 'cash-on-delivery' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <h4 className="font-medium text-broger-cream mb-2">📸 Payment Proof Required</h4>
              <p className="text-sm text-stone-300">
                After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-broger-coal rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream mb-6">Final Order Summary</h2>
          
          {/* Free Delivery Banner */}
          {totalPrice >= freeDeliveryThreshold && serviceOptions.find(opt => opt.id === 'in-house-delivery' || opt.name.toLowerCase().includes('in-house'))?.active && (
            <div className="bg-green-500/10 border-2 border-green-500/40 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-green-300">Free In-House Delivery!</p>
                  <p className="text-xs text-green-400">Your order qualifies for free delivery for IN-HOUSE DELIVERY.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4 mb-6">
            <div className="bg-broger-ash rounded-lg p-4">
              <h4 className="font-medium text-broger-cream mb-2">Customer Details</h4>
              <p className="text-sm text-stone-400">Name: {customerName}</p>
              <p className="text-sm text-stone-400">Contact: {contactNumber}</p>
              <p className="text-sm text-stone-400">Service: {serviceOptions.find(opt => opt.id === serviceType)?.name || serviceType}</p>
              {!serviceType.toLowerCase().includes('pickup') && (
                <>
                  <p className="text-sm text-stone-400">Address: {address}</p>
                  {landmark && <p className="text-sm text-stone-400">Landmark: {landmark}</p>}
                </>
              )}
              {serviceType.includes('pickup') && (
                <p className="text-sm text-stone-400">
                  Pickup Time: {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-broger-line">
                <div>
                  <h4 className="font-medium text-broger-cream">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-stone-400">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-stone-400">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-stone-400">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-semibold text-broger-cream">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-broger-line pt-4 mb-6">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-lg text-stone-300">
                <span>Subtotal:</span>
                <span>₱{totalPrice}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex items-center justify-between text-lg text-stone-300">
                  <span>Delivery Fee:</span>
                  <span>₱{deliveryFee}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-2xl font-noto font-semibold text-broger-cream">
              <span>Total:</span>
              <span>₱{finalTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform bg-broger-orange text-broger-ink hover:bg-broger-glow hover:scale-[1.02]"
          >
            Click here to place your order
          </button>
          
          <p className="text-xs text-stone-400 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;