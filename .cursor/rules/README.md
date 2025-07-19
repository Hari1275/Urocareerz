# Cursor Rules for UroCareerz Project

This directory contains rules and guidelines for maintaining code quality and consistency in the UroCareerz project.

## Available Rules

### 1. TypeScript JWT Integration (`typescript-jwt.mdc`)

Guidelines for properly using JWT with TypeScript, addressing common type issues and best practices:

- Proper handling of JWT sign and verify methods
- Type assertions for JWT payloads
- Handling TypeScript errors with jsonwebtoken library

### 2. Next.js Environment Variables (`nextjs-env-variables.mdc`)

Guidelines for handling environment variables in Next.js applications:

- Validation of environment variables before use
- Documentation of environment variables
- Proper typing and parsing of environment variables

### 3. Next.js API Responses (`nextjs-api-responses.mdc`)

Guidelines for consistent API response handling in Next.js:

- Consistent response formats
- Proper error handling with appropriate status codes
- Use of try-catch blocks in API routes

## How to Use These Rules

1. Reference these rules when writing or reviewing code
2. Ensure new code follows the established patterns
3. Use the examples provided in each rule file as templates

## Environment Variables

For proper environment variable setup, create a `.env` file with the following variables:

```
# MongoDB Connection String
DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/urocareerz?retryWrites=true&w=majority"

# JWT Authentication
JWT_SECRET="your-jwt-secret-key-here"

# JWT Expiration (in seconds)
JWT_EXPIRES_IN=3600

# Node Environment
NODE_ENV=development
```

## Common Errors and Solutions

### JWT TypeScript Errors

If you encounter TypeScript errors with JWT methods:

1. Use `@ts-ignore` with a comment explaining why
2. Consider using Buffer for the secret: `Buffer.from(secret, 'utf-8')`
3. For production, create proper type definitions

### Environment Variable Errors

If environment variables are undefined:

1. Check if the variable exists in your `.env` file
2. Validate environment variables before use
3. Provide default values where appropriate 