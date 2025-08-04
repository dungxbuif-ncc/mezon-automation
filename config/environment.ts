import type { Environment } from "../src/types";

/**
 * Environment Configuration - File mẫu cấu hình môi trường
 * Pattern này áp dụng cho database.config.ts, api.config.ts, etc.
 */

// Environment type
type EnvironmentName = "dev";

// Environment configurations
const environments: Record<EnvironmentName, Environment> = {
  dev: {
    name: "dev",
    baseUrl: "https://dev-mezon.nccsoft.vn",
    apiUrl: "https://dev-mezon.nccsoft.vn/api",
    credentials: {
      admin: {
        id: "admin-dev",
        email: "admin@mezon-dev.test",
        password: process.env.DEV_ADMIN_PASSWORD || "DevAdmin123!",
        firstName: "Dev",
        lastName: "Admin", 
        role: "admin" as any
      },
      user: {
        id: "user-dev",
        email: "user@mezon-dev.test", 
        password: process.env.DEV_USER_PASSWORD || "DevUser123!",
        firstName: "Dev",
        lastName: "User",
        role: "user" as any
      }
    }
  },

};

/**
 * Get current environment từ ENV variable hoặc default
 */
export function getCurrentEnvironment(): Environment {
  const envName = (process.env.TEST_ENV || "local") as EnvironmentName;
  
  if (!environments[envName]) {
    throw new Error(`Environment "${envName}" không được support. Available: ${Object.keys(environments).join(", ")}`);
  }
  
  return environments[envName];
}

/**
 * Get environment by name
 */
export function getEnvironment(name: EnvironmentName): Environment {
  return environments[name];
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return getCurrentEnvironment().name === "prod";
}

/**
 * Get test timeout based on environment
 */
export function getTestTimeout(): number {
  const env = getCurrentEnvironment();
  const timeouts: Record<string, number> = {
    local: 30000,
    dev: 60000, 
    staging: 90000,
    prod: 120000
  };
  
  return timeouts[env.name] || 30000;
}