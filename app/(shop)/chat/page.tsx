import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UserChat from "@/components/chat/UserChat";

export default function ChatPage() {
    return (
        <ProtectedRoute>
            <section className="flex-1 bg-gray-50 px-4 py-8 sm:py-10">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-5 flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Live Chat</h1>
                    </div>
                    <p className="mb-6 text-sm leading-6 text-gray-500">Try the chat interface. Messages are not sent and reset when you leave this page.</p>
                    <UserChat />
                </div>
            </section>
        </ProtectedRoute>
    );
}
