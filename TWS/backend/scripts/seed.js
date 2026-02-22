const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const { PayrollRule } = require('../src/models/Payroll');
const { Account } = require('../src/models/Finance');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await PayrollRule.deleteMany({});
    await Account.deleteMany({});

    console.log('Cleared existing data');

    // Get or create default organization
    const Organization = require('../src/models/Organization');
    let organization = await Organization.findOne({ slug: 'wolfstack' });
    if (!organization) {
      organization = new Organization({
        name: 'Wolf Stack',
        slug: 'wolfstack',
        description: 'Default organization for Wolf Stack Management System',
        industry: 'Technology',
        size: '51-200',
        plan: 'enterprise',
        status: 'active'
      });
      await organization.save();
      console.log('Created default organization');
    } else {
      console.log('Using existing organization');
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@wolfstack.co',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'owner',
      status: 'active',
      orgId: organization._id
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample employees
    const employees = [
      {
        email: 'john.doe@wolfstack.co',
        password: 'password123',
        fullName: 'John Doe',
        role: 'employee',
        department: 'Engineering',
        jobTitle: 'Software Developer'
      },
      {
        email: 'jane.smith@wolfstack.co',
        password: 'password123',
        fullName: 'Jane Smith',
        role: 'hr',
        department: 'Human Resources',
        jobTitle: 'HR Manager'
      },
      {
        email: 'mike.johnson@wolfstack.co',
        password: 'password123',
        fullName: 'Mike Johnson',
        role: 'finance',
        department: 'Finance',
        jobTitle: 'Finance Manager'
      },
      {
        email: 'sarah.wilson@wolfstack.co',
        password: 'password123',
        fullName: 'Sarah Wilson',
        role: 'manager',
        department: 'Engineering',
        jobTitle: 'Engineering Manager'
      },
      {
        email: 'david.brown@wolfstack.co',
        password: 'password123',
        fullName: 'David Brown',
        role: 'employee',
        department: 'Marketing',
        jobTitle: 'Marketing Specialist'
      }
    ];

    const createdUsers = [];
    for (const emp of employees) {
      const user = new User({
        ...emp,
        orgId: organization._id
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.fullName}`);
    }

    // Create employee records
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const employee = new Employee({
        userId: user._id,
        employeeId: `WFS-${String(i + 1).padStart(4, '0')}`,
        jobTitle: user.jobTitle,
        department: user.department,
        hireDate: new Date(2023, 0, 1 + i * 30), // Staggered hire dates
        contractType: 'full-time',
        salary: {
          base: 50000 + (i * 10000), // Varying salaries
          currency: 'USD',
          components: [
            { name: 'Base Salary', amount: 50000 + (i * 10000), type: 'allowance' }
          ]
        }
      });
      await employee.save();
      console.log(`Created employee record: ${employee.employeeId}`);
    }

    // Create payroll rules
    const payrollRules = [
      {
        name: 'Federal Tax',
        type: 'tax',
        calculation: {
          method: 'percentage',
          value: 22
        },
        active: true
      },
      {
        name: 'State Tax',
        type: 'tax',
        calculation: {
          method: 'percentage',
          value: 5
        },
        active: true
      },
      {
        name: 'Social Security',
        type: 'deduction',
        calculation: {
          method: 'percentage',
          value: 6.2
        },
        active: true
      },
      {
        name: 'Medicare',
        type: 'deduction',
        calculation: {
          method: 'percentage',
          value: 1.45
        },
        active: true
      }
    ];

    for (const rule of payrollRules) {
      const payrollRule = new PayrollRule(rule);
      await payrollRule.save();
      console.log(`Created payroll rule: ${rule.name}`);
    }

    // Create chart of accounts
    const accounts = [
      { name: 'Cash', type: 'asset', code: '1000' },
      { name: 'Accounts Receivable', type: 'asset', code: '1100' },
      { name: 'Equipment', type: 'asset', code: '1500' },
      { name: 'Accounts Payable', type: 'liability', code: '2000' },
      { name: 'Revenue', type: 'revenue', code: '4000' },
      { name: 'Office Expenses', type: 'expense', code: '5000' },
      { name: 'Salaries', type: 'expense', code: '5100' },
      { name: 'Rent', type: 'expense', code: '5200' }
    ];

    for (const account of accounts) {
      const newAccount = new Account(account);
      await newAccount.save();
      console.log(`Created account: ${account.name}`);
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@wolfstack.co / admin123');
    console.log('Employee: john.doe@wolfstack.co / password123');
    console.log('HR: jane.smith@wolfstack.co / password123');
    console.log('Finance: mike.johnson@wolfstack.co / password123');
    console.log('Manager: sarah.wilson@wolfstack.co / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedData();
