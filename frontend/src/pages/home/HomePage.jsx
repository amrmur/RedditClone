import { FaSearch } from "react-icons/fa";

import Posts from "../../components/common/Posts";
import CreatePost from "../community/CreatePost";

const HomePage = () => {
  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Search */}
        <div className="mx-3 mt-3 relative">
          <FaSearch className="z-10 w-6 h-6 absolute left-3 top-1/2 -translate-y-1/2 text-success" />

          <input
            type="text"
            placeholder="Search communities and users"
            className="input input-bordered w-full pl-10 bg-base-100 text-base-content placeholder:text-success rounded-full focus:outline-none focus:ring-2 focus:ring-success"
          />
        </div>

        {/* POSTS */}
        <Posts />
      </div>
    </>
  );
};
export default HomePage;
