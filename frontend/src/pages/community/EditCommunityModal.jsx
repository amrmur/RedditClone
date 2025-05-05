import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const EditCommunityModal = ({ communityId, handle }) => {
  const [newDescription, setNewDescription] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ communityId, newDescription }) => {
      try {
        const res = await fetch("/api/community/editDescription", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ communityId, newDescription }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Failed to update community description"
          );
        }
        console.log(data);
        return data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", handle] });
      toast.success("Community description updated successfully!");
      setNewDescription("");
      document.getElementById("edit_community_modal").close();
    },
  });

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_community_modal").showModal()
        }
      >
        Edit community
      </button>
      <dialog id="edit_community_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Community</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutate({ communityId, newDescription });
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Description"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={newDescription}
                name="newDescription"
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <button className="btn btn-primary rounded-full btn-sm text-white">
              Update
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditCommunityModal;
