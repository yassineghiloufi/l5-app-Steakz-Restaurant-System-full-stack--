import { FormEvent, useEffect, useState } from 'react';
import api from '../api';

const Menu = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('');

  const loadMenuItems = async () => {
    try {
      const response = await api.get('/operations/menu');
      setMenuItems(response.data.data.menuItems);
    } catch {
      setMenuItems([]);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await api.get('/operations/branches');
      const branchList = response.data.data.branches;
      setBranches(branchList);
      setBranchId(branchList[0]?.id || '');
    } catch {
      setBranches([]);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/operations/customers');
      const customerList = response.data.data.customers;
      setCustomers(customerList);
      setCustomerId(customerList[0]?.id || '');
    } catch {
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadMenuItems();
    loadBranches();
    loadCustomers();
  }, []);

  const addToCart = (item: any) => {
    setMessage('');
    setCartItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((current) =>
      current
        .map((entry) => (entry.id === itemId ? { ...entry, quantity } : entry))
        .filter((entry) => entry.quantity > 0)
    );
  };

  const removeCartItem = (itemId: string) => {
    setCartItems((current) => current.filter((entry) => entry.id !== itemId));
  };

  const orderTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!branchId || cartItems.length === 0) {
      setMessage('Please choose a branch and add at least one menu item.');
      return;
    }

    await api.post('/operations/orders', {
      branchId,
      customerId: customerId || undefined,
      status,
      items: cartItems.map((entry) => ({ menuItemId: entry.id, quantity: entry.quantity })),
    });

    setCartItems([]);
    setStatus('PENDING');
    setMessage('Menu order created successfully.');
  };

  return (
    <div className="p-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Menu Ordering</h1>
            <p className="mt-2 text-sm text-slate-500">
              Select menu items, adjust quantities, and create an order for a customer or guest.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Menu</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {menuItems.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Create Order</h2>
          {message && <p className="mt-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-800">{message}</p>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Branch</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="mt-2 w-full rounded-xl border px-3 py-2"
                required
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-2 w-full rounded-xl border px-3 py-2"
              >
                <option value="">Guest</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border px-3 py-2"
              >
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="rounded-2xl border p-4">
              <h3 className="text-lg font-semibold">Cart</h3>
              {cartItems.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Add menu items to the cart to build an order.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="w-20 rounded-xl border px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Order Total</span>
                <span className="font-semibold">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Place Menu Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Menu;
