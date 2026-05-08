import { redirect } from "next/navigation";

// Config moved to /dashboard (CreateSemesterWizard / ConfigureTimeslotsDialog).
// Keep this route as a redirect so existing bookmarks and links the team
// hasn't migrated yet still land somewhere useful.
export default async function LegacyScheduleConfigRedirect() {
  redirect("/dashboard");
}
