import { Request, Response } from 'express';
import { createSaleEntry, fetchSales, fetchDailyRevenue, fetchWeeklyRevenue } from '../services/sales.service';

export const getSales = async (req: Request, res: Response) => {
  const sales = await fetchSales();
  res.json({ success: true, data: { sales } });
};

export const createSale = async (req: Request, res: Response) => {
  const { amount, saleDate } = req.body;
  if (amount == null || !saleDate) {
    return res.status(400).json({ success: false, message: 'Amount and sale date are required' });
  }

  const sale = await createSaleEntry({ amount, saleDate: new Date(saleDate) });
  res.status(201).json({ success: true, data: { sale } });
};

export const getDailyRevenue = async (req: Request, res: Response) => {
  const report = await fetchDailyRevenue();
  res.json({ success: true, data: { report } });
};

export const getWeeklyRevenue = async (req: Request, res: Response) => {
  const report = await fetchWeeklyRevenue();
  res.json({ success: true, data: { report } });
};
