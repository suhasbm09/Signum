import { useState, useEffect } from "react";
import { signInWithGoogle } from "../firebase/config";
import { useToast } from "../components/Toast";
import signumLogo from "../assets/Signum-logo-removebg-preview.png";

const features = [
  "Interactive Visual Learning",
  "AI-Powered Personalized Tutoring",
  "Blockchain Certified Achievements",
];

function Login({ onLogin }) {
  const { showToast, ToastContainer } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [typedFeature, setTypedFeature] = useState("");

  // Rotate feature every 4s
  useEffect(() => {
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(featureInterval);
  }, []);

  // Typewriter for the current feature
  useEffect(() => {
    setTypedFeature("");
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < features[currentFeature].length) {
        setTypedFeature(features[currentFeature].substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, [currentFeature]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        showToast("✅ Login successful! Welcome to Signum.", "success");
        onLogin?.(result.user);
      } else {
        showToast(`❌ Login failed: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("❌ Login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable button style (kept on-theme)
  const btnStrong =
  "rounded-xl px-6 py-3 text-base font-semibold text-white bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-[#0A0F0E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";


  return (
    <div className="min-h-screen w-full bg-[#060807] text-white flex items-center">

      {/* Main container: centers content nicely on all breakpoints */}
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-8 lg:py-0">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">
          {/* Left section */}
          <section className="space-y-8 text-center lg:text-left lg:-mt-2">
            <div className="flex items-center justify-center lg:justify-start">
              <img
                src={signumLogo}
                alt="Signum logo"
                className="h-16 w-16 object-contain lg:h-20 lg:w-20"
              />
            </div>

            <header className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400 drop-shadow sm:text-5xl lg:text-6xl leading-[0.95]">
                Signum
              </h1>
              <p className="text-base leading-relaxed text-gray-300 sm:text-lg lg:text-xl">
                "Unforgettable Learning. Unforgeable Credentials"
              </p>
            </header>

            {/* Typewriter card */}
            <div className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-6 shadow-[0_0_32px_-18px_#10B981] lg:shadow-[0_0_40px_-18px_#10B981] max-w-xl sm:max-w-2xl lg:max-w-[680px] w-full mx-auto lg:mx-0">

              <div className="flex items-center justify-center lg:justify-start">
              <span className="mr-3 inline-block h-2 w-2 animate-pulse motion-reduce:animate-none rounded-full bg-emerald-400" />
                <span className="text-lg font-semibold tracking-wide text-emerald-200">
                  {typedFeature}
                  <span className="animate-pulse motion-reduce:animate-none">|</span>
                </span>
              </div>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-emerald-400">AI</div>
                <div className="text-xs text-gray-400">Powered</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-emerald-400">NFT</div>
                <div className="text-xs text-gray-400">Certified</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-emerald-400">24/7</div>
                <div className="text-xs text-gray-400">Available</div>
              </div>
            </div>
          </section>

          {/* Right section - Login Card */}
          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
            <div className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-8 shadow-[0_0_32px_-18px_#10B981] lg:shadow-[0_0_40px_-18px_#10B981]">

                <div className="mb-6 text-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#064E3B] ring-1 ring-emerald-400/50">
                    <svg
                      className="h-7 w-7 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-2xl font-extrabold text-emerald-400 drop-shadow">
                    Access Your Account
                  </h2>
                  <p className="text-sm text-gray-400">
                    Secure authentication for your learning journey
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className={`w-full ${btnStrong}`}
                  aria-label="Continue with Google"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <span className="mr-3 inline-block h-5 w-5 animate-spin motion-reduce:animate-none rounded-full border-2 border-emerald-400 border-t-transparent" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="mr-3 h-6 w-6 rounded bg-black/40 p-1">
                        <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
                          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#fbbc04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </button>

                <div className="mt-6 border-t border-emerald-500/10 pt-6">
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Private</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Reliable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="relative z-[60]">
        <ToastContainer />
      </div>

    </div>
  );
}

export default Login;
