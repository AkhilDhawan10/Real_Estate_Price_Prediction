# Property Broker SaaS Application

A production-ready web application for property brokers with paid access to filtered property data extracted from PDF files.

## 🚀 Features

- **User Registration & Authentication**: Secure JWT-based authentication with role-based access control
- **Subscription Management**: Monthly and quarterly subscription plans with Razorpay payment integration
- **Property Search**: Advanced search with filters (location, size, budget, property type)
- **PDF Processing**: Automated extraction of property data from PDF files
- **Excel Integration**: Automatic backup of user data and property data to Excel files
- **Admin Dashboard**: Complete admin panel for managing users, subscriptions, and uploading PDFs
- **Property Matching**: Intelligent matching algorithm with relevance scoring

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS
- React Hook Form + Zod validation
- Axios for API calls
- React Hot Toast for notifications

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Razorpay payment integration
- PDF parsing (pdf-parse)
- Excel handling (xlsx)
- Multer for file uploads

## 📁 Project Structure

```
.
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Auth & subscription middleware
│   │   ├── services/     # PDF processing service
│   │   ├── utils/        # Utility functions
│   │   └── server.ts     # Express server
│   └── package.json
├── uploads/              # PDF uploads directory
└── excel-data/           # Excel files directory
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real_Estate_Price_Prediction
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/property-broker
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   UPLOAD_DIR=./uploads
   EXCEL_DIR=./excel-data
   ADMIN_EMAIL=admin@propertybroker.com
   ADMIN_PASSWORD=admin123
   ```

   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

7. **Start the frontend**
   ```bash
   cd client
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👤 User Flow

1. **Registration**: Users register with full name, phone, email, and password
2. **Subscription**: Users choose a monthly or quarterly plan and complete payment via Razorpay
3. **Property Search**: Subscribed users can search properties using filters
4. **Results**: Properties are displayed with relevance scoring

## 🔐 Admin Features

1. **Dashboard**: View statistics (users, properties, subscriptions, revenue)
2. **PDF Upload**: Upload monthly property data PDFs for processing
3. **User Management**: View all registered users
4. **Subscription Management**: View and manage subscriptions
5. **Reports**: Download Excel reports for users and subscriptions

## 📊 PDF Processing

The system automatically:
- Extracts text from uploaded PDFs
- Parses property data (location, type, size, price)
- Stores data in MongoDB
- Updates Excel backup file (`properties.xlsx`)

**Note**: The PDF parser is a basic implementation. You may need to customize it based on your PDF format.

## 💳 Payment Integration

The application uses Razorpay for payment processing:
- Monthly Plan: ₹999/month
- Quarterly Plan: ₹2,499/quarter (saves ₹498)

## 🗄️ Database Schema

### User
- fullName, phoneNumber, email, password, role, isActive

### Subscription
- user, planType, paymentId, amount, startDate, expiryDate, isActive

### Property
- location (city, area), propertyType, size (value, unit), price, brokerNotes

### PropertyRequirement
- user, location, propertyType, size, budget

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (AWS/Render)
1. Set up Node.js environment
2. Configure MongoDB Atlas connection
3. Set environment variables
4. Deploy

### Database
- Use MongoDB Atlas for production

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh-token` - Refresh JWT token

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/create-order` - Create payment order
- `POST /api/subscriptions/verify-payment` - Verify payment
- `GET /api/subscriptions/status` - Get subscription status

### Properties
- `GET /api/properties/search` - Search properties (requires subscription)
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/stats` - Get property statistics

### Admin
- `POST /api/admin/upload-pdf` - Upload property PDF
- `GET /api/admin/users` - Get all users
- `GET /api/admin/subscriptions` - Get all subscriptions
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/reports/users` - Download users report
- `GET /api/admin/reports/subscriptions` - Download subscriptions report

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Refresh token mechanism
- Protected routes with middleware
- Subscription-based access control
- Input validation with express-validator
- Rate limiting (can be added)

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@propertybroker.com or create an issue in the repository.
