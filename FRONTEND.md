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
- **Socket.io-client** (v4.7.4) - Real-time communication

### UI and Styling
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **DaisyUI** (v5.0.40) - Component library for Tailwind CSS
- **React Hot Toast** (v2.5.2) - Toast notifications
- **Lucide React** - Icon library
- **React Hook Form** (v7.50.0) - Form handling
- **Zod** (v3.22.4) - Schema validation

### Development Tools
- **ESLint** (v9.25.0) - Code linting
- **PostCSS** (v8.5.3) - CSS processing
- **Autoprefixer** (v10.4.21) - CSS vendor prefixing
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## Project Structure
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── ui/       # Base UI components
│   │   └── ...       # Other components
│   ├── pages/        # Page components
│   │   ├── Admin/    # Admin pages
│   │   ├── Auth/     # Authentication pages
│   │   ├── DepartmentRep/ # Department pages
│   │   ├── GSOStaff/ # GSO staff pages
│   │   └── Shared/   # Shared pages
│   ├── hooks/        # Custom React hooks
│   ├── store/        # Zustand store
│   ├── utils/        # Utility functions
│   ├── api/          # API integration
│   ├── context/      # React context providers
│   ├── lib/          # Library configurations
│   ├── tests/        # Test files
│   └── App.jsx       # Root component
├── public/           # Static assets
├── node_modules/     # Dependencies
├── index.html        # Entry HTML file
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js # PostCSS configuration
├── components.json   # Component configuration
├── jsconfig.json    # JavaScript configuration
├── eslint.config.js # ESLint configuration
└── package.json     # Project dependencies and scripts
```

## UI Components

### Base Components
The project includes several reusable base components located in `src/components/ui/`:

- **Button** (`button.jsx`) - Customizable button component
- **Card** (`card.jsx`) - Card container component
- **Input** (`input.jsx`) - Form input component
- **Label** (`label.jsx`) - Form label component
- **Checkbox** (`checkbox.jsx`) - Checkbox input component
- **Table** (`table.jsx`) - Data table component
- **Modal** (`modal.jsx`) - Modal dialog component
- **Dropdown** (`dropdown.jsx`) - Dropdown menu component
- **Toast** (`toast.jsx`) - Notification component
- **Loading** (`loading.jsx`) - Loading spinner component
- **ErrorBoundary** (`error-boundary.jsx`) - Error handling component

### Authentication Components
- **LoginForm** - Login form component
- **AuthLayout** - Authentication page layout
- **ProtectedRoute** - Route protection component
- **ResetPasswordForm** - Password reset form
- **PasswordResetForm** - Password reset request form

### Navigation Components
- **AppSidebar** - Main application sidebar
- **NavUser** - User navigation menu
- **NavMain** - Main navigation menu
- **NavProjects** - Projects navigation menu
- **TeamSwitcher** - Team switching component

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

### Testing
To run tests:
```bash
npm run test
```

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
- Real-time updates with Socket.io
- Reusable UI components
- Authentication system
- Form validation with Zod
- Error boundary implementation
- Loading states and skeletons
- Responsive layouts
- Dark mode support
- Role-based access control
- User preferences management
- Session management
- Department management
- Inventory tracking
- Procurement system
- Incident reporting

## Best Practices
1. Use functional components with hooks
2. Follow the component-based architecture
3. Implement proper error handling
4. Use TypeScript for type safety
5. Follow ESLint rules for code consistency
6. Implement responsive design using Tailwind CSS
7. Maintain consistent component structure
8. Use proper semantic HTML elements
9. Write unit tests for components
10. Implement proper loading states
11. Use React Context for global state
12. Follow accessibility guidelines
13. Implement proper form validation
14. Use proper state management
15. Implement proper error boundaries
16. Use proper routing guards
17. Implement proper session management
18. Use proper API error handling
19. Implement proper real-time updates
20. Use proper caching strategies

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Dependencies
### Production Dependencies
- react: ^19.1.0
- react-dom: ^19.1.0
- react-router-dom: ^7.6.1
- zustand: ^5.0.5
- axios: ^1.9.0
- socket.io-client: ^4.7.4
- react-hot-toast: ^2.5.2
- lucide-react: ^0.344.0
- @hookform/resolvers: ^3.3.4
- react-hook-form: ^7.50.0
- zod: ^3.22.4

### Development Dependencies
- @vitejs/plugin-react: ^4.4.1
- tailwindcss: ^3.4.17
- daisyui: ^5.0.40
- eslint: ^9.25.0
- postcss: ^8.5.3
- autoprefixer: ^10.4.21
- jest: ^29.7.0
- @testing-library/react: ^14.1.2
- @testing-library/jest-dom: ^6.4.2

## Contributing
1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed
5. Create pull requests for new features
6. Add tests for new components
7. Ensure responsive design
8. Follow accessibility guidelines

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
5. For test failures, check the test configuration
6. For TypeScript errors, verify type definitions
7. For real-time issues, check Socket.io configuration
8. For state management issues, check Zustand store
9. For routing issues, check React Router configuration
10. For API issues, check Axios configuration 