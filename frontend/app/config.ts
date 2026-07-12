const isClient = typeof window !== "undefined";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (isClient && window.location.hostname !== "localhost"
    ? "https://PrepStackai-mkhh.onrender.com"
    : "http://localhost:5001");
