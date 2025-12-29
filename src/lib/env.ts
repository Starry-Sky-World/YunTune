export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function getPublicEnv() {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "YunTune",
  };
}

