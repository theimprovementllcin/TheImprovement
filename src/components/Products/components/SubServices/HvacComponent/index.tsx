import React from "react";

import BreadCrumb from "../../BreadCrumb";
import ServiceHeroSection, {
  IServiceHeroSectionInterfaceProps,
} from "../Components/ServiceHeroSection";

import FAQSComp from "../Components/FAQSComp";
import ServiceProcess from "../Components/ServiceProcess";
import OurServices, { ServiceCardProps } from "../Components/OurServices";
import ConsultLegalExpert from "./ConsultLegalExpert";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";

const HvacComponent = () => {
  const hvacHeroData = {
    heading: "Expert HVAC Services",
    subHeading: "Heating • Cooling • Ventilation Solutions",
    bgImageUrl: "/images/custombuilder/subservices/plumbing/herosection.png",

    bookingCtaUrl: { label: "Book HVAC Service", url: "" },

    locationcta: [
      { label: "New York", url: "" },
      { label: "California", url: "" },
      { label: "Texas", url: "" },
    ],

    selectedId: { id: 5, service: "HVAC" },

    description:
      "Professional HVAC installation, repair, and maintenance services designed to deliver energy-efficient heating, cooling, and ventilation for homes and commercial spaces.",
  };
  const hvacFaqs = [
    {
      question: "How often should I service my HVAC system?",
      answer:
        "It is recommended to service your HVAC system at least once a year. For best performance, schedule maintenance twice a year—before summer and before winter.",
    },
    {
      question: "What are the signs that my HVAC system needs repair?",
      answer:
        "Common signs include unusual noises, weak airflow, uneven temperatures, foul smells, higher electricity bills, and the system taking longer to heat or cool.",
    },
    {
      question: "How long does an HVAC installation usually take?",
      answer:
        "A standard HVAC installation typically takes 4–8 hours. Larger or more complex systems may take up to 1–2 days depending on ductwork requirements.",
    },
    {
      question: "How can I reduce my HVAC energy bills?",
      answer:
        "Use a programmable thermostat, clean or replace filters regularly, schedule routine maintenance, ensure proper insulation, and upgrade to energy-efficient units.",
    },
    {
      question: "Should I repair or replace my old HVAC system?",
      answer:
        "If your system is over 10–12 years old, requires frequent repairs, or has poor efficiency, replacing it is often more cost-effective and energy-efficient.",
    },
  ];
  const hvacProcessSteps = {
    heading: "Our HVAC Service Process",
    steps: [
      {
        id: 1,
        title: "Inspection & Analysis",
        description:
          "We inspect your space and identify exact heating and ventilation requirements.",
        image: "/images/custombuilder/subservices/plumbing/schedule.png",
      },
      {
        id: 2,
        title: "System Recommendation",
        description:
          "Based on your needs, we recommend the best AC, heating, or ventilation system.",
        image: "/images/custombuilder/subservices/plumbing/solve-prob.png",
      },
      {
        id: 3,
        title: "Installation / Repair",
        description:
          "Our certified technicians install or repair the HVAC system with precision.",
        image:
          "/images/custombuilder/subservices/plumbing/chooseservices/appliance.png",
      },
      {
        id: 4,
        title: "Testing & Handover",
        description:
          "We test system performance, tune efficiency, and hand over with warranty.",
        image: "/images/custombuilder/subservices/vaastu/process/report.png",
      },
    ],
  };
  const hvacServices = {
    title: "Our HVAC Services",
    subTitle:
      "We provide end-to-end heating, cooling, and ventilation solutions.",
    services: [
      {
        name: "AC Installation & Repair",
        description:
          "Professional air conditioning installation and fast repair service.",
        imageUrl:
          "/images/custombuilder/subservices/plumbing/chooseservices/FanACInstallation.png",
      },
      {
        name: "Heating System Setup",
        description:
          "Efficient heating systems for winters with high-performance results.",
        imageUrl: "/images/services/hvac/heating.png",
      },
      {
        name: "Ventilation & Ductwork",
        description:
          "Complete ventilation solutions including duct design and cleaning.",
        imageUrl: "/images/services/hvac/ventilation.png",
      },
      {
        name: "Annual Maintenance",
        description:
          "Full HVAC inspection and preventive maintenance for long life.",
        imageUrl:
          "/images/custombuilder/subservices/interiors/the-way-we-work/approval.png",
      },
    ],
  };
  const testimonialsData: ITestimonialsSectionProps = {
    words: [
      {
        name: "Arjun",
        desc: "The HVAC installation was smooth and professional. The team identified the exact cooling needs and the AC now works perfectly even during peak summers.",
        rating: 5,
      },
      {
        name: "Sneha",
        desc: "Impressed with their quick diagnosis and repair service. My AC had frequent issues, but the technician fixed it efficiently. Highly recommended!",
        rating: 5,
      },
      {
        name: "Karthik",
        desc: "Their HVAC maintenance service improved the airflow and reduced noise significantly. Great attention to detail and very polite staff.",
        rating: 4,
      },
      {
        name: "Meera",
        desc: "Outstanding service! They explained the problem clearly and provided the best solution. My home now stays cool with much lower electricity consumption.",
        rating: 5,
      },
    ],
  };

  const hvacWhyData = {
    heading: "Why Choose Our HVAC Experts?",
    subheading:
      "We deliver reliable, energy-efficient, long-lasting heating, cooling, and ventilation solutions for your home or business.",
    image: "/images/legalservices/consultexpertwhy/consultexpertwhyimage.png",
    listItems: [
      {
        id: 1,
        title: "Certified HVAC Technicians",
        description:
          "Our experts are trained and certified to handle all HVAC installations, repairs, and maintenance.",
        image: "/images/legalservices/consultexpertwhy/endtoend.png",
      },
      {
        id: 2,
        title: "Energy Efficient Solutions",
        description:
          "We provide cost-effective HVAC systems that reduce energy consumption and save money.",
        image: "/images/legalservices/consultexpertwhy/quickassessment.png",
      },
      {
        id: 3,
        title: "Fast & Reliable Service",
        description:
          "Quick response, same-day services, and dependable support ensure your comfort is never compromised.",
        image: "/images/legalservices/consultexpertwhy/appropriateadvice.png",
      },
      {
        id: 4,
        title: "Complete Climate Control",
        description:
          "We manage heating, cooling, and air quality with advanced technology and premium systems.",
        image: "/images/legalservices/consultexpertwhy/nohiddenchages.png",
      },
    ],
  };

  return (
    <section className="w-full px-5 ">
      <BreadCrumb
        steps={[
          { label: "Our Services", link: "" },
          { label: "HVAC", link: "/services/hvac" },
        ]}
        currentStep="HVAC"
      />
      <div className=" mb-[45px] md:mb-[64px]">
        <ServiceHeroSection {...hvacHeroData} />
      </div>
      <div className=" mb-[45px] md:mb-[64px]">
        <OurServices
          title={hvacServices.title}
          subTitle={hvacServices.subTitle}
          services={hvacServices.services}
        />
      </div>

      <div className=" mb-[45px] md:mb-[64px]">
        {" "}
        <ServiceProcess
          steps={hvacProcessSteps.steps.map((s, i) => ({
            step: `${i + 1}`,
            title: s.title,
            description: s.description,
            icon: s.image,
          }))}
          title="Our HVAC Service Process"
          subTitle="We follow a structured, safe and efficient workflow"
        />
      </div>
      <div className=" mb-[45px] md:mb-[64px]">
        <ConsultLegalExpert
          heading={hvacWhyData.heading}
          subheading={hvacWhyData.subheading}
          image={hvacWhyData.image}
          listItems={hvacWhyData.listItems}
        />
      </div>
      <TestimonialsSection {...testimonialsData} />

      <FAQSComp faqs={hvacFaqs} image="/images/services/flooring.png" />
    </section>
  );
};

export default HvacComponent;
