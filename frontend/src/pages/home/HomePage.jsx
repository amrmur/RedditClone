import { FaSearch } from "react-icons/fa";

import Posts from "../../components/common/Posts";
import CreatePost from "../community/CreatePost";
import CreateCommunityModal from "./CreateCommunityModal";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const HomePage = () => {
  const fetchResults = async (query) => {
    if (!query) return [];
    const res = await fetch("api/community/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to search communities");
    }
    return data;
  };

  const fetchUserResults = async (query) => {
    if (!query) return [];
    const res = await fetch("api/user/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to search communities");
    }
    return data;
  };

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  // Debounce logic can be added for real-world apps
  const { data: communityResults = [], isFetching: isFetchingCommunities } =
    useQuery({
      queryKey: ["communitySearch", search],
      queryFn: () => fetchResults(search),
      enabled: !!search,
    });

  const { data: userResults = [], isFetching: isFetchingUsers } = useQuery({
    queryKey: ["userSearch", search],
    queryFn: () => fetchUserResults(search),
    enabled: !!search,
  });
  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Search */}
        <div className="flex flex-row mt-4 mx-3 gap-3 align-center">
          <div className="flex-1 my-auto relative dropdown dropdown-bottom w-full">
            <FaSearch className="z-10 w-6 h-6 absolute left-3 top-1/2 -translate-y-1/2 text-success" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search communities and users"
              className="input input-bordered w-full pl-10 bg-base-100 text-base-content placeholder:text-success rounded-full focus:outline-none focus:ring-2 focus:ring-success"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => search && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              autoComplete="off"
            />
            {open && search && (
              <ul className="dropdown-content menu bg-base-100 rounded-box z-10 w-full mt-2 p-2 shadow-sm absolute left-0">
                {isFetchingCommunities && (
                  <li className="text-center">Loading...</li>
                )}
                <li className="text-center font-bold">Communities</li>
                {!isFetchingCommunities && communityResults.length === 0 && (
                  <li className="text-center text-gray-400">No results</li>
                )}
                {communityResults.map((item) => (
                  <li key={item._id}>
                    <a
                      href={`/community/${item.handle}`}
                      onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    >
                      {item.handle}
                    </a>
                  </li>
                ))}
                {isFetchingUsers && <li className="text-center">Loading...</li>}
                <li className="text-center font-bold">Users</li>
                {!isFetchingUsers && userResults.length === 0 && (
                  <li className="text-center text-gray-400">No results</li>
                )}
                {userResults.map((item) => (
                  <li key={item._id}>
                    <a
                      href={`/profile/${item.handle}`}
                      onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                    >
                      {item.handle}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateCommunityModal />
        </div>

        {/* POSTS */}
        <Posts />
      </div>
    </>
  );
};
export default HomePage;
