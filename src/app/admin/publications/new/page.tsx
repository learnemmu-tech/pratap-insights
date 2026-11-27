import { redirect } from "next/navigation";

export default function NewPublicationRedirect() {
  redirect("/admin/publications");
}
