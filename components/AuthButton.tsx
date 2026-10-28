import { auth, signIn, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();
  if (!session?.user)
    return (
      <form action={async () => { "use server"; await signIn("google"); }} className="auth">
        <button type="submit">Sign in</button>
      </form>
    );
  return (
    <form action={async () => { "use server"; await signOut(); }} className="auth">
      {session.user.image && <img src={session.user.image} alt="" referrerPolicy="no-referrer" />}
      <button type="submit">Sign out</button>
    </form>
  );
}
