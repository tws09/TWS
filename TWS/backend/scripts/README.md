# Employee Seeding Script

This script generates realistic employee data for the WolfStack Management Portal.

## Overview

The seed script creates **120 employees** with diverse data including:

- **Personal Information**: Names, emails, phone numbers, addresses
- **Employment Details**: Job titles, departments, contract types, hire dates
- **Compensation**: Base salaries, bonuses, benefits, allowances
- **Skills & Performance**: Technical skills, performance ratings, goals
- **Career Development**: Career levels, mentorship, promotion eligibility
- **Compliance**: Background checks, certifications, drug tests
- **Work Schedule**: Flexible schedules, remote work, shift patterns

## Data Variations

### Departments (17 total)
- Development, Engineering, Design, Marketing, HR, Finance, Sales, Operations
- Product, Customer Success, Business Development, Legal, QA, DevOps
- Data Science, Research, Security

### Contract Types
- Full-time (majority)
- Part-time
- Contract
- Intern

### Employee Status
- Active (majority)
- Probation
- Terminated
- On Leave
- Resigned
- Retired

### Salary Ranges
- Development: $60K - $180K
- Engineering: $70K - $200K
- Data Science: $80K - $200K
- Design: $50K - $120K
- Marketing: $45K - $100K
- HR: $40K - $90K
- Finance: $50K - $130K
- Sales: $40K - $150K
- And more...

## Usage

### Prerequisites
1. Ensure MongoDB is running
2. Set up your `.env` file with `MONGODB_URI`
3. Install dependencies: `npm install`

### Running the Seed Script

```bash
# Option 1: Using npm script
npm run seed

# Option 2: Using npm script (alternative)
npm run seed:employees

# Option 3: Direct execution
node scripts/runSeed.js

# Option 4: Direct execution of seed file
node scripts/seedEmployees.js
```

### Environment Variables

Make sure your `.env` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/wolfstack
ENCRYPTION_KEY=your-encryption-key-here
```

## Generated Data Structure

### Users (120)
- Unique email addresses
- Hashed passwords (default: "password123")
- Various roles (employee, manager, hr, admin, contributor)
- Phone numbers and basic info

### Employees (120)
- Employee IDs (EMP10000-EMP99999)
- Comprehensive salary data with components and bonuses
- Skills with proficiency levels
- Performance metrics and goals
- Benefits packages
- Work schedules
- Compliance records
- Emergency contacts
- Addresses across US cities

## Features

- **Realistic Data**: Uses real names, cities, and job titles
- **Varied Compensation**: Different salary ranges based on department
- **Skills Matrix**: Technical and soft skills with proficiency levels
- **Performance Tracking**: Goals, ratings, and competencies
- **Benefits Packages**: Health, dental, retirement, stock options
- **Compliance**: Background checks, drug tests, certifications
- **Work Flexibility**: Remote, hybrid, flexible, and shift schedules

## Data Relationships

- Each Employee is linked to a User
- Skills are categorized (technical, soft, language, certification)
- Performance goals have status and progress tracking
- Benefits are randomly assigned based on probability
- Compliance records include expiry dates and status

## Customization

To modify the seed data:

1. **Add more names**: Update `firstNames` and `lastNames` arrays
2. **Add departments**: Update `departments` array and `jobTitles` object
3. **Modify salary ranges**: Update `generateSalary()` function
4. **Add skills**: Update `skills` array
5. **Change employee count**: Modify the loop in `seedEmployees()`

## Output

The script provides detailed logging:

```
🌱 Starting employee seeding...
📡 Connected to MongoDB
🏢 Created organization
🧹 Cleared existing data
👥 Created 120 users
💼 Created 120 employees
✅ Employee seeding completed successfully!
📊 Summary:
   - Users: 120
   - Employees: 120
   - Departments: 17
   - Contract Types: 4
   - Statuses: 6
🔌 Database connection closed
```

## Notes

- The script clears existing User and Employee data before seeding
- All passwords are set to "password123" (hashed automatically)
- Sensitive data (bank details, tax ID) is encrypted
- Employee IDs are unique and sequential
- All dates are randomized within realistic ranges
- The script handles errors gracefully and provides detailed feedback
