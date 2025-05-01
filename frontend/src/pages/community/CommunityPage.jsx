import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const CommunityPage = () => {
  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <h1 className="text-5xl font-bold pb-2">r/Sports</h1>
        <p className="text-lg text-gray-500 pt-4 pl-8">
          Community description goes here.
        </p>
      </div>
      <div className="divider"></div>

      <CreatePost />
      <Posts />
    </div>
  );
};

export default CommunityPage;
