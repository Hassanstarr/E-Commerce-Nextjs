import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

async function start() {
    const { createLocalChatServer } = await import("./server");
    const appOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").origin;
    const server = createLocalChatServer({ origins: [appOrigin, "http://localhost:3000", "http://127.0.0.1:3000"] });
    server.httpServer.listen(3001, "127.0.0.1", () => console.log("Live chat WebSocket server: ws://localhost:3001/api/chat/socket"));

    const stop = async () => {
        await server.close();
        process.exit(0);
    };
    process.once("SIGINT", () => { void stop(); });
    process.once("SIGTERM", () => { void stop(); });
}

start().catch((error) => { console.error("Unable to start live chat:", error); process.exitCode = 1; });
