# Inventrack Frontend Documentation

## Overview
The Inventrack frontend is built using React with Vite as the build tool. It uses modern web technologies and follows best practices for a scalable and maintainable application.

## Tech Stack

### Core Technologies
- **React** (v19.1.0) - UI library
- **Vite** (v6.3.5) - Build tool and development server
- **React Router DOM** (v7.6.1) - Client-side routing
- **Zustand** (v5.0.5) - State management
- **Axios** (v1.9.0) - HTTP client for API requests

### UI and Styling
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **DaisyUI** (v5.0.40) - Component library for Tailwind CSS
- **React Hot Toast** (v2.5.2) - Toast notifications
- **Lucide React** - Icon library

### Development Tools
- **ESLint** (v9.25.0) - Code linting
- **PostCSS** (v8.5.3) - CSS processing
- **Autoprefixer** (v10.4.21) - CSS vendor prefixing

## Project Structure
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── ui/       # Base UI components
│   │   └── ...       # Other components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   ├── store/        # Zustand store
│   ├── utils/        # Utility functions
│   ├── api/          # API integration
│   └── App.jsx       # Root component
├── public/           # Static assets
├── node_modules/     # Dependencies
├── index.html        # Entry HTML file
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js # PostCSS configuration
└── package.json      # Project dependencies and scripts
```

## UI Components

### Base Components
The project includes several reusable base components located in `src/components/ui/`:

- **Button** (`button.jsx`) - Customizable button component
- **Card** (`card.jsx`) - Card container component
- **Input** (`input.jsx`) - Form input component
- **Label** (`label.jsx`) - Form label component
- **Checkbox** (`checkbox.jsx`) - Checkbox input component

### Authentication Components
- **LoginForm** - Login form component
- **AuthLayout** - Authentication page layout

## Getting Started

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development
To start the development server:
```bash
npm run dev
```
This will start the Vite development server, typically at `http://localhost:5173`

### Building for Production
To create a production build:
```bash
npm run build
```
The build output will be in the `dist` directory.

### Linting
To run ESLint:
```bash
npm run lint
```

## Key Features
- Modern React with hooks
- Responsive design with Tailwind CSS
- State management with Zustand
- Client-side routing with React Router
- Toast notifications for user feedback
- API integration with Axios
- Reusable UI components
- Authentication system

## Best Practices
1. Use functional components with hooks
2. Follow the component-based architecture
3. Implement proper error handling
4. Use TypeScript for type safety
5. Follow ESLint rules for code consistency
6. Implement responsive design using Tailwind CSS
7. Maintain consistent component structure
8. Use proper semantic HTML elements

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Dependencies
### Production Dependencies
- react: ^19.1.0
- react-dom: ^19.1.0
- react-router-dom: ^7.6.1
- zustand: ^5.0.5
- axios: ^1.9.0
- react-hot-toast: ^2.5.2
- lucide-react: ^0.344.0

### Development Dependencies
- @vitejs/plugin-react: ^4.4.1
- tailwindcss: ^3.4.17
- daisyui: ^5.0.40
- eslint: ^9.25.0
- postcss: ^8.5.3
- autoprefixer: ^10.4.21

## Contributing
1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed
5. Create pull requests for new features

## Troubleshooting
Common issues and their solutions:
1. If you encounter dependency issues, try:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. For build errors, check the Vite configuration
3. For styling issues, verify Tailwind CSS configuration
4. For component issues, check the component documentation 