export interface ServerConfig {
  port: number;
  host: string;
}

export interface DatabaseConfig {
  path: string;
}

export interface Config {
  server: ServerConfig;
  database: DatabaseConfig;
} 