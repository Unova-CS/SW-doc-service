# Smart-Ways Document Branding Service

A secure, production-ready document generation microservice for **Smart-Ways Solutions**.  
Generates branded PDFs for **letterheads**, **invoices**, and **quotations** with full compliance (PACRA), user management, and audit capabilities.

![Smart-Ways Document Service](https://via.placeholder.com/800x400?text=Branded+Invoice+Preview) <!-- Replace with real screenshot later -->

## Features

- **Branded PDFs**: Auto-numbered, PACRA-compliant documents
- **User Management**: Role-based access (Admin, Finance, Staff)
- **Date Validation**: Enforces due date ≥ invoice date
- **Zambian Date Format**: `dd/mm/yyyy` in all outputs
- **Secure**: JWT authentication, password hashing, last-admin protection
- **Deploy Ready**: One-click deploy to Render

##Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Production-ready"
   git remote add origin https://github.com/your-username/smartways-docs.git
   git push -u origin main

smartways-doc-service/
├── src/
│   ├── controllers/
│   │   └── documentController.js          #FINAL
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roles.js
│   ├── models/
│   │   ├── Brand.js
│   │   ├── Document.js
│   │   ├── User.js
│   │   └── ActivityLog.js                 # (optional – remove if unused)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   └── viewRoutes.js                  #FINAL
│   ├── templates/                          #BRANDED TEMPLATES
│   │   ├── letterhead.hbs
│   │   ├── invoice.hbs
│   │   └── quotation.hbs
│   ├── utils/
│   │   ├── pdfGenerator.js
│   │   └── numbering.js                   #FINAL
│   └── app.js                             # FINAL
├── public/
│   └── uploads/
│       └── logo.png                       # TRANSPARENT PNG
├── seed/
│   ├── createBrand.js
│   └── createUsers.js
├── views/
│   ├── login.html
│   └── new-document.html                  
├── .env.example
├── .gitignore
├── package.json
├── render.yaml                             FOR RENDER
└── README.md                               #PROFESSIONAL


---

## `.env.example`

```env
# .env.example
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smartwaysdocs
JWT_SECRET=SuperSecretKeyChangeMe
BASE_URL=http://localhost:4000


📜 License
Proprietary — Smart-Ways Solutions © 2025
PACRA Registration No. 320200015637