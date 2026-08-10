# Tax Management System

A full-stack application for managing taxpayers, computing taxes, generating reports, and backing up data.

## Tech Stack
- **Backend:** Spring Boot 3.3, JPA/Hibernate, MySQL
- **Security:** JWT (JSON Web Token) authentication
- **Frontend:** React 18 + Vite + Tailwind CSS
- **API Docs:** Swagger (OpenAPI)
- **Testing:** JUnit 5, Mockito

## Prerequisites
- Java 17+
- MySQL 8.0+
- Node.js (only for frontend development)
- Maven

## Setup & Running

### 1. Database
Create a MySQL database (or the app will create it automatically):
\`\`\`sql
CREATE DATABASE IF NOT EXISTS tax_management_db;
\`\`\`
Default credentials: root / root (edit \`src/main/resources/application.yml\` if needed).

### 2. Backend
\`\`\`bash
cd tax-management-system
mvn spring-boot:run
\`\`\`
The server starts at http://localhost:8080.

### 3. Frontend (production build served by backend)
The React frontend is already built and included in the static resources.  
No separate frontend server is needed.

For development, the frontend source lives in \`frontend\` folder:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Then open http://localhost:5173.

## Default Admin Login
- **Username:** admin
- **Password:** admin123

## API Documentation
After starting the backend, visit:  
**http://localhost:8080/swagger-ui.html**

Click the Authorize button (🔒) and paste the JWT token obtained from the login endpoint.

## Running Tests
\`\`\`bash
cd tax-management-system
mvn test
\`\`\`

## Project Structure
\`\`\`
tax-management-system
├── src/main/java/com/taxmanagement
│   ├── config/          # Security, CORS, Swagger config
│   ├── controller/      # REST controllers
│   ├── dto/             # Request/Response DTOs
│   ├── entity/          # JPA entities
│   ├── exception/       # Global exception handler
│   ├── repository/      # Spring Data repositories
│   ├── security/        # JWT utilities & filters
│   ├── service/         # Business logic
│   └── util/            # Tax calculator, PDF/Excel generators
├── src/main/resources
│   ├── application.yml  # Main configuration
│   └── static/          # Built React app
└── frontend/            # React source (optional)
\`\`\`

## License
This project is for educational purposes.