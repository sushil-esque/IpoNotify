import { useEffect } from "react";
import "./App.css";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import { toast } from "sonner";
import { useAuthContext } from "./context/AuthContext";
import CurrentIpos from "./components/CurrentIpos";
import Footer from "./components/Footer";

function App() {
  const { isLoading, user } = useAuthContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");
    console.log(
      "Auth status from URL:",
      authStatus,
      "Full URL:",
      window.location.href,
    );
    if (authStatus === "success") {
      toast.success("Successfully signed in with Google!");
    } else if (authStatus === "failure") {
      toast.error("Sign in failed. Please try again.");
    }
    // Clean up the URL so it doesn't re-trigger on refresh
    if (authStatus) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (isLoading) return <div>loading</div>;
  return (
    <>
      {console.log(user)}
      <ThemeProvider>
        <Navbar />
        <main className="container mx-auto min-h-screen">
          <Hero />
          <CurrentIpos />
        </main>

        {!user && (
          <section className="container mx-auto mt-24 mb-16 flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Never want to miss an ipo again?
            </h2>
            <a
              href="/api/auth/google"
              className="flex items-center gap-3 px-10 py-4 bg-[#5177f6] hover:bg-[#3d5fd4] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#5177f6]/40 hover:scale-105 transition-all duration-300 text-lg"
            >
              <div className="bg-white p-1 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M1.5 5.25L12 13.125L22.5 5.25C22.5 4.00736 21.4926 3 20.25 3H3.75C2.50736 3 1.5 4.00736 1.5 5.25Z" fill="#EA4335"/>
                  <path d="M22.5 5.25V18.75C22.5 19.9926 21.4926 21 20.25 21H17.25V10.125L22.5 6.1875V5.25Z" fill="#FBBC04"/>
                  <path d="M1.5 5.25V18.75C1.5 19.9926 2.50736 21 3.75 21H6.75V10.125L1.5 6.1875V5.25Z" fill="#4285F4"/>
                  <path d="M17.25 10.125V21H6.75V10.125L12 14.0625L17.25 10.125Z" fill="#34A853"/>
                </svg>
              </div>
              Get alerts now
            </a>
          </section>
        )}

        <Footer />
      </ThemeProvider>
    </>
  );
}

export default App;
