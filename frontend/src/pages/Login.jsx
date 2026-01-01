import { useState, useEffect, useMemo } from "react";
import { signInWithGoogle } from "../firebase/config";
import { useToast } from "../components/Toast";
import Button from "../components/Button";
import signumLogo from "../assets/Signum-logo-removebg-preview.png";

const features = [
  "Interactive Visual Learning",
  "AI-Powered Personalized Tutoring",
  "Blockchain Certified Achievements",
];

// Snow particle component - Intense emerald snowfall
const Snowfall = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 5 + Math.random() * 10,
      size: 2 + Math.random() * 6,
      opacity: 0.4 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-snowfall"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(16, 185, 129, ${p.opacity}) 0%, rgba(16, 185, 129, 0) 70%)`,
            boxShadow: `0 0 ${p.size * 2}px rgba(16, 185, 129, ${p.opacity * 0.5})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
    </div>
  );
};

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

  return (
    <div className="min-h-screen w-full bg-[#060807] text-white flex items-center relative overflow-hidden" role="main">
      {/* Emerald Snow Effect */}
      <Snowfall />
      
      <ToastContainer />

      {/* Main container: centers content nicely on all breakpoints */}
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-8 lg:py-0 relative z-10">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">
          {/* Left section */}
          <section className="space-y-8 text-center lg:text-left lg:-mt-2">
            <div className="flex items-center justify-center lg:justify-start">
              <img
                src={signumLogo}
                alt="Signum logo"
                className="h-24 w-24 object-contain lg:h-32 lg:w-32 drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]"
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
                <span className="mr-3 inline-block h-2 w-2 animate-pulse motion-reduce:animate-none rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="text-lg font-semibold tracking-wide text-emerald-200">
                  {typedFeature}
                  <span className="animate-pulse motion-reduce:animate-none">|</span>
                </span>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-3 gap-4" role="list" aria-label="Platform statistics">
              <div className="text-center lg:text-left" role="listitem">
                <div className="text-2xl font-bold text-emerald-400">50+</div>
                <div className="text-xs text-gray-400">Users Tested</div>
              </div>
              <div className="text-center lg:text-left" role="listitem">
                <div className="text-2xl font-bold text-emerald-400">92%</div>
                <div className="text-xs text-gray-400">Found AI Helpful</div>
              </div>
              <div className="text-center lg:text-left" role="listitem">
                <div className="text-2xl font-bold text-emerald-400">4.2/5</div>
                <div className="text-xs text-gray-400">Satisfaction</div>
              </div>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-3 gap-6" role="list" aria-label="Platform features">
              <div className="text-center lg:text-left" role="listitem">
                <div className="text-xl font-bold text-emerald-400">AI</div>
                <div className="text-xs text-gray-300">Powered</div>
              </div>
              <div className="text-center lg:text-left" role="listitem">
                <div className="text-xl font-bold text-emerald-400">NFT</div>
                <div className="text-xs text-gray-300">Certified</div>
              </div>
              <div className="text-center lg:text-left" role="listitem">
                <div className="text-xl font-bold text-emerald-400">24/7</div>
                <div className="text-xs text-gray-300">Available</div>
              </div>
            </div>
          </section>

          {/* Right section - Login Card */}
          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-emerald-500/10 bg-[#0A0F0E] p-8 shadow-[0_0_32px_-18px_#10B981] lg:shadow-[0_0_40px_-18px_#10B981]">

                <div className="mb-6 text-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#064E3B] ring-1 ring-emerald-400/50" aria-hidden="true">
                    <svg
                      className="h-7 w-7 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                  <p className="text-sm text-gray-300">
                    Secure authentication for your learning journey
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  loading={isLoading}
                  ariaLabel="Sign in with Google"
                  className="bg-[#064E3B] ring-1 ring-emerald-400/50 hover:bg-black focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-[#0A0F0E]"
                >
                  {!isLoading && (
                    <div className="flex items-center justify-center">
                      <div className="mr-3 h-6 w-6 rounded bg-black/40 p-1">
                        <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
                          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#fbbc04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </Button>

                <div className="mt-6 border-t border-emerald-500/10 pt-6">
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-300" role="list" aria-label="Security features">
                    <div className="flex items-center gap-2" role="listitem">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2" role="listitem">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span>Private</span>
                    </div>
                    <div className="flex items-center gap-2" role="listitem">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span>Reliable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Login;
