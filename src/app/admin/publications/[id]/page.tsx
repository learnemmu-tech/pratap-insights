import { redirect } from "next/navigation";

export default function EditPublicationRedirect() {
  redirect("/admin/publications");
}
