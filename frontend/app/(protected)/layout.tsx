import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Wrapper */}
        <div className="ml-64 mt-16 flex-1 bg-[#f9f9f9] min-h-[calc(100vh-4rem)] flex justify-center">
          
          {/* Centered Content */}
          <main className="w-full max-w-6xl px-6 py-6">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}