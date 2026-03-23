import { useEffect } from "react";
import "./App.css";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import { toast } from "sonner";
import { useAuthContext } from "./context/AuthContext";

function App() {
  const {isLoading,user} = useAuthContext();

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
        <main className="container mx-auto">
          <Hero />
        </main>
        
      </ThemeProvider>
    </>
  );
}

export default App;
