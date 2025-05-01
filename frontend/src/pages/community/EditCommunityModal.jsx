import { useState } from "react";

const EditCommunityModal = () => {
  const [formData, setFormData] = useState({
    description: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              alert("Community updated successfully");
            }}
          >
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
