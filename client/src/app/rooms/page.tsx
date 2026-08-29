"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createRoom, getRooms } from "@/services/roomService";

export default function RoomsPage() {
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

  return (
    <main>
      <h1>Meeting Rooms</h1>

      <section>
        <h2>Create room</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>

            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter room description"
            />
          </div>

          {createRoomMutation.isError && (
            <p>
              {createRoomMutation.error instanceof Error
                ? createRoomMutation.error.message
                : "Failed to create room"}
            </p>
          )}

          <button type="submit" disabled={createRoomMutation.isPending}>
            {createRoomMutation.isPending ? "Creating..." : "Create room"}
          </button>
        </form>
      </section>

      <section>
        <h2>Rooms</h2>

        {isLoading && <p>Loading rooms...</p>}

        {isError && (
          <p>
            Failed to load rooms:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}

        {!isLoading && !isError && (
          <div>
            {rooms.length === 0 ? (
              <p>No rooms found.</p>
            ) : (
              rooms.map((room) => (
                <article key={room.id}>
                  <h3>{room.name}</h3>

                  {room.description && <p>{room.description}</p>}

                  <p>Members: {room.members.length}</p>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
