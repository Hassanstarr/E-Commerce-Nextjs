import AdminChatView from "@/components/admin/AdminChatView";

export default function AdminChatsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Chats</h1>
            </div>
            <p className="mb-6 text-sm leading-6 text-gray-500">Explore sample conversations. Replies are not sent to customers and reset when you leave this page.</p>
            <AdminChatView />
        </div>
    );
}
