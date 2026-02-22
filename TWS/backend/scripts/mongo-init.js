// MongoDB initialization script
db = db.getSiblingDB('wolfstack-portal');

// Create collections
db.createCollection('users');
db.createCollection('employees');
db.createCollection('attendance');
db.createCollection('tasks');
db.createCollection('boards');
db.createCollection('lists');
db.createCollection('payrollrecords');
db.createCollection('payrollrules');
db.createCollection('payrollcycles');
db.createCollection('transactions');
db.createCollection('accounts');
db.createCollection('invoices');
db.createCollection('clients');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });

db.employees.createIndex({ employeeId: 1 }, { unique: true });
db.employees.createIndex({ userId: 1 }, { unique: true });
db.employees.createIndex({ department: 1 });

db.attendance.createIndex({ userId: 1, date: 1 });
db.attendance.createIndex({ employeeId: 1, date: 1 });

db.tasks.createIndex({ boardId: 1, listId: 1 });
db.tasks.createIndex({ assignees: 1 });

db.boards.createIndex({ teamId: 1 });

db.payrollrecords.createIndex({ employeeId: 1, periodStart: 1, periodEnd: 1 });

db.transactions.createIndex({ type: 1, date: 1 });
db.transactions.createIndex({ accountId: 1 });

print('Database initialized successfully');
