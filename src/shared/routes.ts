// Shared route definitions for frontend and backend

export const ROUTES = {
  // API base
  BASE: '/api',

  // Misc routes
  PING: '/api/ping',
  COUNT: '/api/count',

  // Protocard routes
  PROTOCARDS: {
    BASE: '/api/protocards',
    GET_ALL: '/api/protocards/',
    GET_COUNT: '/api/protocards/count',
    CREATE: '/api/protocards/',
    UPDATE: (entityId: string) => `/api/protocards/${entityId}`,
    DELETE: (entityId: string) => `/api/protocards/${entityId}`,
  },

  // SSE routes
  SSE: '/api/events',
} as const;

// Specific API path builders -- for frontend
export const API_PATHS_FRONTEND = {
  ping: () => ROUTES.PING,
  count: () => ROUTES.COUNT,

  protocards: {
    getAll: () => ROUTES.PROTOCARDS.BASE,
    getCount: () => ROUTES.PROTOCARDS.GET_COUNT,
    create: () => ROUTES.PROTOCARDS.BASE,
    update: (entityId: string | number) =>
      ROUTES.PROTOCARDS.UPDATE(entityId.toString()),
    delete: (entityId: string | number) =>
      ROUTES.PROTOCARDS.DELETE(entityId.toString()),
  },

  sse: () => ROUTES.SSE,
} as const;

// Helper to extract relative path from full path by removing base. make sure base occurs at the start!
export const subtractBase = (fullPath: string, basePath: string): string => {
  if (!fullPath.startsWith(basePath)) {
    throw new Error(`Path ${fullPath} does not start with base ${basePath}`);
  }
  return fullPath.replace(basePath, '') || '/';
};

// The same, for backend
export const API_PATHS_BACKEND = {
  ping: subtractBase(ROUTES.PING, ROUTES.BASE),
  count: subtractBase(ROUTES.COUNT, ROUTES.BASE),

  protocards: {
    getAll: subtractBase(ROUTES.PROTOCARDS.GET_ALL, ROUTES.PROTOCARDS.BASE),
    getCount: subtractBase(ROUTES.PROTOCARDS.GET_COUNT, ROUTES.PROTOCARDS.BASE),
    create: subtractBase(ROUTES.PROTOCARDS.CREATE, ROUTES.PROTOCARDS.BASE),
    update: subtractBase(ROUTES.PROTOCARDS.UPDATE(':entityId'), ROUTES.BASE),
    delete: subtractBase(ROUTES.PROTOCARDS.DELETE(':entityId'), ROUTES.BASE),
  },

  sse: subtractBase(ROUTES.SSE, ROUTES.BASE),
} as const;
