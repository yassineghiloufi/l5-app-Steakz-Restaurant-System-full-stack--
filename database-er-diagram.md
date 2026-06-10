# Database ER Diagram

## Models

- User
  - id
  - name
  - email
  - password
  - role
  - createdAt
  - updatedAt

- Inventory
  - id
  - itemName
  - quantity
  - supplier
  - minimumStock
  - updatedAt

- Sale
  - id
  - amount
  - saleDate
  - createdAt

- Task
  - id
  - title
  - description
  - assignedTo (User relation)
  - status
  - createdAt
  - updatedAt

## Relationships
- `Task.assignedTo` references `User.id`
- Users do not own inventory or sales records directly in this initial design, simplifying reporting and role-based access.

## Diagram

The ER design is intentionally simple and focused on key MIS requirements for a restaurant chain: user management, inventory, sales reporting, and task assignment across OWNER, HEADQUARTERS_MANAGER, BRANCH_MANAGER, STAFF, ACCOUNTANT, and INVENTORY_CLERK roles.
