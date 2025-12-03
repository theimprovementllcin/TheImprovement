import React from "react";
import BlogsHero from "@/components/Blogshero";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import apiClient from "@/utils/apiClient";
import SEO from "@/components/SEO";

export interface BlogPageProps {
  blogType: string;
  initialTrendingBlogs: any[];
  initialFeaturedBlogs: any[];
  initialRegularBlogs: any[];
}

const Blogs = ({
  blogType,
  initialTrendingBlogs,
  initialFeaturedBlogs,
  initialRegularBlogs,
}: BlogPageProps) => {
  return (
    <div>
       <SEO
        title="Exploring Neighborhoods: Your Guide to Locating the Perfect Home"
        description="Explore the world of real estate investment with OneCasa's in-depth blog guide. From property market trends to expert homebuying and selling tips, gain valuable insights to make smarter real estate decisions."
        keywords="OneCasa Blog, Real Estate Investment, Property Market Trends, Homebuying Tips, Selling Strategies, Neighborhood Exploration, Real Estate Financing, Property Advice India, Homeownership Guide"
        favicon="/images/logobb.png"
        breadcrumbs={[
          { name: 'Home', item: 'https://www.onecasa.in' },
          { name: 'Blogs', item: 'https://www.onecasa.in/blogs' }
        ]}
      />
      <BlogsHero
        blogType={blogType}
        initialTrendingBlogs={initialTrendingBlogs}
        initialFeaturedBlogs={initialFeaturedBlogs}
        initialRegularBlogs={initialRegularBlogs}
      />
    </div>
  );
};
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const blogType = (context.query.blogType as string) || "Construction";

  try {
    const res = await apiClient.get(apiClient.URLS.blogs, { blogType });

    const blogs = Array.isArray(res.body) ? res.body : [];

    const trending = blogs.filter((b: any) => b.blogStatus === "Trending");
    const featured = blogs.filter((b: any) => b.blogStatus === "Featured");
    const regular = blogs.filter((b: any) => b.blogStatus === "Regular");

    return {
      props: {
        blogType,
        initialTrendingBlogs: trending,
        initialFeaturedBlogs: featured,
        initialRegularBlogs: regular,
      },
    };
  } catch (error) {
    console.error("Failed to fetch blogs:", error);

    return {
      props: {
        blogType,
        initialTrendingBlogs: [],
        initialFeaturedBlogs: [],
        initialRegularBlogs: [],
      },
    };
  }
};

export default withGeneralLayout(Blogs);
