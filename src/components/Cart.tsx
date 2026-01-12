import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

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
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center py-20 bg-gray-50 border border-secondary/5">
          <div className="text-8xl mb-8 opacity-20 grayscale">📦</div>
          <h2 className="text-4xl font-black text-secondary mb-4 uppercase tracking-tight">Your Gear Bag is Empty</h2>
          <p className="text-gray-500 mb-10 font-medium">Ready for your next adventure? Browse our premium equipment.</p>
          <button
            onClick={onContinueShopping}
            className="bg-primary text-white px-12 py-5 font-black uppercase tracking-widest hover:bg-secondary transition-all duration-500 shadow-xl"
          >
            Explore Equipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-6 border-b-4 border-secondary pb-8">
        <div>
          <h1 className="text-5xl font-black text-secondary uppercase tracking-tighter">Your Bag</h1>
          <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-2">Reserved Premium Equipment</p>
        </div>

        <div className="flex items-center space-x-8">
          <button
            onClick={onContinueShopping}
            className="group flex items-center space-x-2 text-secondary font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={clearCart}
            className="text-gray-400 hover:text-red-600 font-black uppercase tracking-widest text-[10px] transition-colors"
          >
            Empty Bag
          </button>
        </div>
      </div>

      <div className="bg-white border border-secondary/10 mb-12">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-8 sm:p-10 ${index !== cartItems.length - 1 ? 'border-b border-secondary/10' : ''}`}>
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-black text-secondary uppercase tracking-tight mb-2">{item.name}</h3>
                  {item.selectedVariation && (
                    <span className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-1 tracking-widest mb-2 mr-2">
                      {item.selectedVariation.name}
                    </span>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.selectedAddOns.map((addOn, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-500 uppercase border border-gray-200 px-2 py-0.5">
                          {addOn.quantity && addOn.quantity > 1 ? `${addOn.name} x${addOn.quantity}` : addOn.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center bg-secondary text-white p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-primary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-black w-8 text-center text-lg">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-secondary">₱{(item.totalPrice * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-black text-secondary uppercase tracking-tight mb-2">{item.name}</h3>
                <div className="flex items-center gap-3">
                  {item.selectedVariation && (
                    <span className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 tracking-widest">
                      {item.selectedVariation.name}
                    </span>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.selectedAddOns.map((addOn, i) => (
                        <span key={i} className="text-[10px] font-bold text-gray-500 uppercase border border-gray-200 px-3 py-1">
                          {addOn.quantity && addOn.quantity > 1 ? `${addOn.name} x${addOn.quantity}` : addOn.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-12">
                <div className="text-right min-w-[120px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</p>
                  <p className="text-xl font-bold text-secondary">₱{item.totalPrice.toLocaleString()}</p>
                </div>

                <div className="flex items-center bg-secondary text-white p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-3 hover:bg-primary transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-black w-10 text-center text-xl">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-3 hover:bg-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right min-w-[150px]">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Subtotal</p>
                  <p className="text-3xl font-black text-secondary">₱{(item.totalPrice * item.quantity).toLocaleString()}</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-gray-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-white">
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-50 mb-2">Total Rental Investment</p>
          <p className="text-6xl font-black">₱{(getTotalPrice() || 0).toLocaleString()}</p>
        </div>

        <button
          onClick={onCheckout}
          className="w-full md:w-auto bg-primary text-white px-16 py-6 font-black text-lg uppercase tracking-[0.2em] hover:bg-white hover:text-secondary transition-all duration-500 shadow-2xl"
        >
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default Cart;