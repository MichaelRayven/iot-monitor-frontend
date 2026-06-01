export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Derive WebSocket URL from the REST base URL (http→ws, https→wss)
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");
