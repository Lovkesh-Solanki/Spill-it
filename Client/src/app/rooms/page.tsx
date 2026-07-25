import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoomForms from "@/components/rooms/RoomForms";

export const metadata = { title: "Rooms — SpillIt" };

export default async function RoomsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/rooms");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Play online
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink-100">
        Create or join a room
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-ink-500">
        Rooms are private by default — share the code (and password, if you
        set one) with whoever you want to play with.
      </p>

      <div className="mt-10 w-full">
        <RoomForms />
      </div>
    </div>
  );
}
