import { redirect } from "next/navigation";

export default function Home() {
  // Edge middleware will intercept this if the user is not authenticated
  // and send them to /login instead.
  redirect("/dashboard");
}