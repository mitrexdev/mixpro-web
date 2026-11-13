import { redirect } from "next/navigation";
import { safeWatchPath } from "@/lib/site";
export default async function RemovedAuth({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  redirect(safeWatchPath(params.next || null));
}
