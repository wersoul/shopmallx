// Augment CloudflareEnv with our D1 binding
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    JWT_SECRET?: string;
  }
}

export {};