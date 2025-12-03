import Button from "@/common/Button";
import Modal from "@/common/Modal";
import { useState, useEffect } from "react";
import Image from "next/image";
import Confetti from "react-confetti";

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("welcomeModalShownAt");

    if (
      !lastShown ||
      Date.now() - Number(lastShown) > 24 * 60 * 60 * 1000 * 7
    ) {
      setIsOpen(true);
      localStorage.setItem("welcomeModalShownAt", Date.now().toString());
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, []);

  return (
    <div>
      <Modal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        rootCls="z-[9999]"
        className="max-w-[700px] md:h-[450px] h-[400px]"
        isCloseRequired={false}
      >
        {showConfetti && (
          <Confetti width={window.innerWidth} height={window.innerHeight} />
        )}
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg  max-w-lg text-center">
            <h2 className="md:text-[32px] text-[18px] font-Gordita-Bold  text-[#5297FF]">
              WELCOME TO THEIMPROVEMENT!
            </h2>
            <p className="md:text-[16px] text-[12px] text-gray-500 max-w-[280px] mx-auto font-Gordita-Medium mt-2 mb-4">
              The Only Platform You Need for Your Dream Home
            </p>

            <div className="relative md:w-[100px] md:h-[100px] w-[80px] h-[80px] mx-auto bg-gray-300 rounded-lg ">
              <Image
                src="/images/newlogo2.png"
                alt="logo"
                width={100}
                height={100}
                className="absolute object-cover p-1"
              />
            </div>
            <p className="text-gray-400 mt-4 md:text-[16px] text-[12px] font-Gordita-Medium md:mb-7 mb-10 max-md:max-w-[300px] text-center mx-auto">
              Discover expert solutions for{" "}
              <span className="text-yellow-400 font-Gordita-Bold">
                Construction
              </span>
              ,
              <span className="text-yellow-400 font-Gordita-Bold">
                {" "}
                Renovation
              </span>
              , and
              <span className="text-yellow-400 font-Gordita-Bold">
                {" "}
                Home Enhancements
              </span>
              , all designed to transform your living space with ease and
              quality.
            </p>
            <div className="mt-4 flex justify-center gap-10">
              <Button
                className="md:px-7 px-5 py-3 bg-gray-400 text-white rounded-lg text-[12px] md:text-[16px] font-Gordita-Medium hover:bg-gray-400"
                onClick={() => setIsOpen(false)}
              >
                Learn More
              </Button>
              <Button
                className="md:px-9 px-5 md:py-3 border bg-[#5297ff] py-1  text-[12px] md:text-[16px]  rounded-lg text-white font-Gordita-Medium hover:bg-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WelcomeModal;
