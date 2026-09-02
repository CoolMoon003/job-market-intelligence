import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import TopNavbar from "../dashboard/TopNavbar";

export default function AppLayout({ children, onRefresh }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0B1020] text-white flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 min-h-screen w-full min-w-0">
                <TopNavbar
                    onRefresh={onRefresh}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <div className="p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}