# TWS - The Wolf Stack ERP

![TWS Logo](https://via.placeholder.com/150x50?text=TWS+ERP)

> **Enterprise-Grade Multi-Tenant ERP Platform**  
> A comprehensive solution for Education, Healthcare, Retail, Manufacturing, and more.

---

## 🚀 Quick Start

### Prerequisites
*   Node.js v18+
*   MongoDB v6+
*   Redis (Optional for dev, Required for prod)

### Installation

```bash
# Install all dependencies
npm run install:all

# Start development servers (Backend + Frontend)
npm start
```

---

## 📚 Documentation

We maintain comprehensive documentation for developers, administrators, and users.

*   **[Documentation Hub](./docs/README.md)** - Start here!
*   **[Getting Started](./docs/01-getting-started/README.md)**
*   **[API Documentation](./docs/05-api-documentation/API_DOCUMENTATION.md)**
*   **[Development History](./docs/development-history/)** - Logs, plans, and architectural decisions.

---

## 🏗️ Project Structure

```
/
├── backend/           # Node.js/Express API
├── frontend/          # React.js Client
├── docs/              # Documentation & Dev Logs
├── scripts/           # Utility scripts
└── config/            # Shared configuration
```

## 🔐 Security Note

This repository follows strict security guidelines.
*   **NEVER** commit `.env` files.
*   **NEVER** commit service account credentials.
*   Please review `PRODUCTION_READINESS_AUDIT.md` before deploying.

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/01-getting-started/DEVELOPER_GUIDE.md) for details on our code of conduct, and the process for submitting pull requests.

---

**Version:** 1.0.0  
**License:** Proprietary  
**Copyright:** © 2025 The Wolf Stack
