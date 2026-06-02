import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirecionamento de servidor (altíssima performance)
  redirect("/login");
}