export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[var(--bg)] p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 self-center font-medium text-[var(--text)]"
        >
          <div
            className="flex size-9 items-center justify-center rounded-lg text-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), var(--accent-2))",
            }}
          >
            🧠
          </div>
          <span className="text-lg font-bold tracking-tight">Face-AI</span>
        </a>
        {children}
      </div>
    </div>
  );
}
