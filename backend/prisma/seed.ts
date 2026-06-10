import { seedRolesAndPermissions } from '../src/services/rbac.service';
import { ensureDefaultRoleUsers, ensureSampleBusinessData } from '../src/services/user.service';

const runSeed = async () => {
  try {
    await seedRolesAndPermissions();
    await ensureDefaultRoleUsers();
    await ensureSampleBusinessData();
    console.log('RBAC and sample business data seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

runSeed();
