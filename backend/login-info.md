# Login Information for Steakz MIS Roles

## URL
- Frontend login page: `http://localhost:5174/login`

## Seeded user accounts

- Super Admin
  - Email: `superadmin@steakz.local`
  - Password: `SuperAdmin@123`
  - Role: `SUPER_ADMIN`
  - Notes: `SUPER_ADMIN` is the only role allowed to manage roles and permissions in the system.

- Administrator
  - Email: `admin@steakz.local`
  - Password: `Admin@123`
  - Role: `ADMIN`

- Chain Owner
  - Email: `owner@steakz.local`
  - Password: `Owner@123`
  - Role: `CHAIN_OWNER`

- Operations Director
  - Email: `operations.director@steakz.local`
  - Password: `Operations@123`
  - Role: `OPERATIONS_DIRECTOR`

- Regional Manager
  - Email: `regional.manager@steakz.local`
  - Password: `Regional@123`
  - Role: `REGIONAL_MANAGER`

- Branch Manager
  - Email: `branch.manager@steakz.local`
  - Password: `Branch@123`
  - Role: `BRANCH_MANAGER`

- Kitchen Manager
  - Email: `kitchen.manager@steakz.local`
  - Password: `Kitchen@123`
  - Role: `KITCHEN_MANAGER`

- Inventory Manager
  - Email: `inventory.manager@steakz.local`
  - Password: `Inventory@123`
  - Role: `INVENTORY_MANAGER`

- Finance Manager
  - Email: `finance.manager@steakz.local`
  - Password: `Finance@123`
  - Role: `FINANCE_MANAGER`

- HR Manager
  - Email: `hr.manager@steakz.local`
  - Password: `HR@123`
  - Role: `HR_MANAGER`

- Marketing Manager
  - Email: `marketing.manager@steakz.local`
  - Password: `Marketing@123`
  - Role: `MARKETING_MANAGER`

- Supervisor
  - Email: `supervisor@steakz.local`
  - Password: `Supervisor@123`
  - Role: `SUPERVISOR`

- Cashier
  - Email: `cashier@steakz.local`
  - Password: `Cashier@123`
  - Role: `CASHIER`

- Waiter
  - Email: `waiter@steakz.local`
  - Password: `Waiter@123`
  - Role: `WAITER`

- Chef
  - Email: `chef@steakz.local`
  - Password: `Chef@123`
  - Role: `CHEF`

- Kitchen Staff
  - Email: `kitchen.staff@steakz.local`
  - Password: `KitchenStaff@123`
  - Role: `KITCHEN_STAFF`

- Receptionist
  - Email: `receptionist@steakz.local`
  - Password: `Receptionist@123`
  - Role: `RECEPTIONIST`

- Delivery Driver
  - Email: `driver@steakz.local`
  - Password: `Driver@123`
  - Role: `DELIVERY_DRIVER`

- Accountant
  - Email: `accountant@steakz.local`
  - Password: `Accountant@123`
  - Role: `ACCOUNTANT`

- Customer Support
  - Email: `support@steakz.local`
  - Password: `Support@123`
  - Role: `CUSTOMER_SUPPORT`

## Sample Employees
- Maria Lopez
  - Email: `maria.lopez@steakz.local`
  - Password: `Employee@123`
  - Role: `WAITER`
- Jamal Carter
  - Email: `jamal.carter@steakz.local`
  - Password: `Employee@123`
  - Role: `CHEF`
- Nina Patel
  - Email: `nina.patel@steakz.local`
  - Password: `Employee@123`
  - Role: `RECEPTIONIST`

## Sample Inventory Records
- `Premium Ribeye Steak` — quantity 120, supplier `Steakz Meats Co.`, minimum stock 30
- `Chicken Breasts` — quantity 220, supplier `FreshFarm Poultry`, minimum stock 40
- `Tomato Sauce` — quantity 85, supplier `Italian Pantry Ltd.`, minimum stock 20
- `Olive Oil` — quantity 60, supplier `Mediterranean Imports`, minimum stock 15
- `Fresh Lettuce` — quantity 45, supplier `Greens & Herbs Co.`, minimum stock 20

## Sample Order Records
- Order for `Diana Rivera` — total $140.75, status `COMPLETED`, taken by `waiter@steakz.local`
- Order for `Jason Kim` — total $98.50, status `COMPLETED`, taken by `waiter@steakz.local`

## Sample Payroll Records
- `chef@steakz.local` — $2,345.00 for period `2026-05-01` to `2026-05-15`
- `waiter@steakz.local` — $1,520.00 for period `2026-05-01` to `2026-05-15`
- `accountant@steakz.local` — $2,760.00 for period `2026-05-01` to `2026-05-15`

## Notes
- These accounts are seeded at backend startup when roles and permissions are created.
- Use `http://localhost:5174/login` to access the frontend.
- `ADMIN` now has full admin permissions including user and inventory management.
