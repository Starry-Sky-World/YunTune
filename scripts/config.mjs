#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import readline from "node:readline/promises";

const CONFIG_PATH = path.join(process.cwd(), "config.json");
const EXAMPLE_PATH = path.join(process.cwd(), "config.example.json");

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readJsonIfExists(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function base64url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function normalizeBaseUrl(input) {
  const v = String(input ?? "").trim();
  if (!v) return "";
  try {
    const url = new URL(v);
    return url.toString().replace(/\/+$/, "");
  } catch {
    return v.replace(/\/+$/, "");
  }
}

function mask(value) {
  if (!value) return "";
  const s = String(value);
  if (s.length <= 8) return "********";
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function printNonInteractiveHelp() {
  console.log("Non-interactive mode detected.");
  console.log(`Create ${path.relative(process.cwd(), CONFIG_PATH)} manually or copy example:`);
  console.log(`  cp ${path.relative(process.cwd(), EXAMPLE_PATH)} ${path.relative(process.cwd(), CONFIG_PATH)}`);
  process.exit(1);
}

async function main() {
  if (!process.stdin.isTTY) printNonInteractiveHelp();

  const existing = readJsonIfExists(CONFIG_PATH);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log("YunTune config helper");
    console.log(`Will write: ${path.relative(process.cwd(), CONFIG_PATH)}`);
    console.log("");

    const defaultAppName = existing.NEXT_PUBLIC_APP_NAME ?? process.env.NEXT_PUBLIC_APP_NAME ?? "YunTune";
    const appName = (await rl.question(`NEXT_PUBLIC_APP_NAME (${defaultAppName}): `)).trim() || defaultAppName;

    const defaultBase = normalizeBaseUrl(existing.NETEASE_API_BASE_URL ?? process.env.NETEASE_API_BASE_URL ?? "");
    let baseUrl = (await rl.question(`NETEASE_API_BASE_URL (${defaultBase || "required"}): `)).trim() || defaultBase;
    baseUrl = normalizeBaseUrl(baseUrl);
    if (!baseUrl) {
      console.error("NETEASE_API_BASE_URL is required.");
      process.exit(1);
    }
    if (!/^https?:\/\//i.test(baseUrl)) {
      console.error("NETEASE_API_BASE_URL must start with http(s)://");
      process.exit(1);
    }

    const existingSecret = existing.SESSION_SECRET ?? process.env.SESSION_SECRET ?? "";
    const secretInput = (await rl.question(
      `SESSION_SECRET (${existingSecret ? mask(existingSecret) : "leave blank to generate"}): `,
    )).trim();
    const sessionSecret = secretInput || existingSecret || base64url(crypto.randomBytes(48));

    const nextConfig = {
      NEXT_PUBLIC_APP_NAME: appName,
      NETEASE_API_BASE_URL: baseUrl,
      SESSION_SECRET: sessionSecret,
    };

    console.log("");
    console.log("Summary:");
    console.log(`- NEXT_PUBLIC_APP_NAME: ${nextConfig.NEXT_PUBLIC_APP_NAME}`);
    console.log(`- NETEASE_API_BASE_URL: ${nextConfig.NETEASE_API_BASE_URL}`);
    console.log(`- SESSION_SECRET: ${mask(nextConfig.SESSION_SECRET)}`);

    const confirm = (await rl.question("Write config.json? (y/N): ")).trim().toLowerCase();
    if (confirm !== "y" && confirm !== "yes") {
      console.log("Canceled.");
      process.exit(0);
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(nextConfig, null, 2) + "\n", "utf8");
    console.log(`Wrote ${path.relative(process.cwd(), CONFIG_PATH)}`);
    console.log("Next:");
    console.log("  npm run dev");
  } finally {
    rl.close();
  }
}

await main();

