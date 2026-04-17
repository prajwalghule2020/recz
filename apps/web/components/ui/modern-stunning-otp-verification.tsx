"use client";

type OtpVerificationStatus = "loading" | "success" | "error";

type OtpVerificationProps = {
  status: OtpVerificationStatus;
  title?: string;
  description?: string;
  errorMessage?: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
};

const statusCopy: Record<OtpVerificationStatus, { title: string; description: string }> = {
  loading: {
    title: "Verifying OTP",
    description: "Please wait while we verify your email verification code.",
  },
  success: {
    title: "Verification Complete",
    description: "Your email is verified. You can continue to your dashboard.",
  },
  error: {
    title: "Verification Failed",
    description: "The verification code is invalid or expired.",
  },
};

const OtpVerification1 = ({
  status,
  title,
  description,
  errorMessage,
  primaryActionLabel,
  onPrimaryAction,
}: OtpVerificationProps) => {
  const resolvedTitle = title ?? statusCopy[status].title;
  const resolvedDescription = description ?? statusCopy[status].description;

  return (
    <div className="w-full">
      <div className="relative z-10 w-full rounded-3xl bg-linear-to-r from-[#ffffff10] to-[#121212] p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-center">
          <img src="/logo.svg" alt="Face-AI Logo" className="h-12 w-12 rounded-full bg-white p-2 object-contain shadow-lg" />
        </div>

        <h2 className="mb-2 text-center text-2xl font-semibold text-white">{resolvedTitle}</h2>
        <p className="mb-6 text-center text-sm text-gray-300">{resolvedDescription}</p>

        {status === "loading" ? (
          <div className="mb-2 flex w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          </div>
        ) : null}

        {status === "error" && errorMessage ? (
          <div className="mb-4 text-center text-sm text-red-400">{errorMessage}</div>
        ) : null}

        <button
          onClick={onPrimaryAction}
          disabled={status === "loading"}
          className="w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60">
          {primaryActionLabel}
        </button>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center text-center">
        <p className="mb-2 text-sm text-gray-400">
          Secure verification powered by <span className="font-medium text-white">Face-AI auth</span>.
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

export { OtpVerification1 };
