"use client";

type SignUp1Props = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  error?: string;
  loading?: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSignUp: () => void;
  onGoogleSignIn: () => void;
};

const SignUp1 = ({
  name,
  email,
  password,
  confirmPassword,
  error,
  loading = false,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSignUp,
  onGoogleSignIn,
}: SignUp1Props) => {
  return (
    <div className="w-full">
      <div className="relative z-10 w-full rounded-3xl bg-linear-to-r from-[#ffffff10] to-[#121212] p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-center">
          <img src="/logo.svg" alt="Face-AI Logo" className="h-12 w-12 rounded-full bg-white p-2 object-contain shadow-lg" />
        </div>
        <h2 className="mb-2 text-center text-2xl font-semibold text-white">Create Account</h2>
        <p className="mb-6 text-center text-sm text-gray-300">Get started with Face-AI in minutes</p>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-3">
            <input
              placeholder="Full name"
              type="text"
              value={name}
              className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => onNameChange(e.target.value)}
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => onEmailChange(e.target.value)}
            />
            <input
              placeholder="Password (min. 8 characters)"
              type="password"
              value={password}
              className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            <input
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              className="w-full rounded-xl bg-white/10 px-5 py-3 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
            />
            {error ? <div className="text-left text-sm text-red-400">{error}</div> : null}
          </div>

          <button
            onClick={onSignUp}
            disabled={loading}
            className="w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>

          <button
            onClick={onGoogleSignIn}
            className="mb-1 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#232526] to-[#2d2e30] px-5 py-3 text-sm font-medium text-white shadow transition hover:brightness-110">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="w-full text-center">
            <span className="text-xs text-gray-400">
              Already have an account?{" "}
              <a href="/auth/signin" className="text-white/80 underline hover:text-white">
                Sign in
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center text-center">
        <p className="mb-2 text-sm text-gray-400">
          Build faster with <span className="font-medium text-white">secure auth</span> and smart face workflows.
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

export { SignUp1 };
