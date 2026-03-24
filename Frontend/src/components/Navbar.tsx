import { useQueryClient } from "@tanstack/react-query";
import { useThemeContext } from "../context/ThemeContext";
import { api } from "@/api/interceptor";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Icons ──────────────────────────────────────────────────────────────────

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
      clipRule="evenodd"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

function Navbar() {
  const queryClient = useQueryClient();
  const { toggleTheme, darkMode } = useThemeContext();
  const { user,  isLoggedIn } = useAuthContext();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      sessionStorage.removeItem("isLoggedIn");
      queryClient.setQueryData(["me"], null);
      queryClient.refetchQueries({ queryKey: ["me"] });
      toast.success("Logged out successfully!");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  // Derive initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <nav className="shadow-sm fixed top-0 z-50 w-full h-[70px] bg-white/30 dark:bg-[#0f172b]/30 backdrop-blur-[10px] border-b border-white/10">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {/* ── Brand ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 select-none">
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            IPO<span className="text-[#5177f6]">Notify</span>
          </span>
        </div>

        {/* ── Right controls ────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative flex items-center justify-center w-10 h-10 rounded-full
              bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20
              text-amber-500 dark:text-indigo-300
              transition-all duration-300 shadow-sm hover:scale-110 active:scale-95"
          >
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-300"
              style={{
                opacity: darkMode ? 0 : 1,
                transform: darkMode
                  ? "rotate(90deg) scale(0.5)"
                  : "rotate(0deg) scale(1)",
              }}
            >
              <SunIcon />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-300"
              style={{
                opacity: darkMode ? 1 : 0,
                transform: darkMode
                  ? "rotate(0deg) scale(1)"
                  : "rotate(-90deg) scale(0.5)",
              }}
            >
              <MoonIcon />
            </span>
          </button>

          {/* Auth area */}
          {isLoggedIn ? (
            <DropdownMenu>
              {/* Avatar button */}
              <DropdownMenuTrigger asChild>
                <button
                  className="group flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-200 shadow-sm outline-none"
                >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name ?? "User"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#5177f6]/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#5177f6] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#5177f6]/40">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 max-w-[100px] truncate hidden sm:block">
                  {user?.name?.split(" ")[0] ?? "Account"}
                </span>
                {/* Chevron */}
                <svg
                  className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                </button>
              </DropdownMenuTrigger>

              {/* Dropdown */}
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl mt-2 dark:bg-[#1a1a2e] dark:border-white/10 pb-1">
                
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name ?? "User"}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-white/10" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer text-sm gap-3 py-2.5 px-3 mx-1 rounded-md transition-colors duration-150"
                >
                  <LogoutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a
              href="/api/auth/google"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#5177f6] hover:bg-[#3d5fd4]
                text-white text-sm font-semibold shadow-md hover:shadow-[#5177f6]/40
                hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {/* Google G */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="white"
                  opacity="0.9"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="white"
                  opacity="0.9"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="white"
                  opacity="0.9"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
              Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
