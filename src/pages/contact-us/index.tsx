import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import apiClient from "@/utils/apiClient";

import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from "@/components/SEO";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import toast from "react-hot-toast";

type TopicKey = "projects" | "careers" | "general";

const TOPICS: { key: TopicKey; label: string; blurb: string; icon: string }[] =
  [
    {
      key: "projects",
      label: "New Projects",
      blurb:
        "Have a project in mind? Tell us a bit about it and we'll help you plan the next steps.",
      icon: "🏗️",
    },
    {
      key: "careers",
      label: "Joining Our Team",
      blurb:
        "We're building the TheImprovement platform across real estate & home services. Share your profile and interests.",
      icon: "👥",
    },
    {
      key: "general",
      label: "General Inquiries",
      blurb:
        "Ask us anything about listings, interiors, construction, or support. We're here to help.",
      icon: "💬",
    },
  ];

function ContactUs() {
  const [topic, setTopic] = useState<TopicKey>("projects");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    emailAddress: "",
    tellUsMore: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const markTouched = (name: string) =>
    setTouched((t) => ({ ...t, [name]: true }));

  const errors = useMemo(() => {
    const e: Record<string, string | undefined> = {};
    if (!/^[A-Za-z\s]{2,}$/.test(form.firstName || "")) {
      e.firstName = "Please enter a valid first name.";
    }
    if (form.lastName && !/^[A-Za-z\s]{2,}$/.test(form.lastName)) {
      e.lastName = "Please enter a valid last name.";
    }
    if (!/^\d{10}$/.test(form.contactNumber || "")) {
      e.contactNumber = "Enter a valid 10-digit number.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress || "")) {
      e.emailAddress = "Please enter a valid email.";
    }
    if ((form.tellUsMore || "").trim().length < 10) {
      e.tellUsMore = "Please add at least 10 characters.";
    }
    return e;
  }, [form]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      contactNumber: true,
      emailAddress: true,
      tellUsMore: true,
    });
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        emailAddress: form.emailAddress,
        tellUsMore: form.tellUsMore,
      };

      const res = await apiClient.post(apiClient.URLS.contact_us, {
        ...payload,
      });
      if (res.status === 201) {
        setForm({
          firstName: "",
          lastName: "",
          contactNumber: "",
          emailAddress: "",
          tellUsMore: "",
        });
        toast.success("Form submitted Successfully");
      }

      setTouched({});
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCopy = useMemo(
    () => TOPICS.find((t) => t.key === topic)?.blurb ?? "",
    [topic]
  );

  return (
    <>
      <SEO
        title="Contact TheImprovement • Real Estate, Interiors & Home Services"
        description="Get in touch with TheImprovement for property listings, interiors, custom construction, and support. Share your project or query and we'll reach out."
        keywords="TheImprovement contact, property inquiry, interiors contact, construction contact, New York real estate"
        breadcrumbs={[
          { name: "Home", item: "https://www.TheImprovement.in/" },
          { name: "Contact Us", item: "https://www.TheImprovement.in/contact-us" },
        ]}
        faq={[
          {
            question: "What's the best way to contact TheImprovement?",
            answer: "You can reach us via phone at +918897574909, through our contact form, or by visiting ogeur office in New York during business hours."
          }
        ]}
        service={{
          name: "Customer Support and Consultation",
          description: "Professional guidance and support for all real estate, interior design, and construction needs",
          areaServed: ["India"],
          providerType: "LocalBusiness"
        }}
      />

      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm py-4 px-4">
        <h1 className="text-2xl font-Gordita-Bold text-gray-900 text-center">
          Contact Us
        </h1>
      </div>

      <section className="relative overflow-hidden min-h-screen lg:min-h-[92vh]">
        <Image
          src="/images/contact-us-form.png"
          alt="Contact TheImprovement"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-[#5297FF]/20 via-transparent to-[#8A2BE2]/20" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#5297FF]/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#8A2BE2]/20 blur-[80px] animate-pulse-medium" />
        <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-[#00C2FF]/15 blur-[70px] animate-pulse-slow" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[45%_minmax(0,1fr)] gap-6 md:gap-8 lg:gap-12 items-start">
            <div className="hidden lg:block text-white">
              <div className="mb-6 lg:mb-8">
                <h1 className="font-Gordita-Bold text-2xl md:text-3xl lg:text-4xl leading-tight mb-4">
                  Let's bring your
                  <span className="text-[#A4C7FF]"> vision to life</span>
                </h1>
                <p className="text-white/80 text-[12px] md:text-[14px] max-w-md">
                  Connect with our experts and discover how we can transform
                  your space
                </p>
              </div>

              <Tab.Group onChange={(index) => setTopic(TOPICS[index].key)}>
                <Tab.List className="flex flex-col gap-3 lg:gap-4 max-w-[370px]">
                  {TOPICS.map(({ key, label, icon }) => (
                    <Tab key={key} className="focus:outline-none group">
                      {({ selected }) => (
                        <div
                          className={clsx(
                            "px-4 lg:px-5 py-2 lg:py-2 rounded-xl transition-all duration-300",
                            "border-l-[5px] lg:border-l-[6px] flex items-center gap-3 lg:gap-4",
                            selected
                              ? "border-white bg-white/15 backdrop-blur-md shadow-lg"
                              : "border-transparent bg-white/5 group-hover:bg-white/10"
                          )}
                        >
                          <span className="text-[12px] lg:text-xl">{icon}</span>
                          <p
                            className={clsx(
                              "font-Gordita-Medium text-base lg:text-lg",
                              selected
                                ? "text-white"
                                : "text-white/80 group-hover:text-white"
                            )}
                          >
                            {label}
                          </p>
                        </div>
                      )}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="mt-6 lg:mt-8">
                  {TOPICS.map(({ key }) => (
                    <Tab.Panel key={key}>
                      <p className="font-Gordita-Regular text-white/90 text-base lg:text-[16px] md:text-xl leading-7 max-w-[90%]">
                        {activeCopy}
                      </p>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-white/20">
                <h3 className="font-Gordita-Bold text-white text-base lg:text-lg mb-3 lg:mb-4">
                  Other ways to reach us
                </h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="tel:+910000000000"
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm "
                  >
                    <span className="label-text">📞</span>
                    <span>+1 (203) 610-3084</span>
                  </a>
                  <a
                    href="mailto:hello@TheImprovement.in"
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm "
                  >
                    <span className="label-text">📧</span>
                    <span>sales@TheImprovement.in</span>
                  </a>
                  <a
                    href="https://api.whatsapp.com/send/?phone=+1 (203) 610-3084&text&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm "
                  >
                    <span className="label-text">💬</span>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <div className="text-white mb-4">
                <h1 className="font-Gordita-Bold text-xl md:text-2xl leading-tight mb-2">
                  Let's bring your
                  <span className="text-[#A4C7FF]"> vision to life</span>
                </h1>
                <p className="text-white/80 text-base md:text-[14px] text-[12px]">
                  Connect with our experts and discover how we can transform
                  your space
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
                <p className="text-white font-Gordita-Medium mb-2">
                  I'm interested in:
                </p>
                <select
                  className="w-full bg-white/20 border border-white/30 rounded-lg py-2 px-3  max-w-[300px] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as TopicKey)}
                >
                  {TOPICS.map(({ key, label }) => (
                    <option
                      key={key}
                      value={key}
                      className="text-gray-900 text-[12px] max-w-[300px]"
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <p className="text-white text-sm">{activeCopy}</p>
              </div>
            </div>

            <div className="relative">
              <div className="relative p-[1.5px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-white/40 via-[#5297FF]/50 to-[#8A2BE2]/40 shadow-xl">
                <div className="rounded-xl lg:rounded-xl bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-2xl shadow-inner">
                  <form onSubmit={onSubmit} className="p-5 md:p-6 lg:p-8">
                    <div className="mb-5 lg:mb-6">
                      <h2 className="text-xl md:text-2xl font-Gordita-Bold text-gray-900">
                        Get in touch
                      </h2>
                      <p className="text-gray-600 text-sm font-Gordita-Medium  mt-1">
                        We typically respond within 24 hours
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                      <div className="md:col-span-2 lg:col-span-1">
                        <CustomInput
                          name="firstName"
                          type="text"
                          label="First name"
                          value={form.firstName}
                          onChange={(e) =>
                            handleFormChange("firstName", e.target.value)
                          }
                          onBlur={() => markTouched("firstName")}
                          outerInptCls="bg-white/80 border-gray-200 focus-within:border-[#5297FF]"
                          labelCls="label-text font-Gordita-Medium"
                          placeholder="e.g., Sachin"
                          className="text-[12px] text-gray-900 placeholder:text-gray-400"
                          required
                          errorMsg={
                            touched.firstName ? errors.firstName : undefined
                          }
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <CustomInput
                          name="lastName"
                          type="text"
                          label="Last name"
                          value={form.lastName}
                          onChange={(e) =>
                            handleFormChange("lastName", e.target.value)
                          }
                          onBlur={() => markTouched("lastName")}
                          outerInptCls="bg-white/80 border-gray-200 focus-within:border-[#5297FF]"
                          labelCls="label-text font-Gordita-Medium"
                          placeholder="e.g., Chauhan"
                          className="text-[12px] text-gray-900 placeholder:text-gray-400"
                          required
                          errorMsg={
                            touched.lastName ? errors.lastName : undefined
                          }
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <CustomInput
                          name="contactNumber"
                          label="Contact number"
                          value={form.contactNumber}
                          onChange={(e) =>
                            handleFormChange(
                              "contactNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          onBlur={() => markTouched("contactNumber")}
                          outerInptCls="bg-white/80 border-gray-200 focus-within:border-[#5297FF]"
                          labelCls="label-text font-Gordita-Medium"
                          placeholder="10-digit mobile"
                          className="text-[12px] text-gray-900 placeholder:text-gray-400"
                          type="number"
                          required
                          errorMsg={
                            touched.contactNumber
                              ? errors.contactNumber
                              : undefined
                          }
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <CustomInput
                          name="emailAddress"
                          type="email"
                          label="Email address"
                          value={form.emailAddress}
                          onChange={(e) =>
                            handleFormChange("emailAddress", e.target.value)
                          }
                          onBlur={() => markTouched("emailAddress")}
                          outerInptCls="bg-white/80 border-gray-200 focus-within:border-[#5297FF]"
                          labelCls="label-text font-Gordita-Medium"
                          placeholder="you@example.com"
                          className="text-[12px] text-gray-900 placeholder:text-gray-400"
                          required
                          errorMsg={
                            touched.emailAddress
                              ? errors.emailAddress
                              : undefined
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <CustomInput
                          name="tellUsMore"
                          type="textarea"
                          label={
                            topic === "projects"
                              ? "Tell us more about your project"
                              : topic === "careers"
                                ? "Tell us about your profile"
                                : "How can we help?"
                          }
                          value={form.tellUsMore}
                          onChange={(e) =>
                            handleFormChange("tellUsMore", e.target.value)
                          }
                          onBlur={() => markTouched("tellUsMore")}
                          outerInptCls="bg-white/80 border-gray-200 focus-within:border-[#5297FF]"
                          labelCls="label-text font-Gordita-Medium"
                          placeholder={
                            topic === "projects"
                              ? "City, budget range, timeline, home type…"
                              : topic === "careers"
                                ? "Role, experience, portfolio/LinkedIn…"
                                : "Your question…"
                          }
                          className="min-h-[100px] md:min-h-[120px] text-[12px] text-gray-900 placeholder:text-gray-400"
                          required
                          errorMsg={
                            touched.tellUsMore ? errors.tellUsMore : undefined
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 md:pt-6 border-t border-gray-200">
                      <p className="text-[12px] text-gray-600 text-center sm:text-left max-w-[300px]">
                        By submitting, you agree to be contacted about TheImprovement
                        services. We respect your privacy.
                      </p>
                      <Button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className={clsx(
                          "px-6 md:px-8 py-2 md:py-2 rounded-lg text-white text-sm md:text-base font-Gordita-Medium",
                          "transition-all duration-300 shadow-md w-full sm:w-auto",
                          isValid && !isSubmitting
                            ? "bg-gradient-to-r from-[#5297FF] to-[#8A2BE2] hover:shadow-lg"
                            : "bg-gray-400 cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Mobile contact methods */}
              <div className="lg:hidden mt-6 bg-white/10 backdrop-blur-md rounded-xl p-5">
                <h3 className="font-Gordita-Medium text-white text-lg mb-4">
                  Other ways to reach us
                </h3>
                <div className="flex flex-col gap-4">
                  <a
                    href="tel:+910000000000"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-2xl">📞</span>
                    <div>
                      <p className="font-Gordita-Medium">Call us</p>
                      <p className="text-sm">+91 00000 00000</p>
                    </div>
                  </a>
                  <a
                    href="mailto:hello@TheImprovement.in"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-2xl">✉️</span>
                    <div>
                      <p className="font-Gordita-Medium">Email us</p>
                      <p className="text-sm">hello@TheImprovement.in</p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/910000000000"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-white/90 hover:text-white transition-colors p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="font-Gordita-Medium">WhatsApp</p>
                      <p className="text-sm">Message us directly</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes pulse-medium {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite;
        }
        .animate-pulse-medium {
          animation: pulse-medium 4s infinite;
        }

        /* Improve select dropdown styling */
        select option {
          background: white;
          color: black;
        }
      `}</style>
    </>
  );
}

export default withGeneralLayout(ContactUs);
