import { Request, Response } from 'express';
import prisma from '../services/prismaClient';
import { createOrder, fetchBranches, fetchMenuItems } from '../services/operations.service';

export const getPublicBranches = async (req: Request, res: Response) => {
  try {
    const branches = await fetchBranches();
    return res.json({ success: true, data: { branches } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch branches' });
  }
};

export const getPublicMenu = async (req: Request, res: Response) => {
  try {
    const defaultChain = await prisma.chain.findUnique({ where: { code: 'DEFAULT_CHAIN' } });
    const chainId = defaultChain?.id;
    const menuItems = await fetchMenuItems(chainId);
    return res.json({ success: true, data: { menuItems } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch menu items' });
  }
};

export const getCustomerProfile = async (req: Request, res: Response) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email parameter is required' });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        loyaltyPoints: true,
      },
    });

    return res.json({ success: true, data: { customer } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch customer profile' });
  }
};

export const placeCustomerOrder = async (req: Request, res: Response) => {
  const { name, email, phone, branchId, items } = req.body;

  if (!email || !name || !branchId || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, branch ID, and order items are required',
    });
  }

  try {
    // 1. Get default chain to link the customer to
    const defaultChain = await prisma.chain.findUnique({ where: { code: 'DEFAULT_CHAIN' } });
    if (!defaultChain) {
      return res.status(500).json({ success: false, message: 'Default chain not found in system' });
    }

    // 2. Find or create the customer
    let customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          email,
          phone: phone || null,
          chainId: defaultChain.id,
          loyaltyPoints: 0,
        },
      });
    } else {
      // Update details if they have changed or were not set
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name,
          phone: phone || customer.phone,
        },
      });
    }

    // 3. Create the order
    const order = await createOrder({
      branchId,
      customerId: customer.id,
      status: 'PENDING',
      items,
    });

    // 4. Award loyalty points (e.g., 1 point per $10 spent)
    const pointsEarned = Math.floor((order.total || 0) / 10);
    if (pointsEarned > 0) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          loyaltyPoints: {
            increment: pointsEarned,
          },
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        order,
        customer,
        pointsEarned,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to place order' });
  }
};
