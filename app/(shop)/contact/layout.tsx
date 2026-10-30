import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Contact Us", "Contact ShopEase with questions about products, orders or your shopping experience.", "/contact");

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
