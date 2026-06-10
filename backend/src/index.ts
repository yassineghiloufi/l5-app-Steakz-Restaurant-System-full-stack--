import app from './app';
import dotenv from 'dotenv';
import { ensureDefaultRoleUsers, ensureSampleBusinessData } from './services/user.service';
import { seedRolesAndPermissions } from './services/rbac.service';

dotenv.config();

const port = process.env.PORT || 4000;

const startServer = async () => {
  // Optionally seed RBAC and sample data. Set RUN_SEED=true to run seeds in production.
  if (process.env.RUN_SEED === 'true') {
    await seedRolesAndPermissions();
    await ensureDefaultRoleUsers();
    await ensureSampleBusinessData();
  }

  app.listen(port, () => {
    console.log(`Steakz MIS backend running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
