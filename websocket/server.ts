import { createServer, type IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { getChatRuntime, type createChatRuntime } from "./chat-server";
import { getChatIdentity } from "@/services/chat.service";
import { rateLimiters } from "@/lib/rate-limit";
import AppError from "@/lib/AppError";

export function getChatCookie(request: IncomingMessage) {
    return request.headers.cookie?.split(";").map((value) => value.trim())
        .find((value) => value.startsWith("auth_token="))?.slice("auth_token=".length) || "";
}

export function createLocalChatServer(options: {
    origins: string[];
    runtime?: ReturnType<typeof createChatRuntime>;
    connectionLimit?: (ip: string) => Promise<{ success: boolean }>;
}) {
    const runtime = options.runtime || getChatRuntime();
    const httpServer = createServer((request, response) => {
        response.writeHead(request.url === "/health" ? 200 : 426, { "Content-Type": "text/plain" });
        response.end(request.url === "/health" ? "Chat server running" : "A WebSocket connection is required");
    });
    const websocketServer = new WebSocketServer({ noServer: true, maxPayload: 16384 });
    httpServer.on("upgrade", (request, socket, head) => {
        socket.on("error", () => socket.destroy());
        void (async () => {
            try {
                if (request.url !== "/api/chat/socket" || !options.origins.includes(request.headers.origin || "")) {
                    throw new AppError("Invalid chat origin", 403);
                }
                const limit = options.connectionLimit || ((ip: string) => rateLimiters.chatConnection.limit(ip));
                if (!(await limit(request.socket.remoteAddress || "local-development")).success) {
                    throw new AppError("Too many chat connections", 429);
                }
                const token = getChatCookie(request);
                await getChatIdentity(token);
                websocketServer.handleUpgrade(request, socket, head, (websocket) => {
                    void runtime.attach(websocket, token);
                });
            } catch (error) {
                const status = error instanceof AppError ? error.statusCode : 503;
                socket.end(`HTTP/1.1 ${status} Chat connection rejected\r\nConnection: close\r\n\r\n`);
            }
        })();
    });

    return {
        httpServer,
        async close() {
            await runtime.close();
            websocketServer.close();
            await new Promise<void>((resolve, reject) => httpServer.close((error) => error ? reject(error) : resolve()));
        },
    };
}
