import { Request, Response } from 'express';
import { addInventoryItem, deleteInventoryItem, fetchInventory, updateInventoryItem } from '../services/inventory.service';

export const getInventory = async (req: Request, res: Response) => {
  const inventory = await fetchInventory();
  res.json({ success: true, data: { inventory } });
};

export const addInventory = async (req: Request, res: Response) => {
  const { itemName, quantity, supplier, minimumStock } = req.body;
  if (!itemName || quantity == null || !supplier || minimumStock == null) {
    return res.status(400).json({ success: false, message: 'All inventory fields are required' });
  }

  const item = await addInventoryItem({ itemName, quantity, supplier, minimumStock });
  res.status(201).json({ success: true, data: { item } });
};

export const updateInventory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await updateInventoryItem(id, req.body);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Inventory item not found' });
  }
  res.json({ success: true, data: { item } });
};

export const deleteInventory = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteInventoryItem(id);
  res.json({ success: true, data: { message: 'Inventory item deleted' } });
};
