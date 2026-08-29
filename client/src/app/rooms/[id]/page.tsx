"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelBooking,
  createBooking,
  updateBooking,
  getRoomBookings,
  type Booking,
} from "@/lib/api/bookings";
import { removeToken } from "@/lib/auth";
import { getMe } from "@/services/authService";
import {
  addRoomMember,
  removeRoomMember,
  updateRoomMemberRole,
} from "@/services/memberService";
import { deleteRoom, getRoom, updateRoom } from "@/services/roomService";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const roomId = Number(params.id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"USER" | "ADMIN">("USER");

  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const {
    data: room,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId),
    enabled: Number.isInteger(roomId) && roomId > 0,
  });

  const {
    data: bookings,
    isLoading: isBookingsLoading,
    isError: isBookingsError,
  } = useQuery({
    queryKey: ["bookings", roomId],
    queryFn: () => getRoomBookings(roomId),
    enabled: Number.isInteger(roomId) && roomId > 0,
  });

  const currentMember = useMemo(
    () =>
      room?.members.find((member) => member.userId === currentUser?.user.id),
    [currentUser?.user.id, room?.members],
  );
  const isAdmin = currentMember?.role === "ADMIN";

  const updateRoomMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string }) =>
      updateRoom(roomId, data),

    onSuccess: (updatedRoom) => {
      queryClient.setQueryData(["room", roomId], updatedRoom);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setIsEditing(false);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: () =>
      createBooking(roomId, {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        description: bookingDescription.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", roomId] });
      setStartTime("");
      setEndTime("");
      setBookingDescription("");
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", roomId] });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: number;
      data: {
        startTime?: string;
        endTime?: string;
        description?: string;
      };
    }) => updateBooking(bookingId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", roomId] });
      setEditingBookingId(null);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: () =>
      addRoomMember(roomId, { email: memberEmail, role: memberRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setMemberEmail("");
      setMemberRole("USER");
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({
      memberUserId,
      role,
    }: {
      memberUserId: number;
      role: "USER" | "ADMIN";
    }) => updateRoomMemberRole(roomId, memberUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberUserId: number) =>
      removeRoomMember(roomId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: () => deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push("/rooms");
    },
  });

  const startBookingEditing = (booking: Booking) => {
    setEditingBookingId(booking.id);
    setBookingStartTime(new Date(booking.startTime).toISOString().slice(0, 16));
    setBookingEndTime(new Date(booking.endTime).toISOString().slice(0, 16));
    setBookingDescription(booking.description ?? "");
  };

  const handleBookingUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingBookingId === null) {
      return;
    }

    updateBookingMutation.mutate({
      bookingId: editingBookingId,
      data: {
        startTime: new Date(bookingStartTime).toISOString(),
        endTime: new Date(bookingEndTime).toISOString(),
        description: bookingDescription.trim() || undefined,
      },
    });
  };

  const startEditing = () => {
    if (!room) {
      return;
    }

    setName(room.name);
    setDescription(room.description ?? "");
    setIsEditing(true);
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    updateRoomMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  const handleCreateBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!startTime || !endTime) {
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return;
    }

    createBookingMutation.mutate();
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?",
    );

    if (!confirmed) {
      return;
    }

    deleteRoomMutation.mutate();
  };

  const handleAddMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!memberEmail.trim()) {
      return;
    }

    addMemberMutation.mutate();
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-slate-300">Loading room...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold">Room</h1>
          <p className="mt-3 text-rose-400">
            Failed to load room:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold">Room not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
          <div>
            <button
              type="button"
              onClick={() => router.push("/rooms")}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              ← Back to rooms
            </button>
            <h1 className="mt-2 text-3xl font-semibold">{room.name}</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white"
          >
            Logout
          </button>
        </header>

        {isEditing ? (
          <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
            <h2 className="mb-5 text-xl font-semibold text-white">Edit room</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-200"
                >
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
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
                  rows={4}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              {updateRoomMutation.isError && (
                <p className="text-sm text-rose-400">
                  {updateRoomMutation.error instanceof Error
                    ? updateRoomMutation.error.message
                    : "Failed to update room"}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updateRoomMutation.isPending}
                  className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {updateRoomMutation.isPending ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={updateRoomMutation.isPending}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
            <p className="text-slate-300">
              {room.description || "No description yet."}
            </p>

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white"
                >
                  Edit room
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteRoomMutation.isPending}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:opacity-60"
                >
                  {deleteRoomMutation.isPending ? "Deleting..." : "Delete room"}
                </button>
              </>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
            <h2 className="mb-5 text-xl font-semibold text-white">Members</h2>

            {room.members.length === 0 ? (
              <p className="text-slate-300">No members yet.</p>
            ) : (
              <ul className="space-y-3">
                {room.members.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {member.user.email}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          member.role === "ADMIN"
                            ? "bg-violet-500/15 text-violet-200 border border-violet-500/30"
                            : "bg-cyan-500/15 text-cyan-200 border border-cyan-500/30"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>

                    {isAdmin && member.userId !== currentUser?.user.id && (
                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(event) =>
                            updateMemberRoleMutation.mutate({
                              memberUserId: member.userId,
                              role: event.target.value as "USER" | "ADMIN",
                            })
                          }
                          className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-2 text-sm text-white outline-none focus:border-cyan-500"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            removeMemberMutation.mutate(member.userId)
                          }
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-2 text-xs font-medium text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/20"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isAdmin && (
              <form
                onSubmit={handleAddMember}
                className="mt-6 space-y-3 border-t border-slate-800 pt-5"
              >
                <h3 className="text-base font-medium text-white">
                  Add team member
                </h3>

                <input
                  type="email"
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                />

                <select
                  value={memberRole}
                  onChange={(event) =>
                    setMemberRole(event.target.value as "USER" | "ADMIN")
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>

                {addMemberMutation.isError && (
                  <p className="text-sm text-rose-400">
                    {addMemberMutation.error instanceof Error
                      ? addMemberMutation.error.message
                      : "Failed to add member"}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add member"}
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg shadow-slate-950/20">
            <h2 className="mb-5 text-xl font-semibold text-white">Bookings</h2>

            <form
              onSubmit={handleCreateBooking}
              className="mb-6 grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-slate-200"
                >
                  Start time
                </label>
                <input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-cyan-500/40 bg-slate-900 px-4 py-3 text-sm font-medium text-cyan-100 outline-none focus:border-cyan-400 focus:bg-slate-800 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-slate-200"
                >
                  End time
                </label>
                <input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-cyan-500/40 bg-slate-900 px-4 py-3 text-sm font-medium text-cyan-100 outline-none focus:border-cyan-400 focus:bg-slate-800 [color-scheme:dark]"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="bookingDescription"
                  className="block text-sm font-medium text-slate-200"
                >
                  Description
                </label>
                <textarea
                  id="bookingDescription"
                  value={bookingDescription}
                  onChange={(event) =>
                    setBookingDescription(event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              {createBookingMutation.isError && (
                <p className="md:col-span-2 text-sm text-rose-400">
                  {createBookingMutation.error instanceof Error
                    ? createBookingMutation.error.message
                    : "Failed to create booking"}
                </p>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                >
                  {createBookingMutation.isPending
                    ? "Creating..."
                    : "Create booking"}
                </button>
              </div>
            </form>

            {isBookingsLoading && (
              <p className="text-slate-300">Loading bookings...</p>
            )}
            {isBookingsError && (
              <p className="text-sm text-rose-400">Failed to load bookings.</p>
            )}

            {!isBookingsLoading &&
              !isBookingsError &&
              bookings?.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-300">
                  No bookings yet. Create your first reservation for this room.
                </p>
              )}

            {bookings && bookings.length > 0 && (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">
                          {new Date(booking.startTime).toLocaleString()} —{" "}
                          {new Date(booking.endTime).toLocaleString()}
                        </p>
                        {booking.description && (
                          <p className="mt-2 text-sm text-slate-200">
                            {booking.description}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          booking.status === "ACTIVE"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-slate-600 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {booking.status === "ACTIVE" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startBookingEditing(booking)}
                          className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cancelBookingMutation.mutate(booking.id)
                          }
                          disabled={cancelBookingMutation.isPending}
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/20 disabled:opacity-60"
                        >
                          {cancelBookingMutation.isPending
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      </div>
                    )}

                    {editingBookingId === booking.id && (
                      <form
                        onSubmit={handleBookingUpdate}
                        className="mt-4 space-y-3 border-t border-slate-800 pt-4"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor={`start-${booking.id}`}
                              className="block text-sm font-medium text-slate-200"
                            >
                              Start time
                            </label>
                            <input
                              id={`start-${booking.id}`}
                              type="datetime-local"
                              value={bookingStartTime}
                              onChange={(event) =>
                                setBookingStartTime(event.target.value)
                              }
                              required
                              className="w-full rounded-xl border-2 border-cyan-500/40 bg-slate-900 px-4 py-3 text-sm font-medium text-cyan-100 outline-none focus:border-cyan-400 focus:bg-slate-800 [color-scheme:dark]"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor={`end-${booking.id}`}
                              className="block text-sm font-medium text-slate-200"
                            >
                              End time
                            </label>
                            <input
                              id={`end-${booking.id}`}
                              type="datetime-local"
                              value={bookingEndTime}
                              onChange={(event) =>
                                setBookingEndTime(event.target.value)
                              }
                              required
                              className="w-full rounded-xl border-2 border-cyan-500/40 bg-slate-900 px-4 py-3 text-sm font-medium text-cyan-100 outline-none focus:border-cyan-400 focus:bg-slate-800 [color-scheme:dark]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`description-${booking.id}`}
                            className="block text-sm font-medium text-slate-200"
                          >
                            Description
                          </label>
                          <textarea
                            id={`description-${booking.id}`}
                            value={bookingDescription}
                            onChange={(event) =>
                              setBookingDescription(event.target.value)
                            }
                            rows={3}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        {updateBookingMutation.isError && (
                          <p className="text-sm text-rose-400">
                            {updateBookingMutation.error instanceof Error
                              ? updateBookingMutation.error.message
                              : "Failed to update booking"}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={updateBookingMutation.isPending}
                            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                          >
                            {updateBookingMutation.isPending
                              ? "Saving..."
                              : "Save changes"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingBookingId(null)}
                            disabled={updateBookingMutation.isPending}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
