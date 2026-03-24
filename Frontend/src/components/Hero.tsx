import { useAuthContext } from "@/context/AuthContext";

const SAMPLE_IPOS = [
  {
    _id: "sample-1",
    name: "ABC Ltd.",
    openDate: new Date().toISOString(), // Opening today
    closeDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "Open",
  },
  {
    _id: "sample-2",
    name: "XYZ Corp",
    openDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    closeDate: new Date().toISOString(), // Closing today
    status: "Closing Soon",
  },
];

function Hero() {
  const { isLoggedIn, user } = useAuthContext();

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="mt-35">
      <h2 className="text-5xl font-bold text-center mx-auto">
        Never miss any <span className="text-[#5177f6]">IPO opportunity</span>{" "}
        again
      </h2>
      {!isLoggedIn && (
        <p className="text-center mt-8 text-lg text-gray-600 dark:text-gray-400">
         Receive automated email alerts on the exact day an IPO opens and closes, so you never miss the start or the final chance to invest.
        </p>
      )}

      <div className="flex flex-col items-center mt-8 gap-3">
        {isLoggedIn ? (
          /* Logged-in state */
          <div className="flex flex-col items-center gap-3">
            {/* Welcome badge */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#5177f6]/10 dark:bg-[#5177f6]/15 border border-[#5177f6]/20 shadow-sm">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? "User"}
                  className="w-9 h-9 rounded-full ring-2 ring-[#5177f6]/40"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#5177f6] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#5177f6]/40">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Welcome back,{" "}
                  <span className="text-[#5177f6]">
                    {user?.name?.split(" ")[0] ?? "there"}
                  </span>
                  ! 👋
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  You'll receive IPO alerts at{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {user?.email ?? "your email"}
                  </span>
                </p>
              </div>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              IPO alerts are active
            </div>
          </div>
        ) : (
          /* Logged-out state */
          <a
            href="/api/auth/google"
            className="group flex items-center gap-3 bg-white dark:bg-[#1a1a2e] border border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {/* Google Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Sign up with Google
            </span>
          </a>
        )}
      </div>

      {/* Laptop Mockup Wrapper */}
      <div className=" mt-10 max-w-4xl mx-auto px-4 perspective-1000">
        <div className="relative group transition-all duration-500 hover:scale-[1.02]">
          {/* Laptop Screen (Upper) */}
          <div className="relative z-10 p-2.5 sm:p-4 rounded-[1.5rem] bg-gray-800 dark:bg-gray-900 shadow-2xl border border-white/10">
            {/* Webcam */}
            <div className="absolute top-1.5 sm:top-2.7 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-700/50" />
            </div>

            {/* Content Screen */}
            <div className="rounded-lg overflow-hidden bg-white dark:bg-[#1a1a2e] aspect-16/10 sm:aspect-auto">
              {/* Gmail Window Chrome */}
              <div className="bg-white dark:bg-[#1a1a2e] px-4 py-2 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                {/* Window dots */}
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                {/* Gmail search bar */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-[#eaf1fb] dark:bg-[#2a2a4a] rounded-full px-4 py-1 flex items-center gap-2 w-full max-w-sm">
                    <svg
                      className="w-3 h-3 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Search mail
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Scrollable Content */}
              <div className="h-[300px] sm:h-[450px] overflow-y-auto scrollbar-hide bg-white dark:bg-[#1a1a2e]">
                {/* Email Header (Subject Line) */}
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                      🚀 IPO Alert: {SAMPLE_IPOS.length} Update(s) for Today!
                    </h3>
                  </div>
                  <div className="ml-8 mt-1 flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded uppercase tracking-wider">
                      Inbox
                    </span>
                  </div>
                </div>

                {/* Sender Info */}
                <div className="px-5 py-3 flex items-start gap-3 border-b border-gray-100 dark:border-gray-700/50">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#5177f6] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                    IN
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          IPO Notify
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 hidden sm:inline">
                          &lt;iponotify@notify.com&gt;
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        9:00 AM
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      to me
                    </p>
                  </div>
                </div>

                {/* Email Body */}
                <div className="px-6 py-5 bg-white dark:bg-[#1a1a2e]">
                  <div style={{ fontFamily: "Inter, sans-serif" }}>
                    <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      📢 IPO alerts for you
                    </h2>
                    <p className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-6">
                      Here are the IPOs opening or closing today:
                    </p>

                    <ul className="list-none p-0 m-0 space-y-2 sm:space-y-4">
                      {SAMPLE_IPOS.map((ipo) => {
                        const isOpeningToday = isToday(ipo.openDate);
                        const isClosingToday = isToday(ipo.closeDate);

                        return (
                          <li key={ipo._id} className="animate-fade-in-up">
                            <div
                              className={`rounded-xl p-5 border-l-4 transition-all duration-300 hover:shadow-md ${
                                isClosingToday
                                  ? "bg-red-50 dark:bg-red-500/5 border-l-red-500"
                                  : "bg-emerald-50 dark:bg-emerald-500/5 border-l-emerald-500"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1 sm:mb-2">
                                <strong className="text-xs sm:text-base text-gray-900 dark:text-white font-bold">
                                  {ipo.name}
                                </strong>
                                <span
                                  className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-tighter ${
                                    isClosingToday
                                      ? "bg-red-100 text-red-600 dark:bg-red-500/20"
                                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20"
                                  }`}
                                >
                                  {isClosingToday ? "Closing" : "Opening"}
                                </span>
                              </div>
                              <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                {isOpeningToday && (
                                  <>
                                    🚀 This IPO is officially{" "}
                                    <span className="text-emerald-600 font-semibold italic">
                                      OPEN
                                    </span>{" "}
                                    today. Check your demat account for details.
                                  </>
                                )}
                                {isClosingToday && (
                                  <>
                                    ⏰{" "}
                                    <span className="text-red-600 font-semibold italic">
                                      LAST CHANCE!
                                    </span>{" "}
                                    This is the final day to subscribe. Don't
                                    miss out!
                                  </>
                                )}
                              </p>
                              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-1 sm:gap-4">
                                <span className="text-[8px] sm:text-[10px] text-gray-500">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    Open:
                                  </span>{" "}
                                  {new Date(ipo.openDate).toLocaleDateString()}
                                </span>
                                <span className="text-[8px] sm:text-[10px] text-gray-500">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    Close:
                                  </span>{" "}
                                  {new Date(ipo.closeDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                      <p className="text-xs text-gray-400 text-center italic">
                        This is an automated reminder from IPOAlert.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base (Lower) */}
          <div className="relative h-2.5 sm:h-4 w-[104%] -left-[2%] bg-gray-700 dark:bg-gray-800 rounded-b-xl shadow-2xl overflow-hidden shadow-black/50">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-900/50 rounded-b-lg" />
            {/* Glossy top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
          </div>

          {/* Reflective Shadow beneath */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-linear-to-b from-black/20 to-transparent blur-2xl rounded-full -z-10" />
        </div>
      </div>
    </div>
  );
}

export default Hero;
