"use client";

type SignIn1Props = {
  email: string;
  password: string;
  error?: string;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: () => void;
  onGoogleSignIn: () => void;
};

const SignIn1 = ({
  email,
  password,
  error,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onGoogleSignIn,
}: SignIn1Props) => {
  return (
    <div className="w-full">
      <div className="relative z-10 w-full rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-center">
          <img src="/logo.svg" alt="Face-AI Logo" className="h-12 w-12 rounded-full bg-white p-2 object-contain shadow-lg" />
        </div>
        <h2 className="mb-2 text-center text-2xl font-semibold text-white">Welcome Back</h2>
        <p className="mb-6 text-center text-sm text-gray-300">Sign in to continue using Face-AI</p>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-3">
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => onEmailChange(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            {error ? <div className="text-left text-sm text-red-400">{error}</div> : null}
          </div>

          <button
            onClick={onSignIn}
            disabled={loading}
            className="w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            onClick={onGoogleSignIn}
            className="mb-1 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#232526] to-[#2d2e30] px-5 py-3 text-sm font-medium text-white shadow transition hover:brightness-110">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="w-full text-center">
            <span className="text-xs text-gray-400">
              Don&apos;t have an account?{" "}
              <a href="/auth/signup" className="text-white/80 underline hover:text-white">
                Sign up, it&apos;s free!
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center text-center">
        <p className="mb-2 text-sm text-gray-400">
          Join <span className="font-medium text-white">thousands</span> of teams already using Face-AI.
        </p>
        <div className="flex">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="h-8 w-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="user"
            className="h-8 w-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="user"
            className="h-8 w-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="user"
            className="h-8 w-8 rounded-full border-2 border-[#181824] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export { SignIn1 };