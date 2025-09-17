import Link from "next/link";

export default function Header() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <Link className="btn btn-ghost text-sm lg:text-xl" href="/">
          Celtic Steps Coach Bookings
        </Link>
      </div>
    </div>
  );
}
