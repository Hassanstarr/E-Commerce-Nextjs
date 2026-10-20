import type { ChatConversation } from "@/types/chat";

export function getPreviewConversations(): ChatConversation[] {
    return [
        {
            id: "sample-alex",
            name: "Alex Taylor",
            email: "alex@example.com",
            unread: 0,
            messages: [
                { id: "alex-1", sender: "user", text: "Hi! Can you help me check the delivery time for an order?", time: "10:24 AM" },
                { id: "alex-2", sender: "admin", text: "Of course. Please share your order number so I can take a look.", time: "10:25 AM" },
                { id: "alex-3", sender: "user", text: "Thanks! Where can I find my order number?", time: "10:26 AM" },
            ],
        },
        {
            id: "sample-maya",
            name: "Maya Jordan",
            email: "maya@example.com",
            unread: 2,
            messages: [
                { id: "maya-1", sender: "user", text: "Hello, I have a question about returning an item.", time: "10:12 AM" },
                { id: "maya-2", sender: "user", text: "Does it need to be in the original packaging?", time: "10:13 AM" },
            ],
        },
        {
            id: "sample-sam",
            name: "Sam Reed",
            email: "sam@example.com",
            unread: 1,
            messages: [
                { id: "sam-1", sender: "user", text: "Is the wireless keyboard available in another color?", time: "9:48 AM" },
            ],
        },
    ];
}
