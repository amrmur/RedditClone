import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import EditCommunityModal from "./EditCommunityModal";

const CommunityPage = () => {
  const { handle } = useParams();
  console.log("handle:", handle);

  const {
    data: community,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["community", handle],
    queryFn: async () => {
      const res = await fetch(`/api/community/${handle}`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Failed to update community");

      return json.community;
    },
  });

  // Replace this with your actual logic

  const iAmOwner = true;

  if (isLoading) return <p className="p-4">Loading community...</p>;
  if (isError || !community) return <p className="p-4">Community not found.</p>;
  console.log("community:", community._id);

  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <h1 className="text-5xl font-bold pb-2">r/{community.handle}</h1>
        <div className="flex justify-between items-center w-full">
          <p className="text-lg text-gray-500 pt-4 pl-8">
            {community.description || "No description provided."}
          </p>
          {iAmOwner && (
            <EditCommunityModal communityId={community._id} handle={handle} />
          )}
        </div>
      </div>

      <div className="divider"></div>

      <CreatePost />
      <Posts posts={community.posts} />
    </div>
  );
};

export default CommunityPage;
