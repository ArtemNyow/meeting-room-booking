"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  createBooking,
  updateBooking,
  getRoomBookings,
  type Booking,
} from "@/lib/api/bookings";
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

  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [bookingStartTime, setBookingStartTime] = useState("");
  const [bookingEndTime, setBookingEndTime] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");
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

  const updateRoomMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string }) =>
      updateRoom(roomId, data),

    onSuccess: (updatedRoom) => {
      queryClient.setQueryData(["room", roomId], updatedRoom);

      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });

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
      queryClient.invalidateQueries({
        queryKey: ["bookings", roomId],
      });

      setStartTime("");
      setEndTime("");
      setBookingDescription("");
    },
  });
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", roomId],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["bookings", roomId],
      });
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
  const deleteRoomMutation = useMutation({
    mutationFn: () => deleteRoom(roomId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rooms"],
      });

      router.push("/rooms");
    },
  });

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

  if (isLoading) {
    return (
      <main>
        <p>Loading room...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main>
        <h1>Room</h1>

        <p>
          Failed to load room:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </main>
    );
  }

  if (!room) {
    return (
      <main>
        <h1>Room not found</h1>
      </main>
    );
  }

  return (
    <main>
      {isEditing ? (
        <section>
          <h1>Edit room</h1>

          <form onSubmit={handleUpdate}>
            <div>
              <label htmlFor="name">Name</label>

              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {updateRoomMutation.isError && (
              <p>
                {updateRoomMutation.error instanceof Error
                  ? updateRoomMutation.error.message
                  : "Failed to update room"}
              </p>
            )}

            <button type="submit" disabled={updateRoomMutation.isPending}>
              {updateRoomMutation.isPending ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={updateRoomMutation.isPending}
            >
              Cancel
            </button>
          </form>
        </section>
      ) : (
        <>
          <section>
            <h1>{room.name}</h1>

            {room.description && <p>{room.description}</p>}

            <button type="button" onClick={startEditing}>
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteRoomMutation.isPending}
            >
              {deleteRoomMutation.isPending ? "Deleting..." : "Delete"}
            </button>

            {deleteRoomMutation.isError && (
              <p>
                {deleteRoomMutation.error instanceof Error
                  ? deleteRoomMutation.error.message
                  : "Failed to delete room"}
              </p>
            )}
          </section>

          <section>
            <h2>Members</h2>

            {room.members.length === 0 ? (
              <p>No members.</p>
            ) : (
              <ul>
                {room.members.map((member) => (
                  <li key={member.id}>
                    {member.user.name} — {member.user.email} — {member.role}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Bookings</h2>
            <form onSubmit={handleCreateBooking}>
              <div>
                <label htmlFor="startTime">Start time</label>
                <input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime">End time</label>
                <input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="bookingDescription">Description</label>
                <input
                  id="bookingDescription"
                  value={bookingDescription}
                  onChange={(event) =>
                    setBookingDescription(event.target.value)
                  }
                />
              </div>

              {createBookingMutation.isError && (
                <p>
                  {createBookingMutation.error instanceof Error
                    ? createBookingMutation.error.message
                    : "Failed to create booking"}
                </p>
              )}

              <button type="submit" disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending
                  ? "Creating..."
                  : "Create booking"}
              </button>
            </form>
            {isBookingsLoading && <p>Loading bookings...</p>}

            {isBookingsError && <p>Failed to load bookings.</p>}

            {!isBookingsLoading &&
              !isBookingsError &&
              bookings?.length === 0 && <p>No bookings yet.</p>}

            {bookings && bookings.length > 0 && (
              <ul>
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <p>
                      {new Date(booking.startTime).toLocaleString()} —{" "}
                      {new Date(booking.endTime).toLocaleString()}
                    </p>

                    {booking.description && <p>{booking.description}</p>}

                    <p>Status: {booking.status}</p>
                    {booking.status === "ACTIVE" && (
                      <>
                        <button
                          type="button"
                          onClick={() => startBookingEditing(booking)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cancelBookingMutation.mutate(booking.id)
                          }
                          disabled={cancelBookingMutation.isPending}
                        >
                          {cancelBookingMutation.isPending
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      </>
                    )}
                    {editingBookingId === booking.id && (
                      <form onSubmit={handleBookingUpdate}>
                        <div>
                          <label htmlFor={`start-${booking.id}`}>
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
                          />
                        </div>

                        <div>
                          <label htmlFor={`end-${booking.id}`}>End time</label>

                          <input
                            id={`end-${booking.id}`}
                            type="datetime-local"
                            value={bookingEndTime}
                            onChange={(event) =>
                              setBookingEndTime(event.target.value)
                            }
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor={`description-${booking.id}`}>
                            Description
                          </label>

                          <textarea
                            id={`description-${booking.id}`}
                            value={bookingDescription}
                            onChange={(event) =>
                              setBookingDescription(event.target.value)
                            }
                          />
                        </div>

                        {updateBookingMutation.isError && (
                          <p>
                            {updateBookingMutation.error instanceof Error
                              ? updateBookingMutation.error.message
                              : "Failed to update booking"}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={updateBookingMutation.isPending}
                        >
                          {updateBookingMutation.isPending
                            ? "Saving..."
                            : "Save changes"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingBookingId(null)}
                          disabled={updateBookingMutation.isPending}
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
