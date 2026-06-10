import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import inventoryRoutes from './routes/inventory.routes';
import salesRoutes from './routes/sales.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import operationsRoutes from './routes/operations.routes';
import customerRoutes from './routes/customer.routes';
import errorHandler from './middleware/errorHandler';

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5174';
app.use(
	cors({
		origin: allowedOrigin,
		credentials: true,
	}),
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/customer', customerRoutes);

app.use(errorHandler);

export default app;
