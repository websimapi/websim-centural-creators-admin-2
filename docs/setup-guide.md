# Centural Creators Admin Panel - Setup Guide

## Installation and Configuration Instructions

This guide provides step-by-step instructions for setting up and configuring the Centural Creators Admin Panel and AI Analysis System.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Configuration](#3-configuration)
4. [Database Setup](#4-database-setup)
5. [AI Services Configuration](#5-ai-services-configuration)
6. [User Management](#6-user-management)
7. [Troubleshooting](#7-troubleshooting)

## 1. Prerequisites

Before installing the Centural Creators Admin Panel, ensure you have the following:

- Web server with HTTP support (Apache, Nginx, etc.)
- Node.js 14.x or higher (for development and build processes)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- API access credentials for external services (if applicable)

## 2. Installation

### 2.1 Clone the Repository

```bash
git clone https://github.com/centural/creators-admin-panel.git
cd creators-admin-panel
```

### 2.2 Install Dependencies (Development Only)

If you need to modify or build the application:

```bash
npm install
```

### 2.3 Build the Application (Development Only)

```bash
npm run build
```

### 2.4 Deploy to Web Server

Copy the contents of the `dist` directory (or all files in this repository if using the pre-built version) to your web server's root directory or appropriate subdirectory.

```bash
cp -r dist/* /var/www/html/creators-admin/
```

## 3. Configuration

### 3.1 Basic Configuration

The system comes with default configuration that can be modified through the Settings panel once you're logged in.

For initial setup, you may need to modify the following files:

#### API Endpoint Configuration

If you need to change the default API endpoints before first login, edit `js/api-service.js`:

```javascript
// Find this line in api-service.js
this.baseUrl = 'https://api.centrural.com/v1'; // Change to your API endpoint
```

### 3.2 Environment-Specific Configuration

For different environments (development, staging, production), you can create specific configuration files.

Create a file named `config.js` in the root directory with the following structure:

```javascript
const CONFIG = {
  apiBaseUrl: 'https://api.centrural.com/v1',
  enableAnalytics: true,
  debugMode: false,
  aiServiceEndpoint: 'https://ai-service.centrural.com'
};
```

## 4. Database Setup

The admin panel uses a database service for data persistence. Follow these steps to set up the database:

### 4.1 Database Connection

The system is designed to work with various database backends. Configuration is handled through the `database-service.js` file.

For production use, you'll need to update the service to connect to your actual database instead of using mock data:

```javascript
// Example modification for a real database connection in database-service.js
async init() {
  try {
    // Replace with actual database connection code
    this.db = await connectToDatabase({
      url: 'your-database-connection-string',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    });
    this.initialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize database', error);
    throw error;
  }
}
```

### 4.2 Database Schema

The system uses the following collections (tables):

1. **applicants** - Stores applicant information
2. **analysis_results** - Stores AI analysis results
3. **activity_logs** - Tracks system activity
4. **system_settings** - Stores application settings

Sample schema for each collection is available in the `database-schemas` directory (you may need to create this).

### 4.3 Initial Data

You can populate the database with initial data using the following script (adjust as needed for your database system):

```javascript
// Example script for populating initial data
const initialSettings = {
  minThreshold: 75,
  analysisDepth: 'standard',
  notifyNewApplicants: true,
  notifyAnalysisComplete: true,
  apiKey: 'YOUR_DEFAULT_API_KEY',
  apiEndpoint: 'https://api.centrural.com/v1/'
};

// Insert into your database
db.collection('system_settings').insertOne(initialSettings);
```

## 5. AI Services Configuration

The AI analysis functionality requires configuration to work properly.

### 5.1 AI Model Setup

The system can connect to various AI services for portfolio analysis. Configure the AI service in `ai-analysis-service.js`:

```javascript
// Example configuration for connecting to an actual AI service
async init() {
  try {
    // Replace with actual AI service initialization
    this.aiModel = await loadAIModel({
      modelUrl: 'https://your-ai-service.com/model',
      apiKey: 'YOUR_AI_SERVICE_API_KEY'
    });
    this.initialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize AI Analysis Service', error);
    throw error;
  }
}
```

### 5.2 Analysis Parameters

You can configure the analysis parameters through the Settings panel in the admin UI once logged in.

## 6. User Management

### 6.1 Initial Admin User

By default, the system includes a single admin user. In a production environment, you should modify this to use your authentication system.

To configure users, you'll need to implement or connect to an authentication service.

### 6.2 Authentication Integration

Modify the application to use your authentication system by updating authentication logic in the app.

Example integration with a custom auth service:

```javascript
// Add to app.js
import authService from './auth-service.js';

// Then update the login method
async login(username, password) {
  try {
    const user = await authService.authenticate(username, password);
    if (user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}
```

## 7. Troubleshooting

### 7.1 Common Issues

#### Application Not Loading

- Check browser console for JavaScript errors
- Verify all files are properly deployed
- Ensure server has proper permissions for files

#### API Connection Issues

- Verify API endpoint is correct in settings
- Check network tab in browser dev tools for failed requests
- Confirm API key is valid and has proper permissions

#### Database Connection Issues

- Verify database connection string
- Check database user permissions
- Look for connection timeout errors in logs

### 7.2 Logging

The application logs errors to the browser console. For production, consider implementing a more robust logging solution:

```javascript
// Example logging enhancement
class Logger {
  static log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
    
    // Add remote logging here if needed
    if (level === 'error' && CONFIG.remoteLogging) {
      sendToRemoteLogging(message, level, timestamp);
    }
  }
  
  static error(message) {
    this.log(message, 'error');
  }
  
  static warn(message) {
    this.log(message, 'warn');
  }
  
  static info(message) {
    this.log(message, 'info');
  }
}

// Use it instead of console.log/error
Logger.error('Failed to connect to database');
```

### 7.3 Getting Help

If you encounter issues not covered in this guide:

- Check the documentation directory for additional guides
- Open an issue in the GitHub repository
- Contact Centural Creators support at support@centrural.com

## 8. Additional Resources

- [Full System Documentation](./documentation.md)
- [API Documentation](./api-docs.md) (if available)
- [Database Schema Reference](../database-schema.md)

---

This setup guide should help you get the Centural Creators Admin Panel up and running. For more detailed information about system architecture and features, refer to the main documentation file.