const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Organization = require('../src/models/Organization');

// Sample data arrays
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Timothy', 'Dorothy', 'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen',
  'Jeffrey', 'Betty', 'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna',
  'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon', 'Stephen', 'Michelle',
  'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
  'Benjamin', 'Dorothy', 'Samuel', 'Lisa', 'Gregory', 'Nancy', 'Alexander', 'Karen',
  'Patrick', 'Betty', 'Jack', 'Helen', 'Dennis', 'Sandra', 'Jerry', 'Donna'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza'
];

const departments = [
  'development', 'design', 'marketing', 'hr', 'finance', 'sales', 'operations',
  'engineering', 'product', 'customer-success', 'business-development', 'legal',
  'quality-assurance', 'devops', 'data-science', 'research', 'security'
];

const jobTitles = {
  'development': ['Software Engineer', 'Senior Developer', 'Lead Developer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'QA Engineer'],
  'design': ['UI Designer', 'UX Designer', 'Graphic Designer', 'Product Designer', 'Creative Director', 'Design Lead', 'Visual Designer', 'Interaction Designer'],
  'marketing': ['Marketing Manager', 'Digital Marketing Specialist', 'Content Creator', 'SEO Specialist', 'Social Media Manager', 'Brand Manager', 'Marketing Analyst', 'Growth Hacker'],
  'hr': ['HR Manager', 'HR Specialist', 'Recruiter', 'HR Business Partner', 'Talent Acquisition', 'Employee Relations', 'HR Coordinator', 'Compensation Analyst'],
  'finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'Controller', 'CFO', 'Financial Planner', 'Auditor', 'Tax Specialist'],
  'sales': ['Sales Manager', 'Account Executive', 'Sales Representative', 'Business Development', 'Sales Director', 'Inside Sales', 'Sales Engineer', 'Customer Success'],
  'operations': ['Operations Manager', 'Operations Analyst', 'Process Manager', 'Supply Chain Manager', 'Operations Director', 'Project Coordinator', 'Operations Specialist'],
  'engineering': ['Senior Engineer', 'Principal Engineer', 'Engineering Manager', 'Technical Lead', 'Systems Engineer', 'Platform Engineer', 'Infrastructure Engineer'],
  'product': ['Product Manager', 'Product Owner', 'Product Analyst', 'Product Director', 'Product Marketing', 'Product Designer', 'Product Strategist'],
  'customer-success': ['Customer Success Manager', 'Customer Success Specialist', 'Account Manager', 'Customer Support', 'Customer Advocate', 'Success Engineer'],
  'business-development': ['Business Development Manager', 'Partnership Manager', 'Strategic Partnerships', 'Business Analyst', 'Growth Manager'],
  'legal': ['Legal Counsel', 'Paralegal', 'Compliance Officer', 'Legal Assistant', 'Contract Manager', 'Legal Analyst'],
  'quality-assurance': ['QA Engineer', 'Test Engineer', 'QA Manager', 'Automation Engineer', 'Quality Analyst', 'Test Lead'],
  'devops': ['DevOps Engineer', 'Site Reliability Engineer', 'Infrastructure Engineer', 'Cloud Engineer', 'Platform Engineer', 'Release Manager'],
  'data-science': ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'Data Engineer', 'Analytics Manager', 'Research Scientist'],
  'research': ['Research Scientist', 'Research Analyst', 'Research Manager', 'Data Researcher', 'Market Researcher', 'User Researcher'],
  'security': ['Security Engineer', 'Security Analyst', 'Cybersecurity Specialist', 'Security Manager', 'Penetration Tester', 'Security Architect']
};

const skills = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
  'Kubernetes', 'Git', 'Agile', 'Scrum', 'Leadership', 'Communication', 'Problem Solving',
  'Project Management', 'Data Analysis', 'Machine Learning', 'UI/UX Design', 'Marketing',
  'Sales', 'Customer Service', 'Financial Analysis', 'HR Management', 'Legal Research',
  'Quality Assurance', 'DevOps', 'Cybersecurity', 'Research', 'Business Development'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis',
  'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento',
  'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami',
  'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa'
];

const states = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'TX', 'OH',
  'NC', 'CA', 'IN', 'WA', 'CO', 'DC', 'MA', 'TX', 'TN', 'MI', 'OK', 'OR', 'NV', 'TN',
  'KY', 'MD', 'WI', 'NM', 'AZ', 'CA', 'CA', 'AZ', 'MO', 'GA', 'CA', 'CO', 'NC', 'FL',
  'VA', 'NE', 'CA', 'MN', 'OK', 'TX', 'FL'
];

// Generate random data functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomElements = (array, count) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateEmployeeId = () => {
  const prefix = 'EMP';
  const number = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}${number}`;
};

const generateEmail = (firstName, lastName) => {
  const domains = ['company.com', 'techcorp.com', 'innovate.com', 'global.com', 'enterprise.com'];
  const domain = getRandomElement(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

const generatePhone = () => {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${exchange}-${number}`;
};

const generateSalary = (department, jobTitle) => {
  const baseSalaries = {
    'development': { min: 60000, max: 180000 },
    'engineering': { min: 70000, max: 200000 },
    'design': { min: 50000, max: 120000 },
    'marketing': { min: 45000, max: 100000 },
    'hr': { min: 40000, max: 90000 },
    'finance': { min: 50000, max: 130000 },
    'sales': { min: 40000, max: 150000 },
    'operations': { min: 45000, max: 110000 },
    'product': { min: 60000, max: 160000 },
    'customer-success': { min: 40000, max: 100000 },
    'business-development': { min: 50000, max: 120000 },
    'legal': { min: 60000, max: 150000 },
    'quality-assurance': { min: 50000, max: 120000 },
    'devops': { min: 70000, max: 180000 },
    'data-science': { min: 80000, max: 200000 },
    'research': { min: 60000, max: 140000 },
    'security': { min: 70000, max: 180000 }
  };
  
  const range = baseSalaries[department] || { min: 40000, max: 100000 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

const generateSkills = () => {
  const skillCount = Math.floor(Math.random() * 8) + 3; // 3-10 skills
  return getRandomElements(skills, skillCount).map(skill => ({
    name: skill,
    level: getRandomElement(['beginner', 'intermediate', 'advanced', 'expert']),
    category: getRandomElement(['technical', 'soft', 'language', 'certification']),
    verified: Math.random() > 0.3
  }));
};

const generatePerformanceGoals = () => {
  const goals = [
    'Complete quarterly objectives',
    'Improve team collaboration',
    'Enhance technical skills',
    'Increase productivity by 20%',
    'Lead a major project',
    'Mentor junior team members',
    'Reduce project delivery time',
    'Improve customer satisfaction',
    'Implement new processes',
    'Achieve certification goals'
  ];
  
  const goalCount = Math.floor(Math.random() * 3) + 1; // 1-3 goals
  return getRandomElements(goals, goalCount).map(goal => ({
    title: goal,
    description: `Work towards achieving ${goal.toLowerCase()}`,
    targetDate: generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    status: getRandomElement(['not-started', 'in-progress', 'completed']),
    progress: Math.floor(Math.random() * 101)
  }));
};

const generateBenefits = () => {
  const benefitTypes = [
    'healthInsurance', 'dentalInsurance', 'visionInsurance', 'retirementPlan',
    'lifeInsurance', 'disabilityInsurance', 'flexibleSpendingAccount',
    'healthSavingsAccount', 'stockOptions'
  ];
  
  const benefits = {};
  benefitTypes.forEach(benefit => {
    benefits[benefit] = Math.random() > 0.3; // 70% chance of having each benefit
  });
  
  if (benefits.stockOptions) {
    benefits.equityShares = Math.floor(Math.random() * 1000) + 100;
  }
  
  return benefits;
};

const generateWorkSchedule = () => {
  const scheduleTypes = ['standard', 'flexible', 'remote', 'hybrid', 'shift'];
  const type = getRandomElement(scheduleTypes);
  
  const workDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  if (type === 'shift') {
    workDays.push('saturday', 'sunday');
  }
  
  return {
    type,
    hoursPerWeek: type === 'part-time' ? Math.floor(Math.random() * 20) + 20 : 40,
    workDays: getRandomElements(workDays, Math.floor(Math.random() * 3) + 3),
    startTime: type === 'shift' ? getRandomElement(['06:00', '14:00', '22:00']) : '09:00',
    endTime: type === 'shift' ? getRandomElement(['14:00', '22:00', '06:00']) : '17:00',
    timezone: getRandomElement(['UTC', 'EST', 'PST', 'CST', 'MST'])
  };
};

const generateCompliance = () => {
  const statuses = ['pending', 'passed', 'failed'];
  const backgroundCheckStatus = getRandomElement(statuses);
  const drugTestStatus = getRandomElement(statuses);
  
  return {
    backgroundCheck: {
      status: backgroundCheckStatus,
      completedDate: backgroundCheckStatus === 'passed' ? generateRandomDate(new Date(2020, 0, 1), new Date()) : null,
      expiryDate: backgroundCheckStatus === 'passed' ? generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) : null
    },
    drugTest: {
      status: drugTestStatus,
      completedDate: drugTestStatus === 'passed' ? generateRandomDate(new Date(2020, 0, 1), new Date()) : null,
      expiryDate: drugTestStatus === 'passed' ? generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) : null
    },
    certifications: getRandomElements([
      { name: 'AWS Certified', issuer: 'Amazon' },
      { name: 'PMP Certification', issuer: 'PMI' },
      { name: 'Google Analytics', issuer: 'Google' },
      { name: 'Salesforce Admin', issuer: 'Salesforce' },
      { name: 'CISSP', issuer: 'ISC2' },
      { name: 'CPA', issuer: 'AICPA' }
    ], Math.floor(Math.random() * 3)).map(cert => ({
      ...cert,
      issueDate: generateRandomDate(new Date(2020, 0, 1), new Date()),
      expiryDate: generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      status: getRandomElement(['active', 'expired', 'pending'])
    }))
  };
};

// Main seed function
const seedEmployees = async () => {
  try {
    console.log('🌱 Starting employee seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://subhan:U3SNm3nRjvtHMiN7@cluster0.rlfss7x.mongodb.net/wolfstack';
    await mongoose.connect(mongoUri);
    console.log('📡 Connected to MongoDB');
    
    // Get or create organization
    let organization = await Organization.findOne({ slug: 'wolfstack' });
    if (!organization) {
      organization = new Organization({
        name: 'Wolf Stack',
        slug: 'wolfstack',
        description: 'Default organization for Wolf Stack Management Portal',
        plan: 'enterprise',
        settings: {
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          workingHours: {
            start: '09:00',
            end: '17:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          features: {
            timeTracking: true,
            invoicing: true,
            integrations: true,
            aiFeatures: true
          }
        }
      });
      await organization.save();
      console.log('🏢 Created organization');
    }
    
    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    console.log('🧹 Cleared existing data');
    
    const users = [];
    const employees = [];
    
    // Generate 120 employees
    for (let i = 0; i < 120; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const department = getRandomElement(departments);
      const jobTitle = getRandomElement(jobTitles[department]);
      const contractType = getRandomElement(['full-time', 'part-time', 'contract', 'intern']);
      const status = getRandomElement(['active', 'probation', 'terminated', 'on-leave', 'resigned', 'retired']);
      
      // Create user
      const user = new User({
        email: generateEmail(firstName, lastName),
        password: 'password123', // Will be hashed by pre-save hook
        fullName: `${firstName} ${lastName}`,
        role: getRandomElement(['employee', 'manager', 'hr', 'admin', 'contributor']),
        orgId: organization._id,
        status: 'active',
        phone: generatePhone(),
        department,
        jobTitle,
        hireDate: generateRandomDate(new Date(2018, 0, 1), new Date()),
        emailVerified: true,
        profilePicUrl: null,
        lastLogin: null,
        twoFAEnabled: false,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });
      
      users.push(user);
      
      // Create employee
      const employee = new Employee({
        userId: user._id,
        employeeId: generateEmployeeId(),
        jobTitle,
        department,
        hireDate: user.hireDate,
        contractType,
        status,
        salary: {
          base: generateSalary(department, jobTitle),
          currency: 'USD',
          payFrequency: 'monthly',
          components: [
            {
              name: 'Health Insurance',
              amount: Math.floor(Math.random() * 500) + 200,
              type: 'benefit',
              isRecurring: true
            },
            {
              name: 'Transportation Allowance',
              amount: Math.floor(Math.random() * 300) + 100,
              type: 'allowance',
              isRecurring: true
            }
          ],
          bonuses: [
            {
              type: getRandomElement(['performance', 'annual', 'project']),
              amount: Math.floor(Math.random() * 5000) + 1000,
              description: 'Quarterly performance bonus',
              status: getRandomElement(['pending', 'approved', 'paid'])
            }
          ]
        },
        bankDetails: {
          accountNumber: Math.floor(Math.random() * 9000000000) + 1000000000,
          bankName: getRandomElement(['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One']),
          routingNumber: Math.floor(Math.random() * 900000000) + 100000000,
          accountType: getRandomElement(['checking', 'savings'])
        },
        taxId: Math.floor(Math.random() * 900000000) + 100000000,
        leaveBalance: {
          annual: Math.floor(Math.random() * 10) + 15,
          sick: Math.floor(Math.random() * 5) + 8,
          personal: Math.floor(Math.random() * 3) + 2
        },
        emergencyContact: {
          name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
          relationship: getRandomElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
          phone: generatePhone(),
          email: generateEmail(getRandomElement(firstNames), getRandomElement(lastNames))
        },
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln'])}`,
          city: getRandomElement(cities),
          state: getRandomElement(states),
          zipCode: Math.floor(Math.random() * 90000) + 10000,
          country: 'USA'
        },
        skills: generateSkills(),
        performanceMetrics: {
          overallRating: Math.floor(Math.random() * 5) + 1,
          lastReviewDate: generateRandomDate(new Date(2023, 0, 1), new Date()),
          nextReviewDate: generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
          goals: generatePerformanceGoals(),
          competencies: getRandomElements(skills, 5).map(skill => ({
            name: skill,
            level: Math.floor(Math.random() * 5) + 1,
            assessedDate: generateRandomDate(new Date(2023, 0, 1), new Date())
          }))
        },
        careerDevelopment: {
          careerLevel: getRandomElement(['entry', 'junior', 'mid', 'senior', 'lead', 'principal']),
          promotionEligibility: Math.random() > 0.5,
          nextPromotionDate: Math.random() > 0.5 ? generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) : null,
          careerPath: getRandomElement(['Technical Track', 'Management Track', 'Individual Contributor', 'Specialist Track']),
          mentorship: {
            isMentor: Math.random() > 0.7,
            isMentee: Math.random() > 0.6
          }
        },
        benefits: generateBenefits(),
        workSchedule: generateWorkSchedule(),
        compliance: generateCompliance()
      });
      
      employees.push(employee);
    }
    
    // Save users first
    const savedUsers = await User.insertMany(users);
    console.log(`👥 Created ${savedUsers.length} users`);
    
    // Update employee references with actual user IDs
    for (let i = 0; i < employees.length; i++) {
      employees[i].userId = savedUsers[i]._id;
    }
    
    // Save employees
    console.log(`🔍 About to create ${employees.length} employees...`);
    try {
      await Employee.insertMany(employees);
      console.log(`💼 Created ${employees.length} employees`);
    } catch (error) {
      console.error('❌ Error creating employees:', error.message);
      console.error('First employee sample:', JSON.stringify(employees[0], null, 2));
    }
    
    console.log('✅ Employee seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${savedUsers.length}`);
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Departments: ${[...new Set(employees.map(e => e.department))].length}`);
    console.log(`   - Contract Types: ${[...new Set(employees.map(e => e.contractType))].length}`);
    console.log(`   - Statuses: ${[...new Set(employees.map(e => e.status))].length}`);
    
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
if (require.main === module) {
  seedEmployees();
}

module.exports = seedEmployees;
