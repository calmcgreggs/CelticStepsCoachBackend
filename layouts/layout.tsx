import Header from "@/components/header";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <Header />
      <main className="bg-blue-900">{children}</main>
    </ClerkProvider>
  );
}
