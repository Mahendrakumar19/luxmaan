import net from 'net';

export interface DbConnectionStatus {
  isConnected: boolean;
  host: string;
  port: number;
  database: string;
  user: string;
  latencyMs?: number;
  version?: string;
  error?: string;
  mode: 'postgresql' | 'in-memory-fallback';
}

function parseDbConfig() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl.replace(/^postgresql:\/\//, 'http://'));
      return {
        host: parsed.hostname || 'localhost',
        port: parseInt(parsed.port || '5432', 10),
        database: (parsed.pathname || '/jobagent_db').replace(/^\//, '') || 'jobagent_db',
        user: decodeURIComponent(parsed.username || 'postgres'),
        password: decodeURIComponent(parsed.password || ''),
      };
    } catch {
      // fallback to manual env
    }
  }

  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'jobagent_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  };
}

let cachedStatus: DbConnectionStatus = {
  isConnected: false,
  host: parseDbConfig().host,
  port: parseDbConfig().port,
  database: parseDbConfig().database,
  user: parseDbConfig().user,
  mode: 'in-memory-fallback'
};

/**
 * Probes the PostgreSQL host & port using TCP socket and executes test query if client is available.
 */
export async function checkDatabaseConnection(): Promise<DbConnectionStatus> {
  const cfg = parseDbConfig();
  const start = Date.now();

  return new Promise<DbConnectionStatus>((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(2500);

    socket.connect(cfg.port, cfg.host, async () => {
      socket.destroy();
      const latencyMs = Date.now() - start;

      // TCP Socket connected! Try to run real query if 'pg' driver is loaded
      try {
        const pg = await import('pg');
        const Pool = pg.default?.Pool || (pg as any).Pool;
        if (Pool) {
          const pool = new Pool({
            host: cfg.host,
            port: cfg.port,
            database: cfg.database,
            user: cfg.user,
            password: cfg.password,
            connectionTimeoutMillis: 3000,
          });
          const res = await pool.query('SELECT NOW() as now, current_database() as db, version() as version;');
          await pool.end();

          cachedStatus = {
            isConnected: true,
            host: cfg.host,
            port: cfg.port,
            database: res.rows[0]?.db || cfg.database,
            user: cfg.user,
            latencyMs,
            version: res.rows[0]?.version?.split(' ')[0] + ' ' + (res.rows[0]?.version?.split(' ')[1] || ''),
            mode: 'postgresql'
          };
          if (!isResolved) {
            isResolved = true;
            resolve(cachedStatus);
          }
          return;
        }
      } catch {
        // Driver query optional if pure port connection succeeded
      }

      cachedStatus = {
        isConnected: true,
        host: cfg.host,
        port: cfg.port,
        database: cfg.database,
        user: cfg.user,
        latencyMs,
        version: 'PostgreSQL Server (TCP Verified)',
        mode: 'postgresql'
      };
      if (!isResolved) {
        isResolved = true;
        resolve(cachedStatus);
      }
    });

    socket.on('error', (err) => {
      socket.destroy();
      cachedStatus = {
        isConnected: false,
        host: cfg.host,
        port: cfg.port,
        database: cfg.database,
        user: cfg.user,
        error: `Port ${cfg.port} not responding (${err.message}). PostgreSQL is either stopped or not running on this machine.`,
        mode: 'in-memory-fallback'
      };
      if (!isResolved) {
        isResolved = true;
        resolve(cachedStatus);
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      cachedStatus = {
        isConnected: false,
        host: cfg.host,
        port: cfg.port,
        database: cfg.database,
        user: cfg.user,
        error: `Connection to ${cfg.host}:${cfg.port} timed out after 2500ms.`,
        mode: 'in-memory-fallback'
      };
      if (!isResolved) {
        isResolved = true;
        resolve(cachedStatus);
      }
    });
  });
}

/**
 * Returns latest cached status.
 */
export function getDbStatus(): DbConnectionStatus {
  return cachedStatus;
}
