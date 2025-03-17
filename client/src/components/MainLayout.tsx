import { ThemeToggle } from "./ThemeToggle";
import { Clock } from "lucide-react";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Clock className="text-primary h-6 w-6 mr-2" />
              <h1 className="text-xl font-semibold">TimeZone Converter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
