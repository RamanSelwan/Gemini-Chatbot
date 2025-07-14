"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/"); // ✅ Next.js redirect
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-pacifico">
            Gemini Chat
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <i
              className={`ri-${theme === "light" ? "moon" : "sun"}-line text-xl`}
            ></i>
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {user.countryCode} {user.phone}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <i className="ri-logout-circle-line mr-2"></i>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
