import { redirect } from "next/navigation";

// The root `/` is now the public landing page (app/page.tsx).
// Authenticated users entering the (app) layout are redirected to /photos.
export default function AppRootPage() {
  redirect("/photos");
}
