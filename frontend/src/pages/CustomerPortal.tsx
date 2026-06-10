import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

interface Branch {
  id: string;
  name: string;
  code: string;
  region?: string;
  address?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const CustomerPortal = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  // Customer info
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);

  // Cart & UI states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const branchesRes = await api.get('/customer/branches');
        const branchesList = branchesRes.data.data.branches;
        setBranches(branchesList);
        if (branchesList.length > 0) {
          setSelectedBranchId(branchesList[0].id);
        }

        const menuRes = await api.get('/customer/menu');
        setMenuItems(menuRes.data.data.menuItems);
      } catch (err: any) {
        setError('Failed to load menu or branch information.');
        console.error(err);
      }
    };
    loadData();
  }, []);

  // Check email on blur to retrieve profile & loyalty points
  const handleEmailBlur = async () => {
    if (!email || !email.trim().includes('@')) return;
    try {
      const response = await api.get(`/customer/profile/${encodeURIComponent(email.trim())}`);
      if (response.data.success && response.data.data.customer) {
        const customer = response.data.data.customer;
        setName(customer.name || '');
        setPhone(customer.phone || '');
        setLoyaltyPoints(customer.loyaltyPoints);
      } else {
        setLoyaltyPoints(0);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((current) => current.filter((item) => item.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Loyalty points discount calculation:
  // Let's say 50 loyalty points can be redeemed for $5 discount, up to the subtotal amount
  const redeemDiscount = loyaltyPoints && loyaltyPoints >= 50 ? Math.min(Math.floor(loyaltyPoints / 50) * 5, subtotal) : 0;
  const grandTotal = Math.max(0, subtotal - redeemDiscount);

  const handleSubmitOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) {
      setError('Please select a restaurant branch.');
      return;
    }
    if (cart.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/customer/orders', {
        name,
        email,
        phone,
        branchId: selectedBranchId,
        items: cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
      });

      if (response.data.success) {
        setPlacedOrderDetails(response.data.data.order);
        setPointsEarned(response.data.data.pointsEarned);
        setOrderPlaced(true);
        clearCart();
      } else {
        setError('Failed to place order.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while placing your order.');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on category tabs and search bar query
  const categories = ['All', ...Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)))];
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl border border-emerald-50 transition-all duration-300">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-10 w-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Order Placed Successfully!</h2>
          <p className="mt-2 text-slate-500">Thank you for dining with Steakz. We are preparing your order.</p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left border border-slate-100">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-semibold text-slate-700">Order Reference</span>
              <span className="font-mono text-sm text-slate-500 bg-white border px-3 py-1 rounded-md">{placedOrderDetails?.id}</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Branch</span>
                <span className="font-medium text-slate-700">{branches.find(b => b.id === selectedBranchId)?.name || 'Steakz Outlet'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Customer Email</span>
                <span className="font-medium text-slate-700">{email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Loyalty Points Earned</span>
                <span className="font-semibold text-amber-600">+{pointsEarned} points</span>
              </div>
              <div className="flex justify-between border-t pt-4 text-base font-bold text-slate-900">
                <span>Total Amount Charged</span>
                <span>${placedOrderDetails?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setOrderPlaced(false);
              setPlacedOrderDetails(null);
              setEmail('');
              setName('');
              setPhone('');
              setLoyaltyPoints(null);
            }}
            className="mt-8 w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg hover:bg-slate-800 transition-all"
          >
            Order Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Premium Hero Header */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-slate-900 py-12 px-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 via-red-950/20 to-slate-900/90 mix-blend-multiply" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/30">
            🥩 Culinary Excellence
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Steakz Signature Ordering</h1>
          <p className="mt-4 text-lg text-slate-300">
            Choose your branch, customize your legendary steak order, and get ready for a sensational feast.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Left Column: Customer details and Menu */}
        <div className="space-y-8">
          {/* Customer info card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-lg">👤</span> Customer Contact Information
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="name@example.com"
                  className="rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-sm h-11"
                  required
                />
                <p className="mt-1 text-xs text-slate-400">Enter your email and click outside to load your profile and loyalty status.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-sm h-11"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-123-4567"
                  className="rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-sm h-11"
                />
              </div>
            </div>

            {loyaltyPoints !== null && (
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-100 p-4 transition-all duration-300 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Steakz Gold Loyalty Member</h4>
                    <p className="text-xs text-amber-700">You earn points on every order you place!</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs uppercase tracking-wider font-semibold text-amber-600">Points Balance</span>
                  <span className="text-xl font-black text-amber-900">{loyaltyPoints} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Menu Catalog Section */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Explore the Menu</h2>
                <p className="text-slate-500 text-sm">Select fresh, delicious items to build your plate.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search steaks, sides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 bg-slate-50 text-sm h-10"
                />
              </div>
            </div>

            {/* Categories scroll menu */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {filteredMenuItems.length === 0 ? (
                <p className="col-span-2 text-center text-slate-400 py-12">No menu items found match your criteria.</p>
              ) : (
                filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-100 p-5 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 uppercase tracking-wider mb-2">
                            {item.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition">
                            {item.name}
                          </h3>
                        </div>
                        <span className="font-extrabold text-slate-900">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="mt-5 w-full rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-900 hover:text-white transition py-2 text-xs font-bold"
                    >
                      ➕ Add to Order
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout cart */}
        <div className="space-y-6">
          <div className="sticky top-6 rounded-3xl bg-white p-6 shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between border-b pb-4">
              <span>🛒 Shopping Bag</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                {cart.reduce((count, item) => count + item.quantity, 0)} items
              </span>
            </h2>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Branch Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pickup Branch</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50 text-sm h-11"
                  required
                >
                  {branches.length === 0 ? (
                    <option value="">No branches available</option>
                  ) : (
                    branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.region || 'Steakz'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Cart List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-3 opacity-60">🍽️</span>
                    <p className="text-sm font-semibold text-slate-400">Your bag is empty.</p>
                    <p className="text-xs text-slate-400 mt-1">Select meals on the left to fill your plate.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-4 flex justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                        <span className="text-xs text-slate-500">${item.price.toFixed(2)} each</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-transparent hover:bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center p-0 rounded-l-lg border-0"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-transparent hover:bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center p-0 rounded-r-lg border-0"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="bg-transparent text-slate-400 hover:text-rose-600 p-1 rounded-md"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Calculations */}
              {cart.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {redeemDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-semibold bg-emerald-50/50 p-2 rounded-lg">
                      <span>Redeemed loyalty discount</span>
                      <span>-${redeemDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-3 text-lg font-black text-slate-900">
                    <span>Estimated Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cart.length === 0 || !email || !name}
                className={`w-full rounded-2xl py-3 font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading || cart.length === 0 || !email || !name
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm & Send Order'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
