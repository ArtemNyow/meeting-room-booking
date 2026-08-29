"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { removeToken } from "@/lib/auth";
import { createRoom, getRooms } from "@/services/roomService";

export default function RoomsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const {
    data: rooms = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const createRoomMutation = useMutation({
    mutationFn: createRoom,

    onSuccess: () => {
      setName("");
      setDescription("");

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createRoomMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Meeting Room Booking
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white"
          >
            Logout
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
            <h2 className="mb-5 text-xl font-semibold text-white">
              Create room
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-200"
                >
                  Room name
                </label>

                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Boardroom A"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-200"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Conference room for product syncs"
                  rows={5}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              {createRoomMutation.isError && (
                <p className="text-sm text-rose-400">
                  {createRoomMutation.error instanceof Error
                    ? createRoomMutation.error.message
                    : "Failed to create room"}
                </p>
              )}

              <button
                type="submit"
                disabled={createRoomMutation.isPending}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createRoomMutation.isPending ? "Creating..." : "Create room"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Your rooms</h2>
            </div>

            {isLoading && <p className="text-slate-300">Loading rooms...</p>}

            {isError && (
              <p className="text-sm text-rose-400">
                Failed to load rooms:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}

            {!isLoading && !isError && (
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-300">
                    No rooms found yet. Create the first room to start planning
                    meetings.
                  </p>
                ) : (
                  rooms.map((room) => (
                    <article
                      key={room.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-cyan-500/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {room.name}
                          </h3>
                          {room.description ? (
                            <p className="mt-2 text-sm text-slate-300">
                              {room.description}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">
                              No description
                            </p>
                          )}
                        </div>

                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                          {room.members.length} members
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/rooms/${room.id}`)}
                        className="mt-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
                      >
                        Open room
                      </button>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
