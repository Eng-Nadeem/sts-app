// This file is maintained for compatibility with other parts of the application
// We're actually using MongoDB for this project, not PostgreSQL

// Create dummy exports to avoid breaking imports
export const pool = null;
export const db = { query: {}, insert: () => {}, select: () => {} };

console.log("MongoDB is the primary database for this application. PostgreSQL is not being used.");