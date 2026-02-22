# Employee Portal Login Guide

## How to Access the Employee Portal

### Step 1: Get Your Employee Credentials

Employee accounts are created by HR administrators through the HR Management system. When an employee is created, they receive:

1. **Email Address**: The email address used during employee registration
2. **Password**: 
   - If a password was set during creation, use that password
   - If no password was set, the default temporary password is: `tempPassword123`
   - **Important**: Change your password after first login for security

### Step 2: Login to the Employee Portal

1. **Navigate to the Software House Login Page**:
   - Go to: `/software-house-login`
   - Or visit: `http://your-domain.com/software-house-login`

2. **Select "Employee" Portal**:
   - On the login page, you'll see four portal options: Admin, Developer, Manager, and **Employee**
   - Click on the **Employee** circle/button to select it

3. **Enter Your Credentials**:
   - **Email**: Your employee email address (e.g., `employee@softwarehouse.com`)
   - **Password**: Your password (or `tempPassword123` if using default)

4. **Click "Log in"**

5. **You'll be automatically redirected** to:
   - `/tenant/{your-tenant-slug}/org/software-house/employee-portal`

### Step 3: Access Employee Portal Features

Once logged in, you can access:

- **Dashboard**: Overview of your attendance, leave balance, and recent activity
- **My Profile**: View and update your personal information, address, and emergency contacts
- **Attendance**: View your attendance records, check-in/check-out times
- **Leave Requests**: Submit leave requests and view your leave balance
- **Performance**: View your performance ratings, goals, and reviews
- **Payroll**: View your salary information and download payslips
- **Documents**: Access your employment documents

## Creating Employee Accounts (For HR Admins)

### Method 1: Through HR Management Interface

1. Navigate to: `/tenant/{tenant-slug}/org/software-house/hr/employees/create`
2. Fill in the employee details:
   - Full Name
   - Email Address
   - Employee ID
   - Job Title
   - Department
   - **Password** (optional - if not provided, default is `tempPassword123`)
   - Other employee information
3. Click "Create Employee"
4. The system will:
   - Create a User account with role `employee`
   - Create an Employee record linked to that user
   - Send credentials to the employee (if email notification is configured)

### Method 2: Through Backend API

**Endpoint**: `POST /api/employees`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@company.com",
  "employeeId": "EMP001",
  "jobTitle": "Software Developer",
  "department": "Engineering",
  "password": "SecurePassword123",  // Optional - defaults to "tempPassword123"
  "phone": "+1234567890",
  "hireDate": "2024-01-15",
  "contractType": "full-time",
  "salary": {
    "base": 75000,
    "currency": "USD",
    "payFrequency": "monthly"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "_id": "...",
      "employeeId": "EMP001",
      "userId": {
        "email": "john.doe@company.com",
        "role": "employee"
      }
    }
  }
}
```

## Default Credentials

- **Default Password**: `tempPassword123` (if no password is set during creation)
- **First Login**: Employees should change their password immediately after first login

## Troubleshooting

### Issue: "Invalid credentials"
- **Solution**: Verify your email and password are correct
- Check if you're using the correct portal (Employee, not Admin/Developer/Manager)
- Contact HR if you've forgotten your password

### Issue: "Unable to identify your organization"
- **Solution**: Ensure your employee account is properly linked to a tenant/organization
- Contact your system administrator

### Issue: Can't see Employee Portal option
- **Solution**: Make sure you're logged in with an `employee` role
- The Employee Portal menu item only appears for users with the `employee` role

### Issue: "Access Denied" or missing features
- **Solution**: Your account may not have the necessary permissions
- Contact HR or your manager to verify your role and permissions

## Security Best Practices

1. **Change Default Password**: Always change the default password on first login
2. **Use Strong Passwords**: Use a combination of letters, numbers, and special characters
3. **Don't Share Credentials**: Never share your login credentials with others
4. **Logout When Done**: Always logout when finished using the portal
5. **Report Issues**: Report any security concerns to your IT department immediately

## Support

For login issues or questions about the Employee Portal:
- Contact your HR department
- Contact your IT support team
- Email: support@yourcompany.com

---

**Note**: The Employee Portal is specifically designed for software house tenants. If you're part of a different organization type (Education, Healthcare, etc.), you may have a different portal access method.
