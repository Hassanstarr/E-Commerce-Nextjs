import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ShopLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="flex min-h-dvh flex-col bg-white">
                <Navbar />
                <main className="flex flex-1 flex-col">
                    {children}
                </main>
                <Footer />
        </div>
    );
}