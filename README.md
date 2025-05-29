# Inventrack

Inventrack is a modern inventory management system built with Node.js, Express, PostgreSQL, and React. It provides a robust API and user interface for managing inventory, user authentication, and real-time tracking of products.

## Features

- 🔐 Secure user authentication and authorization
- 📦 Inventory management and tracking
- 📊 Real-time stock monitoring
- 🔍 Advanced search and filtering
- 📱 RESTful API architecture
- 🔒 Secure data handling with JWT
- 🛡️ Protected routes and endpoints
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔄 Real-time updates and notifications
- 📱 Mobile-friendly design

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (with Neon Serverless)
- JWT for authentication
- Bcrypt for password hashing
- Helmet for security
- CORS enabled
- Morgan for logging
- Express Rate Limit for API protection
- Express Validator for input validation

### Frontend
- React 19.1.0
- Vite for build tooling
- Tailwind CSS for styling
- DaisyUI for UI components
- Zustand for state management
- React Router for navigation
- Axios for API integration
- React Hot Toast for notifications
- ESLint for code quality
- PostCSS for CSS processing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/inventrack.git
cd inventrack
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```env
PORT=5001
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

5. Initialize the database:
```bash
npm run db:init
```

## Development

### Backend
Start the backend development server:
```bash
npm run dev
```
The server will start running on http://localhost:5001

### Frontend
Start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will be available at http://localhost:5173

## Documentation

- [API Documentation](./API.md) - Detailed API endpoints and usage
- [Frontend Documentation](./FRONTEND.md) - Frontend architecture and setup
- [Libraries Documentation](./LIBRARIES.md) - Detailed library information

## Project Structure

```
inventrack/
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── database/       # Database setup and migrations
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── frontend/
│   ├── src/            # Source files
│   ├── public/         # Static assets
│   ├── index.html      # Entry HTML file
│   └── package.json    # Frontend dependencies
├── .env               # Environment variables
├── package.json       # Backend dependencies
└── README.md         # Project documentation
```

## Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run db:init` - Initialize database

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/inventrack](https://github.com/yourusername/inventrack) 