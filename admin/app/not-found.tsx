import Link from "next/link";

export default function NotFound() {
  return (
    <section className="admin-auth">
      <h1>404</h1>
      <p>Az oldal nem található.</p>
      <Link className="btn" href="/">Vissza az adminisztrációhoz</Link>
    </section>
  );
}
