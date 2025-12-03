import React, { useEffect } from "react";
import OneStopSol from "../onestepsol";
import BuilderProcess from "../BuilderProcess";
import TestimonalBuilder from "../TestimonalHouse";
import CostEstimator from "../CostEstimator";
import BuilderHeroSection from "../HeroSection";
import OurProjects from "../ourProjects";
import FAQSComp from "../SubServices/Components/FAQSComp";
import TriedOptions from "../TriedOptions";

import { useHomepageStore } from "@/store/useHomepageStore";
import BlogCard from "@/components/BlogCard";
import MobileBlogCard from "@/components/MobileBlogCard";
const faqs = [
  {
    question: "What services do you offer?",
    answer:
      "We offer end-to-end home improvement services including Construction, Demolition, Flooring, Plumbing, HVAC, Roofing, Painting, and Driveway & Exterior Works. Our team ensures safe execution, on-time delivery, and quality workmanship for every project.",
  },
  {
    question: "How do I get a cost estimate for my project?",
    answer:
      "You can request a free quote directly through our website. Just share your project details—such as the type of service, property size, and location—and our team will provide a transparent and accurate estimate with no hidden charges.",
  },
  {
    question: "Do you handle both residential and commercial projects?",
    answer:
      "Yes, we work on both residential and commercial properties. Whether it's new construction, remodeling, repairs, or exterior improvements, our team is equipped to deliver high-quality results for all types of spaces.",
  },
  {
    question: "Are your services customizable based on my requirements?",
    answer:
      "Absolutely. Every service—from construction to painting and flooring—can be fully customized to match your needs, style, and budget. We work closely with you to ensure the final outcome aligns perfectly with your expectations.",
  },
  {
    question: "Is your team licensed and insured?",
    answer:
      "Yes, we work with trained, licensed, and fully insured professionals for all our services, ensuring safety, compliance, and high-quality workmanship throughout the project.",
  },
];
type HomepageProps = {
  initialBlogs: any[];
};
const BuildHome = ({ initialBlogs }: HomepageProps) => {
  const { allBlogs, setAllBlogs } = useHomepageStore();
  useEffect(() => {
    if (initialBlogs?.length && allBlogs?.length === 0) {
      setAllBlogs(initialBlogs);
    }
  }, [initialBlogs, allBlogs?.length]);

  return (
    <div className="p-5 md:p-[40px] md:max-w-[90%] mx-auto">
      <div className="md:mb-[0px] mb-[40px]">
        <BuilderHeroSection />
      </div>
      <div className="md:mt-[0px] mt-[500px] ">
        <OneStopSol />
      </div>
      <TriedOptions />
      <CostEstimator />

      <BuilderProcess />
      <div className=" mb-[45px] md:mb-[64px]">
        <OurProjects />
      </div>
      <div className=" mb-[45px] md:mb-[64px]">
        <TestimonalBuilder />
      </div>

      <FAQSComp
        image={"/images/custombuilder/subservices/homedecor/faqs/faqsimage.png"}
        faqs={faqs}
      />
      <div className="mt-[70px] md:mb-[60px] mb-5">
        <h2
          style={{
            backgroundImage:
              "linear-gradient(90deg, #3586FF 30.48%, #212227 100%)",
            color: "transparent",
            backgroundClip: "text",
          }}
          className="md:text-[24px] text-[18px] leading-[44.17px] font-Gordita-Medium text-center mb-[25px] md:mb-[30px]"
        >
          Latest New Blogs
        </h2>
        <div className="hidden md:flex flex-row gap-7 justify-center items-center">
          {allBlogs.length > 0 ? (
            allBlogs.slice(0, 5).map((blog: any, index: any) => (
              <div
                className={`rounded-[12px] shadow-md md:max-w-[332px]`}
                key={index}
              >
                <BlogCard data={blog} />
              </div>
            ))
          ) : (
            <div className="font-Gordita-Medium md:text-[20px] leading-7 ">
              No blog found
            </div>
          )}
        </div>
        <div className="rounded-[12px] shadow-md flex flex-col gap-y-[8px] items-center md:hidden">
          {allBlogs.length > 0
            ? allBlogs.slice(0, 4).map((blog: any, index: any) => (
                <div
                  className={`rounded-[12px] shadow-md md:max-w-[332px]`}
                  key={index}
                >
                  <MobileBlogCard data={blog} />
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};
export default BuildHome;
