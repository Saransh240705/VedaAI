const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error(
    "[PrepStackAI] FATAL: JWT_SECRET environment variable is not set. Server cannot start without it.",
  );
  process.exit(1);
}

export const JWT_SECRET: string = secret;
