import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

const CreateCommunityModal = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ name, description }) => {
      try {
        const res = await fetch("api/community/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, description }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create community");
        }
        console.log(data);
        return data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Community created successfully!");
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <button
        className="my-auto btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("create_community_modal").showModal()
        }
      >
        Create community
      </button>
      <dialog id="create_community_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Create Community</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutate(formData);
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.name}
                name="name"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Description"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.description}
                name="description"
                onChange={handleInputChange}
              />
            </div>
            <button className="btn btn-primary rounded-full btn-sm text-white">
              Create
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
export default CreateCommunityModal;
