import React, { useEffect, useState } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import BlogCard from "../BlogCard";
import TrendingBlogCard from "../TrendingBlogCard";
import clsx from "clsx";
import MobileBlogCard from "../MobileBlogCard";
import Loader from "@/components/Loader";
import { BlogPageProps } from "@/pages/blogs";
import { useRouter } from "next/router";
import Button from "@/common/Button";

const filterTags = [
  "Construction",
  "Demolition",
  "Flooring",
  "Roofing",
  "Exteriors",
  "General",
];

const BlogsHero = ({
  blogType,
  initialTrendingBlogs,
  initialFeaturedBlogs,
  initialRegularBlogs,
}: BlogPageProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState<Array<string>>(filterTags);

  const handleFilterClick = (tag: string) => {
    const newType = blogType === tag ? "" : tag;
    router.push(`/blogs?blogType=${encodeURIComponent(newType)}`);
  };

  useEffect(() => {
    setFilteredTags(
      filterTags.filter((tag) =>
        tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
      )
    );
  }, [tagSearchTerm]);

  return (
    <>
      {loading && (
        <div className="inset-0 z-[9999] backdrop-blur-[0.5px] fixed bg-white bg-opacity-50 flex justify-center items-center cursor-wait">
          <Loader />
        </div>
      )}
      <div className="relative w-full">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 md:py-20 px-4 flex flex-col items-center text-center relative">
          <div className="absolute -top-6 md:-top-10 w-20 h-20 rounded-full bg-indigo-100 opacity-40 blur-3xl"></div>

          <h1 className="md:text-[36px] text-[26px] font-Gordita-Bold leading-[44px] text-gray-900 relative z-10">
            Blogs
          </h1>

          <div className="w-16 h-1 bg-[#5297ff] rounded-full mt-2 mb-6 relative z-10"></div>

          <h2 className="md:text-[20px] text-[14px] mx-auto text-[#7B7C83] font-Gordita-Medium leading-[30px] md:max-w-[60%] max-w-full relative z-10">
            Explore our latest blog posts to stay informed about industry trends
            & strategies for successful channel partnering.
          </h2>
        </div>

        <div className="max-w-[1292px] w-full mx-auto px-4 md:px-8">
          <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 -mt-8 md:-mt-12 relative z-10">
            <div className="flex md:flex-row flex-col items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <CustomInput
                  type="text"
                  name="tag-search"
                  className="w-full px-4 md:py-3 py-1 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5297ff] focus:border-transparent transition-all shadow-sm"
                  placeholder="Search tags..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                />

                {tagSearchTerm && filteredTags.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredTags.map((tag, index) => (
                      <Button
                        key={`filtered-tag-${index}`}
                        className={clsx(
                          "md:px-4 px-2 md:py-2 py-1 md:text-[14px] text-[12px] cursor-pointer transition-colors",
                          blogType === tag
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "bg-white text-gray-800 hover:bg-gray-50"
                        )}
                        onClick={() => handleFilterClick(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-row gap-2  py-1 justify-start overflow-x-auto custom-scrollbar w-full md:w-auto">
                {filterTags.map((tag, index) => (
                  <Button
                    key={`tag-${index}`}
                    className={clsx(
                      "md:px-4 px-3 md:py-2 py-1 text-[12px] md:text-[14px] font-Gordita-Medium rounded-lg cursor-pointer min-w-max transition-colors duration-200 ease-in-out",
                      blogType === tag
                        ? "bg-[#5297ff] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    onClick={() => handleFilterClick(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:px-4 px-5 md:mt-5 mt-2">
            {initialFeaturedBlogs.length > 0 && (
              <div className="md:flex-1">
                <p className="md:text-[24px] text-[20px] px-2 leading-[35px] font-[600] md:mb-[34px] mb-[20px]">
                  Featured Blogs
                </p>
                <div className="hidden md:flex flex-col md:flex-row gap-4 px-5  md:flex-wrap  items-center justify-center   custom-scrollbar  md:max-h-[90vh]">
                  {initialFeaturedBlogs.map((blog, index) => (
                    <div
                      key={index}
                      className="max-w-[330px]   rounded-[6px] shadow-xl"
                    >
                      <BlogCard data={blog} />
                    </div>
                  ))}
                </div>
                <div className="md:hidden flex flex-col md:flex-row gap-4 items-center md:max-h-[90vh] justify-center px-5">
                  {initialFeaturedBlogs.map((blog, index) => (
                    <div key={index} className="rounded-[6px] shadow-xl">
                      <MobileBlogCard data={blog} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {initialTrendingBlogs.length > 0 && (
              <div className="md:flex-1">
                <p className="md:text-[24px] text-[20px] px-2 leading-[35px] font-[600]  font-gordita md:mb-[34px] mb-[15px]">
                  Trending Blogs
                </p>
                <div className="hidden md:flex flex-col gap-2 p-2 md:max-h-[90vh] md:overflow-y-auto !custom-scrollbar">
                  {initialTrendingBlogs.map((blog, index) => (
                    <TrendingBlogCard key={index} data={blog} />
                  ))}
                </div>
                <div className="md:hidden flex flex-col items-center gap-2 p-2 md:max-h-[90vh] ">
                  {initialTrendingBlogs.map((blog, index) => (
                    <MobileBlogCard data={blog} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className=" hidden md:flex flex-col md:flex-row gap-4 md:px-5 px-2  my-10 md:flex-wrap  items-start justify-center mt-10">
            {initialRegularBlogs.length > 0 &&
              initialRegularBlogs.map((blog, index) => (
                <div
                  key={index}
                  className="rounded-md shadow-xl md:max-w-[332px]"
                >
                  <BlogCard data={blog} />
                </div>
              ))}
          </div>
          <div className="md:hidden flex flex-col md:flex-row gap-4 md:px-5 px-2 my-10 md:flex-wrap  items-center justify-center mt-7">
            {initialRegularBlogs.length > 0 &&
              initialRegularBlogs.map((blog, index) => (
                <div key={index} className="rounded-md shadow-xl ">
                  <MobileBlogCard data={blog} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogsHero;
