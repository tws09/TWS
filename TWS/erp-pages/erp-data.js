// Generate remaining ERP landing pages
const fs = require('fs');
const path = require('path');

const erpData = {
    software: {
        badge: '💻 SOFTWARE HOUSE ERP',
        title: 'Scale Your <span class="gradient-text">Software Business</span>',
        subtitle: 'Complete Project & Development Management',
        description: 'Manage projects, clients, development teams, and operations with our comprehensive Software House ERP. Perfect for software development companies and IT services.',
        gradient: 'software-gradient',
        stats: [
            { number: '200+', label: 'Projects Managed' },
            { number: '50+', label: 'Developers' },
            { number: '9', label: 'Core Modules' },
            { number: '24/7', label: 'Support' }
        ],
        features: [
            { icon: '📋', title: 'Project Management', desc: 'Agile boards, sprint planning, task tracking, and team collaboration tools.' },
            { icon: '⏱️', title: 'Time Tracking', desc: 'Accurate time tracking, billable hours, and productivity analytics.' },
            { icon: '👥', title: 'Client Portal', desc: 'Dedicated client portals for project updates, feedback, and collaboration.' },
            { icon: '💰', title: 'Billing & Invoicing', desc: 'Automated invoicing, payment tracking, and financial reporting.' },
            { icon: '🐛', title: 'Bug Tracking', desc: 'Comprehensive issue tracking, prioritization, and resolution workflows.' },
            { icon: '📊', title: 'Resource Management', desc: 'Optimize team allocation, skills matrix, and capacity planning.' }
        ]
    },
    warehouse: {
        badge: '📦 WAREHOUSE ERP',
        title: 'Streamline Your <span class="gradient-text">Warehouse</span>',
        subtitle: 'Advanced Warehouse & Logistics Management',
        description: 'Optimize inventory, shipping, receiving, and warehouse operations with our comprehensive Warehouse ERP. Built for distribution centers and logistics companies.',
        gradient: 'warehouse-gradient',
        stats: [
            { number: '100000+', label: 'Items Tracked' },
            { number: '5000+', label: 'Daily Shipments' },
            { number: '7', label: 'Core Modules' },
            { number: '99.9%', label: 'Accuracy' }
        ],
        features: [
            { icon: '📦', title: 'Inventory Tracking', desc: 'Real-time inventory visibility with barcode scanning and RFID integration.' },
            { icon: '🚚', title: 'Shipping & Receiving', desc: 'Streamlined shipping processes, carrier integration, and delivery tracking.' },
            { icon: '📍', title: 'Location Management', desc: 'Optimize warehouse layout, bin management, and picking routes.' },
            { icon: '📊', title: 'Order Fulfillment', desc: 'Efficient order processing, picking, packing, and shipping workflows.' },
            { icon: '🔄', title: 'Stock Movements', desc: 'Track transfers, adjustments, and stock movements across locations.' },
            { icon: '📈', title: 'Warehouse Reports', desc: 'Comprehensive analytics on inventory, orders, and warehouse performance.' }
        ]
    },
    business: {
        badge: '🏢 BUSINESS ERP',
        title: 'Empower Your <span class="gradient-text">Business</span>',
        subtitle: 'All-in-One Business Management Solution',
        description: 'Complete business management system covering HR, finance, projects, operations, and more. Perfect for SMEs and growing businesses.',
        gradient: 'business-gradient',
        stats: [
            { number: '100+', label: 'Employees' },
            { number: '50+', label: 'Clients' },
            { number: '10', label: 'Core Modules' },
            { number: '100%', label: 'Customizable' }
        ],
        features: [
            { icon: '👥', title: 'HR Management', desc: 'Complete employee lifecycle, attendance, payroll, and performance management.' },
            { icon: '💰', title: 'Finance & Accounting', desc: 'Invoicing, expenses, financial reporting, and budget management.' },
            { icon: '📊', title: 'Project Management', desc: 'Plan, track, and manage projects with team collaboration tools.' },
            { icon: '📦', title: 'Inventory Management', desc: 'Stock tracking, purchase orders, and supplier management.' },
            { icon: '💬', title: 'Communication Hub', desc: 'Internal messaging, video calls, and team collaboration.' },
            { icon: '📈', title: 'Business Analytics', desc: 'Comprehensive dashboards, reports, and data-driven insights.' }
        ]
    }
};

console.log('ERP landing page templates ready to generate.');
console.log('Run with index.js to create all pages automatically.');
