import "@/styles/globals.css";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-full">
      <div className="absolute size-full">
        <Image src="https://www.adorama.com/alc/wp-content/uploads/2021/07/Photography-for-Beginners.jpg" alt="background" fill className="size-full" />
      </div>
      {children}
      </main>
  );
}
