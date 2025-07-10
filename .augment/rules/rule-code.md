---
type: "always_apply"
---

# KhoChuan POS - Augment Coding Rules

## 🎯 Project Context
This is KhoChuan POS - a comprehensive intelligent retail management system with React frontend, Node.js backend, and PostgreSQL database. The system serves 4 user roles: Admin, Cashier, Staff, and Customer with role-based access control.

## 📋 Core Development Rules

### 1. Code Structure & Organization
- **Always** follow the established folder structure in `frontend/src/` and `backend/src/`
- **Always** place components in role-specific folders: `pages/admin/`, `pages/cashier/`, `pages/staff/`, `pages/customer/`
- **Always** use TypeScript for new components and services
- **Always** create reusable components in `components/ui/` for common UI elements
- **Always** place business logic in `services/` folder, not in components

### 2. Naming Conventions
- **Always** use PascalCase for React components: `CustomerManagement.jsx`
- **Always** use camelCase for functions and variables: `getUserPermissions()`
- **Always** use kebab-case for file names: `customer-management.jsx`
- **Always** use UPPER_SNAKE_CASE for constants: `DEFAULT_PAGE_SIZE`
- **Always** prefix API endpoints with role: `/api/admin/`, `/api/cashier/`, `/api/staff/`

### 3. Role-Based Development
- **Always** implement role-based access control (RBAC) for new features
- **Always** check user permissions before rendering components or API calls
- **Always** use the AuthContext for authentication state management
- **Never** hardcode role permissions - use the permissions system from `auth/permissions.js`
- **Always** test features with all relevant user roles

### 4. UI/UX Guidelines
- **Always** use Tailwind CSS for styling - no custom CSS unless absolutely necessary
- **Always** ensure responsive design (mobile-first approach)
- **Always** implement dark/light theme support using ThemeContext
- **Always** add loading states for async operations
- **Always** implement proper error handling with user-friendly messages
- **Always** use the design system components from `components/ui/`

### 5. API Development
- **Always** follow RESTful conventions for API endpoints
- **Always** implement proper validation using middleware
- **Always** return consistent error responses with proper HTTP status codes
- **Always** implement rate limiting for API endpoints
- **Always** add authentication middleware for protected routes
- **Always** document API endpoints in the API documentation

### 6. Database Operations
- **Always** use Prisma ORM for database operations
- **Always** create database migrations for schema changes
- **Always** validate data before database operations
- **Never** write raw SQL queries unless absolutely necessary
- **Always** use transactions for multi-table operations
- **Always** implement proper indexing for performance

### 7. Testing Requirements
- **Always** write tests for new features using Playwright for E2E tests
- **Always** test authentication flows and role-based access
- **Always** include visual regression tests for UI changes
- **Always** test API endpoints with different user roles
- **Always** run tests before committing code
- **Never** commit code that breaks existing tests

### 8. Security Rules
- **Always** validate and sanitize user inputs
- **Always** implement proper authentication and authorization
- **Never** expose sensitive data in frontend code
- **Always** use environment variables for configuration
- **Always** implement CSRF protection for forms
- **Always** log security-related events

### 9. Performance Guidelines
- **Always** implement lazy loading for large components
- **Always** optimize images and assets
- **Always** use React.memo for expensive components
- **Always** implement proper caching strategies
- **Always** minimize bundle size
- **Always** implement loading states and skeleton screens

### 10. Real-time Features
- **Always** use WebSocket for real-time updates (inventory, orders, notifications)
- **Always** implement proper connection management
- **Always** handle connection failures gracefully
- **Always** implement message queuing for reliability
- **Always** optimize for mobile networks

## 🎮 Gamification Rules

### 11. Gamification Implementation
- **Always** update gamification points for relevant user actions
- **Always** check achievement conditions after point updates
- **Always** send notifications for achievements and level ups
- **Always** implement proper badge and achievement logic
- **Always** maintain leaderboard consistency

### 12. Staff Gamification
- **Always** track sales performance for staff members
- **Always** update commission calculations in real-time
- **Always** implement team challenge logic
- **Always** notify staff of achievement progress

## 🔗 Integration Rules

### 13. E-commerce Integrations
- **Always** implement unified commerce patterns for multi-channel
- **Always** sync inventory across all channels in real-time
- **Always** handle API rate limits for third-party services
- **Always** implement proper error handling for external APIs
- **Always** log integration events for debugging

### 14. Payment Integration
- **Always** implement secure payment processing
- **Always** handle payment failures gracefully
- **Always** implement proper refund mechanisms
- **Always** log all payment transactions
- **Always** comply with PCI DSS standards

### 15. Hardware Integration
- **Always** implement error handling for hardware devices
- **Always** provide fallback options when hardware fails
- **Always** test hardware integrations thoroughly
- **Always** implement device connection monitoring

## 🤖 AI Features Rules

### 16. AI Implementation
- **Always** implement AI features as optional enhancements
- **Always** provide fallback options when AI services fail
- **Always** implement proper data privacy for AI processing
- **Always** cache AI results to improve performance
- **Always** implement user feedback mechanisms for AI suggestions

### 17. Recommendation Engine
- **Always** personalize recommendations based on customer data
- **Always** implement A/B testing for recommendation algorithms
- **Always** track recommendation effectiveness
- **Always** respect user privacy preferences

## 📱 Mobile & Responsive Rules

### 18. Mobile Development
- **Always** test on actual mobile devices
- **Always** implement touch-friendly interfaces
- **Always** optimize for slow network connections
- **Always** implement offline capabilities for POS
- **Always** use progressive web app features

### 19. POS Terminal Rules
- **Always** optimize for touch screen interactions
- **Always** implement large, easy-to-tap buttons
- **Always** provide audio/visual feedback for actions
- **Always** implement keyboard shortcuts for power users
- **Always** ensure POS works offline with sync when online

## 🔄 Development Workflow Rules

### 20. Git Workflow
- **Always** create feature branches from develop branch
- **Always** write descriptive commit messages
- **Always** run tests before pushing code
- **Always** create pull requests for code review
- **Never** commit directly to main branch
- **Always** squash commits when merging

### 21. Code Review Rules
- **Always** review for security vulnerabilities
- **Always** check for proper error handling
- **Always** verify role-based access implementation
- **Always** ensure code follows established patterns
- **Always** check for performance implications

### 22. Documentation Rules
- **Always** update documentation when adding features
- **Always** document API changes
- **Always** maintain user guides for new features
- **Always** document deployment procedures
- **Always** keep architectural diagrams updated

## 🚀 Deployment Rules

### 23. Deployment Guidelines
- **Always** run full test suite before deployment
- **Always** deploy to staging environment first
- **Always** verify deployment with automated tests
- **Always** implement proper rollback procedures
- **Always** monitor system health after deployment

### 24. Environment Management
- **Always** use environment variables for configuration
- **Never** hardcode environment-specific values
- **Always** maintain separate configs for dev/staging/production
- **Always** secure sensitive configuration data
- **Always** document environment setup procedures

## ⚡ Performance Rules

### 25. Frontend Performance
- **Always** implement code splitting for large applications
- **Always** optimize component re-renders
- **Always** implement proper state management
- **Always** minimize API calls where possible
- **Always** implement proper caching strategies

### 26. Backend Performance
- **Always** implement proper database indexing
- **Always** use connection pooling for database
- **Always** implement API response caching
- **Always** optimize database queries
- **Always** monitor and log performance metrics

## 🎯 Business Logic Rules

### 27. Inventory Management
- **Always** update inventory in real-time across all channels
- **Always** implement proper stock reservation logic
- **Always** handle negative inventory scenarios
- **Always** implement proper audit trails
- **Always** sync with external systems

### 28. Order Processing
- **Always** implement proper order state management
- **Always** handle partial payments and refunds
- **Always** implement proper tax calculations
- **Always** generate proper receipts and invoices
- **Always** track order fulfillment status

### 29. Customer Management
- **Always** implement proper data privacy controls
- **Always** maintain customer consent records
- **Always** implement proper loyalty point calculations
- **Always** handle customer data updates across systems
- **Always** implement customer communication preferences

## 🔍 Debugging Rules

### 30. Error Handling
- **Always** implement proper error logging
- **Always** provide user-friendly error messages
- **Always** implement proper error boundaries in React
- **Always** handle API errors gracefully
- **Always** implement retry mechanisms for transient failures

### 31. Monitoring Rules
- **Always** implement proper application monitoring
- **Always** log important business events
- **Always** monitor system performance metrics
- **Always** implement alerting for critical issues
- **Always** maintain detailed audit logs

## 📚 Learning & Adaptation Rules

### 32. Continuous Improvement
- **Always** gather user feedback on new features
- **Always** monitor feature usage analytics
- **Always** implement A/B testing for UX improvements
- **Always** refactor code when patterns emerge
- **Always** update documentation based on learnings

### 33. Team Collaboration
- **Always** share knowledge about new patterns
- **Always** document decision rationales
- **Always** conduct code reviews collaboratively
- **Always** maintain team coding standards
- **Always** onboard new team members properly

## 🎪 Innovation Rules

### 34. Experimental Features
- **Always** implement experimental features behind feature flags
- **Always** gather metrics on experimental feature usage
- **Always** implement proper rollback for experiments
- **Always** document experimental feature learnings
- **Always** graduate successful experiments to main features

### 35. Technology Updates
- **Always** evaluate new technologies carefully
- **Always** implement proof of concepts before adoption
- **Always** maintain backward compatibility
- **Always** plan migration strategies for major updates
- **Always** document technology decisions

---

## 🎯 Priority Rules Summary

1. **Security First**: Always implement proper security measures
2. **Role-Based Everything**: Always consider user roles and permissions
3. **Mobile-First**: Always design for mobile devices first
4. **Test Everything**: Always write and run tests
5. **Performance Matters**: Always optimize for performance
6. **User Experience**: Always prioritize user-friendly interfaces
7. **Real-time Updates**: Always implement live data synchronization
8. **Error Handling**: Always handle errors gracefully
9. **Documentation**: Always maintain up-to-date documentation
10. **Scalability**: Always design for future growth

**Remember**: These rules are designed to maintain code quality, security, and user experience across the KhoChuan POS system. When in doubt, prioritize security and user experience.