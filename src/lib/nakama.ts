import { Client } from "@heroiclabs/nakama-js";

const HOST = process.env.NEXT_PUBLIC_NAKAMA_HOST ?? "127.0.0.1";
const PORT = process.env.NEXT_PUBLIC_NAKAMA_PORT ?? "7350";
const SERVER_KEY = process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY ?? "defaultkey";
const USE_SSL = process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === "true";

export const nakamaClient = new Client(SERVER_KEY, HOST, PORT, USE_SSL);
