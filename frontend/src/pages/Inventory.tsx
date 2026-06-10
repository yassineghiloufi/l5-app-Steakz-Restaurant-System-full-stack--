import { FormEvent, useEffect, useState } from 'react';
import api from '../api';
import { PERMISSIONS } from '../constants/permissions';
import { hasPermission } from '../utils/auth';

const Inventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [minimumStock, setMinimumStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data.data.inventory);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAddInventory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/inventory', { itemName, quantity, supplier, minimumStock });
      setItemName('');
      setQuantity(0);
      setSupplier('');
      setMinimumStock(0);
      await loadInventory();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not add inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!confirm('Delete this inventory item?')) return;
    setLoading(true);
    try {
      await api.delete(`/inventory/${id}`);
      await loadInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Inventory Management</h1>
          <p className="mt-2 text-slate-600">Track stock and manage inventory items based on your assigned permissions.</p>
        </div>
      </div>

      {hasPermission(PERMISSIONS.INVENTORY_CREATE) && (
        <form onSubmit={handleAddInventory} className="my-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add Inventory Item</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Item Name</span>
              <input value={itemName} onChange={(e) => setItemName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Steak Seasoning" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Quantity</span>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="0" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Supplier</span>
              <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Local Farm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Minimum Stock</span>
              <input type="number" value={minimumStock} onChange={(e) => setMinimumStock(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="0" />
            </label>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {inventory.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{item.itemName}</h2>
                <p className="mt-2 text-sm text-slate-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-slate-600">Supplier: {item.supplier}</p>
                <p className="text-sm text-slate-600">Minimum stock: {item.minimumStock}</p>
              </div>
              {hasPermission(PERMISSIONS.INVENTORY_DELETE) && (
                <button onClick={() => handleDeleteInventory(item.id)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
