import "@/styles/globals.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen w-full bg-[#faf9f6]">
      <div className="relative min-h-screen">{children}</div>
    </main>
  );
}
