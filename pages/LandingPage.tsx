"use client";

import "./globals.css";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe all elements with animation classes after a short delay to ensure DOM is ready
    const observeElements = () => {
      const animatedElements = document.querySelectorAll(
        ".fade-in-on-scroll, .slide-left-on-scroll, .slide-right-on-scroll, .scale-in-on-scroll"
      );
      animatedElements.forEach((el) => observerRef.current?.observe(el));
    };

    // Use setTimeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(observeElements, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        const animatedElements = document.querySelectorAll(
          ".fade-in-on-scroll, .slide-left-on-scroll, .slide-right-on-scroll, .scale-in-on-scroll"
        );
        animatedElements.forEach((el) => observerRef.current?.unobserve(el));
      }
    };
  }, []);

  return (
    <div
      id="home"
      className="relative w-full flex flex-col items-center bg-white"
      style={{ minHeight: "9044px" }}
    >
      {/* Top Banner */}
      <div className="absolute top-[25px] sm:top-[10px] md:top-0 left-0 w-full h-[50px] md:h-[65px] bg-[#5425FF] flex items-center justify-center z-50 animate-fade-in-down px-4">
        <p className="text-white font-figtree text-[14px] sm:text-[18px] md:text-[24px] leading-[120%] text-center">
          Hackathon begins in: 05 Days 12 Hours 50 Minutes
        </p>
      </div>

      {/* Hero Section - Full Width */}
      <div className="absolute top-[70px] sm:top-[60px] md:top-[65px] left-0 w-full h-[520px] sm:h-[650px] md:h-[971px] overflow-hidden z-10 animate-fade-in">
        <img
          src="/images/highlights/Group 35178 (2).png"
          alt="Hero"
          className="w-full h-full object-contain object-top translate-y-[30px] sm:-translate-y-[50px] md:-translate-y-[150px] scale-[1.15] sm:scale-105 md:scale-100"
        />

        {/* Floating Ellipse SVGs */}
        <motion.img
          src="/images/Ellipse 53.svg"
          alt="Floating decoration"
          className="absolute top-[40px] left-[8px] sm:top-[120px] sm:left-[60px] w-[35px] h-[35px] sm:w-[63px] sm:h-[64px] z-30"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.img
          src="/images/Ellipse 53.svg"
          alt="Floating decoration"
          className="absolute top-[70px] right-[15px] sm:top-[250px] sm:right-[120px] w-[35px] h-[35px] sm:w-[63px] sm:h-[64px] z-30"
          animate={{
            y: [0, -25, 0],
            x: [0, -8, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.img
          src="/images/Ellipse 53.svg"
          alt="Floating decoration"
          className="hidden sm:block absolute top-[400px] left-[200px] w-[63px] h-[64px] z-30"
          animate={{
            y: [0, -18, 0],
            x: [0, 12, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.img
          src="/images/Ellipse 53.svg"
          alt="Floating decoration"
          className="hidden md:block absolute bottom-[250px] right-[80px] w-[63px] h-[64px] z-30"
          animate={{
            y: [0, -22, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />

        {/* Timer, City, and Type Info */}
        <div className="absolute bottom-[335px] sm:bottom-[280px] md:bottom-[580px] left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-3 sm:gap-8 md:gap-20 z-20 animate-scale-in px-2 sm:px-4">
          <div className="flex flex-col items-center">
            <div className="text-[#5425FF] font-figtree font-bold text-[16px] sm:text-[24px] md:text-[32px] leading-[120%] mb-0.5">5+</div>
            <div className="text-[#5425FF] font-figtree font-medium text-[10px] sm:text-[13px] md:text-[16px] leading-[120%] opacity-80">Cities</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[#5425FF] font-figtree font-bold text-[16px] sm:text-[24px] md:text-[32px] leading-[120%] mb-0.5">36</div>
            <div className="text-[#5425FF] font-figtree font-medium text-[10px] sm:text-[13px] md:text-[16px] leading-[120%] opacity-80">Hours</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[#5425FF] font-figtree font-bold text-[16px] sm:text-[24px] md:text-[32px] leading-[120%] mb-0.5">Offline</div>
            <div className="text-[#5425FF] font-figtree font-medium text-[10px] sm:text-[13px] md:text-[16px] leading-[120%] opacity-80">Type</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="absolute bottom-[40px] sm:bottom-[100px] md:bottom-[470px] left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 z-20 animate-scale-in px-4 w-full max-w-[350px] sm:max-w-none">
          <a
            href="/signup"
            className="flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 gap-[10px] w-full sm:w-[171px] h-[44px] sm:h-[48px] bg-[#5425FF] hover:bg-[#4319CC] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
          >
            <span className="font-figtree font-medium text-[14px] sm:text-[20px] leading-[24px] text-center text-white whitespace-nowrap">
              Register Now
            </span>
          </a>
          <a
            href="/login"
            className="box-border flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 gap-[10px] w-full sm:w-[171px] h-[44px] sm:h-[48px] bg-white border-2 border-[#5425FF] hover:bg-[#F9F9F9] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
          >
            <span className="font-figtree font-medium text-[14px] sm:text-[20px] leading-[24px] text-center text-[#5425FF]">
              Login
            </span>
          </a>
        </div>
      </div>

      <main
        className="relative w-full max-w-[1440px] bg-white px-4 sm:px-6 md:px-0"
        style={{ minHeight: "8604px" }}
      >
        {/* Decorative Groups - Hidden on mobile */}
        <div className="hidden md:block absolute left-[88px] top-[3630px] w-[105.27px] h-[121.27px] -rotate-[44.83deg] animate-float z-50">
          <img src="/images/decoration-1.svg" alt="" width={105} height={121} />
        </div>
        <div
          className="hidden md:block absolute left-[1270px] top-[1000px] w-[105.27px] h-[121.27px] -rotate-[44.83deg] animate-float z-50"
          style={{ animationDelay: "1s" }}
        >
          <img src="/images/decoration-2.svg" alt="" width={105} height={121} />
        </div>
        <div
          className="hidden md:block absolute left-[1310px] top-[3489.8px] w-[105.27px] h-[121.27px] rotate-[32.83deg] animate-float z-50"
          style={{ animationDelay: "2s" }}
        >
          <img src="/images/decoration-3.svg" alt="" width={105} height={121} />
        </div>

        {/* More Green Circles - Hidden on mobile */}
        <div className="hidden md:block absolute left-[359px] top-[1586px] w-[45.8px] h-[45.77px] bg-[#24FF00] rounded-full shadow-[0px_0px_6.48px_2.05px_rgba(36,255,0,1)] animate-pulse-slow" />
        <div
          className="hidden md:block absolute left-[412px] top-[2113px] w-[45.8px] h-[45.77px] bg-[#24FF00] rounded-full shadow-[0px_0px_6.48px_2.05px_rgba(36,255,0,1)] animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="hidden md:block absolute left-[1072px] top-[1818px] w-[45.8px] h-[45.77px] bg-[#24FF00] rounded-full shadow-[0px_0px_6.48px_2.05px_rgba(36,255,0,1)] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />

        {/* HIGHLIGHTS Frame 22 */}
        <div
          className="fade-in-on-scroll absolute top-[920px] sm:top-[1220px] md:top-[1520px] w-full max-w-[1383px] flex flex-col items-center gap-6 md:gap-9 px-4"
          style={{ left: "50%", transform: "translateX(-50%)" }}
        >
          <h2 className="w-full font-silkscreen font-normal text-[32px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
            HIGHLIGHTS
          </h2>

          <div className="w-full flex flex-col gap-4 md:gap-6">
            {/* Row 1 */}
            <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-6">
              {[
                {
                  text: "36-hour non-stop build marathon",
                  img: "highlight-1.png",
                },
                { text: "Happening across 5+ states", img: "highlight-2.png" },
                {
                  text: "Work with top industry mentors",
                  img: "highlight-3.png",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="fade-in-on-scroll stagger-1 flex-1 flex flex-col justify-center items-center gap-3 sm:gap-5 px-6 sm:px-12 md:px-[84px] py-4 sm:py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 min-h-[180px] sm:min-h-[220px]"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/highlights/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-full max-w-[264px] font-figtree font-semibold text-[18px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-6">
              {[
                {
                  text: "Solve real-world problem statements",
                  img: "highlight-5.png",
                },
                {
                  text: "Meet tech leaders & potential employers",
                  img: "highlight-6.png",
                },
                {
                  text: "Showcase your work to recruiters",
                  img: "highlight-7.png",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="fade-in-on-scroll stagger-1 flex-1 flex flex-col justify-center items-center gap-3 sm:gap-5 px-6 sm:px-12 md:px-[84px] py-4 sm:py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 min-h-[180px] sm:min-h-[220px]"
                  style={{ transitionDelay: `${(idx + 3) * 0.1}s` }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/highlights/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-full max-w-[264px] font-figtree font-semibold text-[18px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LOCATIONS Frame 28 */}
        <div className="fade-in-on-scroll absolute left-0 top-[2200px] sm:top-[2150px] md:top-[2200px] w-full px-4 flex flex-col justify-center items-center gap-6 md:gap-9">
          <div className="w-full flex flex-col items-center gap-2 md:gap-3 mb-2">
            <h2 className="w-full font-silkscreen font-normal text-[32px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
              LOCATIONS
            </h2>
            <p className="w-full max-w-[1108px] font-figtree font-semibold text-[18px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-black px-4">
              Choose your city at registration
            </p>
          </div>

          <div className="w-full max-w-[1388px] flex flex-col gap-4 md:gap-6">
            {/* Row 1 */}
            <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              {[
                { city: "Bengaluru", img: "bengaluru.png" },
                { city: "Chennai", img: "chennai.png" },
                { city: "Hyderabad", img: "hyderabad.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="slide-left-on-scroll stagger-1 flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 mb-2 sm:mb-0"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <img
                      src={`/images/locations/${item.img}`}
                      alt=""
                      width={120}
                      height={120}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1 sm:gap-2 text-center sm:text-left">
                    <p className="font-figtree font-semibold text-[20px] sm:text-[24px] md:text-[28px] leading-[120%] md:leading-[34px] text-black">
                      {item.city}
                    </p>
                    <div className="flex flex-col gap-1">
                      <p className="font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-[#6A6A6A]">
                        Date : 17 / 03 / 2025
                      </p>
                      <p className="font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-[#6A6A6A]">
                        Venue: Social Indirangar
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              {[
                { city: "Goa", img: "goa.png" },
                { city: "Pune", img: "pune.png" },
                { city: "Delhi NCR", img: "delhi.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="slide-right-on-scroll stagger-1 flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 sm:py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 mb-2 sm:mb-0"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <img
                      src={`/images/locations/${item.img}`}
                      alt=""
                      width={120}
                      height={120}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1 sm:gap-2 text-center sm:text-left">
                    <p className="font-figtree font-semibold text-[20px] sm:text-[24px] md:text-[28px] leading-[120%] md:leading-[34px] text-black">
                      {item.city}
                    </p>
                    <div className="flex flex-col gap-1">
                      <p className="font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-[#6A6A6A]">
                        Date : 17 / 03 / 2025
                      </p>
                      <p className="font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-[#6A6A6A]">
                        Venue: Social Indirangar
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map - Positioned absolutely to span full width */}
        <div className="scale-in-on-scroll absolute left-0 top-[3550px] sm:top-[2800px] md:top-[2748px] w-full h-[80px] sm:h-[120px] md:h-[168px]">
          <img
            src="/images/map.svg"
            alt=""
            width={1920}
            height={168}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Meet the Experts Frame 35 */}
        <div className="fade-in-on-scroll absolute left-0 top-[4050px] sm:top-[3300px] md:top-[3544px] w-full px-4 flex flex-col gap-6 md:gap-9">
          <div className="w-full flex flex-col items-center gap-2 md:gap-3">
            <h2 className="w-full font-silkscreen font-normal text-[32px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
              MEET THE EXPERTS
            </h2>
            <p className="w-full max-w-[765px] font-figtree font-semibold text-[16px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-black px-4">
              Your projects will be evaluated and guided by leading
              professionals in HPC, AI, cloud, and engineering.
            </p>
          </div>

          <div className="w-full max-w-[1389px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-[14px]">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="scale-in-on-scroll stagger-1 flex flex-col gap-3 md:gap-4 bg-[#F3F3F3] rounded-xl p-3 md:p-4 hover:scale-105 hover:shadow-xl transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="w-full aspect-[13/14] bg-white rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/experts/expert-1.png"
                    alt=""
                    width={260}
                    height={280}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex flex-col justify-center items-center gap-1 md:gap-2 w-full">
                  <p className="w-full font-figtree font-semibold text-[18px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-black">
                    &lt;Name&gt;
                  </p>
                  <p className="w-full font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-center text-[#6A6A6A]">
                    Director, HPC Labs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prize Pool */}
        <div className="fade-in-on-scroll absolute left-0 top-[5000px] sm:top-[3800px] md:top-[4126px] w-full px-4 md:px-[26px]">
          <div className="w-full max-w-[1388px] mx-auto min-h-[500px] sm:min-h-[650px] md:h-[815px] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-500 relative">
          <img
            src="/images/highlights/freepik__upload__61360.png"
            alt="Prize Pool"
            width={1388}
            height={815}
            className="w-full h-full rounded-2xl object-cover absolute inset-0"
          />
          
          {/* Floating Laptop - Left Side */}
          <motion.img
            src="/images/highlights/e60d1cac2d1983bfcfc2bc5d81f6136eaee9d410.png"
            alt="Laptop"
            className="hidden sm:block absolute bottom-10 left-10 w-32 h-32 md:w-48 md:h-48 object-contain opacity-100 z-20"
            style={{ filter: "brightness(1.2) saturate(1.3)" }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating Money Bag - Right Side */}
          <motion.img
            src="/images/highlights/ff8d9124ec3acac378933e9d045fc94a49f98f3e.png"
            alt="Money Bag"
            className="hidden sm:block absolute bottom-16 right-12 w-28 h-28 md:w-40 md:h-40 object-contain opacity-100 z-20"
            style={{ filter: "brightness(1.2) saturate(1.3)" }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Prize Pool Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 z-10 -translate-y-8 md:-translate-y-16">
            {/* Title */}
            <h2 className="font-silkscreen font-normal text-[32px] sm:text-[48px] md:text-[64px] leading-[120%] md:leading-[80px] text-center text-white mb-6 md:mb-8 px-4">
              PRIZE POOL
            </h2>
            
            {/* Animated Green Horizontal Bar */}
            <div className="mb-8 md:mb-10 w-full max-w-[800px] px-4">
              <div className="bg-[#24FF00] rounded-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex items-center justify-center">
                <span className="font-silkscreen font-normal text-[24px] sm:text-[36px] md:text-[48px] leading-[120%] md:leading-[58px] text-white">
                  ₹ XXXXXXXX+
                </span>
              </div>
            </div>
            
            {/* Prize Breakdown */}
            <div className="w-full max-w-[900px] space-y-2 sm:space-y-3 mb-6 md:mb-8 text-center px-4">
              <div className="font-figtree font-semibold text-[16px] sm:text-[20px] md:text-[24px] leading-[120%] md:leading-[32px] text-white">
                1st Prize: Cash + Laptop + Goodies + Fast-Track Internship
              </div>
              
              <div className="font-figtree font-semibold text-[16px] sm:text-[20px] md:text-[24px] leading-[120%] md:leading-[32px] text-white">
                2nd Prize: Cash + Swag + Industry Vouchers
              </div>
              
              <div className="font-figtree font-semibold text-[16px] sm:text-[20px] md:text-[24px] leading-[120%] md:leading-[32px] text-white">
                3rd Prize: Goodies + Tech Accessories + Recognition
              </div>
            </div>
            
            {/* For Every Participant */}
            <div className="w-full max-w-[900px] text-center px-4">
              <div className="font-figtree font-bold text-[16px] sm:text-[20px] md:text-[24px] leading-[120%] md:leading-[32px] text-[#24FF00] mb-3 md:mb-4">
                For Every Participant
              </div>
              <div className="space-y-1 sm:space-y-2 text-center font-figtree font-semibold text-[14px] sm:text-[18px] md:text-[24px] leading-[120%] md:leading-[32px] text-white">
                <div className="flex items-center justify-center">
                  <span className="text-[#24FF00] mr-2">•</span>
                  <span>Certificate of Participation</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[#24FF00] mr-2">•</span>
                  <span>Access to mentors</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[#24FF00] mr-2">•</span>
                  <span>Visibility to hiring partners</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[#24FF00] mr-2">•</span>
                  <span>Event Swags (T-shirt, Stickers, Notebook)</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* THEMES Frame 48 */}
        <div className="fade-in-on-scroll absolute left-0 top-[5550px] sm:top-[4500px] md:top-[5000px] w-full px-4 flex flex-col items-center gap-6 md:gap-9">
          <div className="w-full flex flex-col items-center gap-2 md:gap-3">
            <h2 className="w-full font-silkscreen font-normal text-[32px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
              THEMES
            </h2>
            <p className="w-full max-w-[765px] font-figtree font-semibold text-[16px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-black px-4">
              Build solutions across cutting-edge domains:
            </p>
          </div>

          <div className="w-full max-w-[1388px] flex flex-col gap-4 md:gap-6">
            {/* Row 1 - 4 cards */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { text: "High-Performance Computing", img: "theme-1.png" },
                { text: "AI / ML", img: "theme-2.png" },
                { text: "Developer Tools", img: "theme-3.png" },
                { text: "Cloud & Distributed Systems", img: "theme-4.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="scale-in-on-scroll stagger-1 flex flex-col justify-center items-center gap-3 sm:gap-5 px-4 sm:px-8 md:px-[84px] py-4 sm:py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 min-h-[160px] sm:min-h-[200px] md:min-h-[220px]"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/themes/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-full font-figtree font-semibold text-[16px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 - 3 cards */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { text: "Cybersecurity", img: "theme-5.png" },
                { text: "Sustainability", img: "theme-6.png" },
                { text: "Open Innovation", img: "theme-7.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="scale-in-on-scroll stagger-1 flex flex-col justify-center items-center gap-3 sm:gap-5 px-4 sm:px-8 md:px-[84px] py-4 sm:py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 min-h-[160px] sm:min-h-[200px] md:min-h-[220px]"
                  style={{ transitionDelay: `${(idx + 4) * 0.1}s` }}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/themes/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-full font-figtree font-semibold text-[16px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
              {/* Empty spacer for desktop alignment */}
              <div className="hidden md:block" />
            </div>
          </div>
        </div>

        {/* HOW IT WORKS Frame 57 - Full Width */}
        <div className="fade-in-on-scroll absolute left-0 top-[6390px] sm:top-[4850px] md:top-[5650px] w-full flex flex-col items-center gap-6 md:gap-8 z-10 relative">
          {/* Floating Cubes - Hidden on mobile */}
          <div className="hidden md:block absolute left-[12%] top-[150px] z-30 animate-float pointer-events-none">
            <img src="/images/decoration-1.svg" alt="" width={90} height={90} />
          </div>
          <div
            className="hidden md:block absolute left-[10%] top-[400px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "1.5s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={85} height={85} />
          </div>
          <div
            className="hidden md:block absolute right-[12%] top-[100px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "0.8s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={95} height={95} />
          </div>
          <div
            className="hidden md:block absolute right-[10%] top-[380px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "2.2s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={88} height={88} />
          </div>

          <div className="w-full h-[70px] sm:h-[90px] md:h-[112px] flex items-center justify-center px-4 sm:px-8 md:px-[139px] py-2 bg-[#24FF00] md:rounded-2xl relative z-10">
            <h2 className="font-silkscreen font-normal text-[36px] sm:text-[52px] md:text-[72px] leading-[120%] md:leading-[92px] text-center text-[#5425FF]">
              HOW IT WORKS
            </h2>
          </div>

          <div className="w-full max-w-[731px] flex flex-col gap-3 md:gap-4 relative z-10 px-4">
            {[
              { step: "1", title: "Register your team", desc: " (Team of 4)" },
              {
                step: "2",
                title: "Select your city",
                desc: "Attend the offline edition near you.",
              },
              {
                step: "3",
                title: "Build for 36 hours",
                desc: "Solve a real-world problem with your team.",
              },
              {
                step: "4",
                title: "Demo to judges",
                desc: "Top teams from each city qualify for the grand stage.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="slide-right-on-scroll stagger-1 w-full min-h-[70px] sm:min-h-[85px] md:min-h-[100px] flex items-center gap-4 sm:gap-6 md:gap-9 px-4 sm:px-6 md:px-[37px] py-3 sm:py-[13px] bg-[#E9FEE6] rounded-xl hover:scale-[1.02] hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <p className="w-[30px] sm:w-[37px] font-silkscreen font-normal text-[36px] sm:text-[48px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF] flex-shrink-0">
                  {item.step}
                </p>
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-figtree font-semibold text-[18px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-black">
                    {item.title}
                  </p>
                  <p className="font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-[#6A6A6A]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RULES & ELIGIBILITY Frame 56 */}
        <div id="rules" className="fade-in-on-scroll absolute left-0 top-[6500px] sm:top-[5380px] md:top-[5730px] w-full px-4 flex flex-col items-center gap-6 md:gap-8 relative">
          {/* Animated Cubes - Desktop Only */}
          <div className="hidden md:block absolute left-[20px] top-[50px] z-30 animate-float pointer-events-none">
            <img src="/images/decoration-1.svg" alt="" width={90} height={90} />
          </div>
          <div
            className="hidden md:block absolute left-[20px] top-[320px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "1.2s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={85} height={85} />
          </div>
          <div
            className="hidden md:block absolute left-[20px] top-[590px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "2.4s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={88} height={88} />
          </div>
          <div
            className="hidden md:block absolute right-[20px] top-[150px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "0.7s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={95} height={95} />
          </div>
          <div
            className="hidden md:block absolute right-[20px] top-[420px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "1.8s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={90} height={90} />
          </div>
          <div
            className="hidden md:block absolute right-[20px] top-[650px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "3.0s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={88} height={88} />
          </div>

          <h2 className="w-full max-w-[765px] font-silkscreen font-normal text-[28px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF] relative z-20">
            RULES & ELIGIBILITY
          </h2>

          <div className="w-full max-w-[731px] flex flex-col gap-3 md:gap-4 relative z-20">
            {[
              "Team of exactly 4 students",
              "Must be enrolled in any college in India",
              "Only original work allowed",
              "Allowed tech stack: Open-source, Cloud tools, HPC resources",
              "Judging criteria: Innovation | Feasibility | Technical Execution | Presentation",
            ].map((rule, idx) => (
              <div
                key={idx}
                className="slide-left-on-scroll stagger-1 w-full min-h-[70px] sm:min-h-[85px] md:min-h-[100px] flex items-center gap-4 sm:gap-6 md:gap-9 px-4 sm:px-6 md:px-[37px] py-3 sm:py-[13px] bg-[#F3F3F3] rounded-xl hover:scale-[1.02] hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <p className="w-[30px] sm:w-[44px] font-silkscreen font-normal text-[36px] sm:text-[48px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF] flex-shrink-0">
                  {idx + 1}
                </p>
                <p className="font-figtree font-semibold text-[16px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-black flex-1">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          <button className="scale-in-on-scroll flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 gap-[10px] w-[160px] sm:w-[183px] h-[42px] sm:h-[48px] bg-[#5425FF] hover:bg-[#4319CC] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl relative z-20">
            <span className="font-figtree font-medium text-[16px] sm:text-[20px] leading-[24px] text-center text-white whitespace-nowrap">
              View Full Rules
            </span>
          </button>
        </div>

        {/* GALLERY Frame 58 */}
        <div className="fade-in-on-scroll absolute left-0 top-[7600px] sm:top-[6650px] md:top-[7080px] w-full px-4 flex flex-col gap-6 md:gap-9">
          <div className="w-full flex flex-col items-center gap-2 md:gap-3">
            <h2 className="w-full font-silkscreen font-normal text-[32px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
              GALLERY
            </h2>
            <p className="w-full max-w-[765px] font-figtree font-semibold text-[16px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-center text-black">
              A sneak peek into the vibe
            </p>
          </div>
          <div className="w-full max-w-[1389px] mx-auto h-auto flex items-center justify-center hover:scale-[1.02] transition-transform duration-500">
            <img
              src="/images/gallery.svg"
              alt="Gallery"
              width={1389}
              height={280}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Registration CTA Frame 65 */}
        <div className="fade-in-on-scroll absolute left-0 top-[7880px] sm:top-[6940px] md:top-[7540px] w-full px-4 md:px-[26px]">
          <div className="w-full max-w-[1388px] mx-auto h-[200px] sm:h-[300px] md:h-[440px] overflow-hidden rounded-2xl">
            <img
              src="/images/highlights/freepik__upload__15243.png"
              alt="Registration CTA"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* FAQ Frame 59 */}
        <div className="fade-in-on-scroll absolute left-0 top-[8200px] sm:top-[7490px] md:top-[8050px] w-full px-4 flex flex-col items-center gap-6 md:gap-8">
          <h2 className="w-full font-silkscreen font-normal text-[32px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
            FAQ
          </h2>

          <div className="w-full max-w-[731px] flex flex-col gap-3 md:gap-4">
            {[
              {
                q: "Who can participate?",
                a: "Any student currently enrolled in a college",
              },
              { q: "Is it free?", a: "Yes, participation is completely free." },
              {
                q: "Is it an offline event?",
                a: "Yes, 100% offline across all cities.",
              },
              {
                q: "Are the prizes real?",
                a: "Absolutely — backed by sponsors and partners.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="scale-in-on-scroll stagger-1 w-full min-h-[70px] sm:min-h-[85px] md:min-h-[100px] flex items-center gap-4 sm:gap-6 md:gap-9 px-4 sm:px-6 md:px-[37px] py-3 sm:py-[13px] bg-[#F3F3F3] rounded-xl hover:scale-[1.02] hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-figtree font-semibold text-[18px] sm:text-[22px] md:text-[28px] leading-[120%] md:leading-[34px] text-black">
                    {item.q}
                  </p>
                  <p className="font-figtree font-semibold text-[14px] sm:text-[16px] md:text-[20px] leading-[120%] md:leading-[24px] text-[#6A6A6A]">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Decorative Element - Hidden on mobile */}
        <div
          className="hidden md:block absolute left-[31px] top-[1373.15px] w-[105.27px] h-[121.27px] -rotate-[40.45deg] z-50 animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <img
            src="/images/decoration-small.svg"
            alt=""
            width={105}
            height={121}
          />
        </div>
      </main>

      {/* Footer Frame 63 - Right after FAQ */}
      <div className="fade-in-on-scroll absolute left-0 top-[140px] w-full h-[300px] sm:h-[360px] md:h-[440px] overflow-hidden relative">
        <img
          src="/images/footer.png"
          alt="Footer"
          className="w-full h-full object-cover"
        />
        
        {/* Contact Information - Top Left */}
        <div className="absolute left-4 sm:left-8 md:left-12 top-16 sm:top-20 md:top-28 flex flex-col gap-2 sm:gap-3 md:gap-4 text-white z-10">
          <div className="font-figtree font-medium text-[14px] sm:text-[20px] md:text-[28px] leading-[120%] md:leading-[30px]">
            Email: support@hackonx.com
          </div>
          <div className="font-figtree font-medium text-[14px] sm:text-[20px] md:text-[28px] leading-[120%] md:leading-[30px]">
            Phone: +91 XXXXX XXXXX
          </div>
          <div className="font-figtree font-medium text-[14px] sm:text-[20px] md:text-[28px] leading-[120%] md:leading-[30px]">
            Instagram | LinkedIn
          </div>
        </div>

        {/* HACKONX Logo - Top Right */}
        <div className="absolute top-4 sm:top-6 md:top-10 right-4 sm:right-8 md:right-12 z-10">
          <h2 className="font-silkscreen font-normal text-[24px] sm:text-[36px] md:text-[48px] leading-[120%] md:leading-[58px] text-white">
            HACKONX
          </h2>
        </div>

        {/* Navigation Links - Bottom Right */}
        <div className="absolute bottom-8 sm:bottom-12 md:bottom-20 right-4 sm:right-8 md:right-12 flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white z-10">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="font-figtree font-medium text-[14px] sm:text-[16px] md:text-[20px] leading-[24px] text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Home
          </a>
          <a
            href="/signup"
            className="font-figtree font-medium text-[14px] sm:text-[16px] md:text-[20px] leading-[24px] text-white hover:opacity-80 transition-opacity"
          >
            Register
          </a>
          <a
            href="#rules"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="font-figtree font-medium text-[14px] sm:text-[16px] md:text-[20px] leading-[24px] text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Rules
          </a>
          <a
            href="#contact"
            className="font-figtree font-medium text-[14px] sm:text-[16px] md:text-[20px] leading-[24px] text-white hover:opacity-80 transition-opacity"
          >
            Contact
          </a>
        </div>
      </div>

      {/* What's HackOnX Frame 11 - Full Width */}
      <div className="fade-in-on-scroll absolute left-0 top-[560px] sm:top-[750px] md:top-[950px] w-full min-h-[200px] sm:min-h-[250px] md:h-[283px] flex flex-col justify-center items-center gap-4 md:gap-6 px-4 sm:px-8 md:px-[139px] py-8 md:py-12 bg-gradient-to-r from-[#E9E3FF] to-[#E9FFE5] rounded-2xl overflow-hidden">
        <h2 className="w-full max-w-[486px] font-silkscreen font-normal text-[28px] sm:text-[36px] md:text-[48px] leading-[120%] md:leading-[61px] text-[#5425FF] text-center">
          What's HackOnX
        </h2>
        <p className="w-full max-w-[1108px] font-figtree font-semibold text-[16px] sm:text-[20px] md:text-[28px] leading-[24px] sm:leading-[28px] md:leading-[34px] text-center text-black">
          HackOnX is a multi-state offline hackathon bringing together India's
          smartest student builders. Designed around High-Performance Computing,
          it challenges you to solve real-world problems at scale. Learn, build,
          and compete—city by city.
        </p>
      </div>

      {/* In Collaboration With Frame 29 - Full Width */}
      <div className="fade-in-on-scroll absolute left-0 top-[3650px] sm:top-[2920px] md:top-[3000px] w-full px-4 flex flex-col items-center gap-6 md:gap-9">
        <h2 className="w-full font-silkscreen font-normal text-[28px] sm:text-[44px] md:text-[58px] leading-[120%] md:leading-[74px] text-center text-[#5425FF]">
          IN COLLABORATION WITH
        </h2>
        <div className="w-full max-w-[1390px] flex flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="scale-in-on-scroll stagger-1 w-[120px] sm:w-[160px] md:w-[200px] h-[50px] sm:h-[65px] md:h-[80px] bg-[#D9D9D9] hover:scale-110 hover:bg-[#C9C9C9] transition-all duration-300 rounded-lg"
              style={{ transitionDelay: `${idx * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
