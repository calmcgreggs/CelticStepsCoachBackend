import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <Link className="btn btn-ghost text-sm lg:text-xl" href="/">
          Celtic Steps Coach Bookings
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li className="border-r-2 border-l-2 border-white/20">
            <Link href={
                      new Date().getFullYear() +
                      "/" +
                      (new Date().getMonth() + 1) +
                      "/" +
                      new Date().getDate()}>Today's Bookings</Link>
          </li>
          <li>
            <Link href="/unconfirmed">Unconfirmed Bookings</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
