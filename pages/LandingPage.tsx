"use client";

import "./globals.css";
import { useEffect, useRef } from "react";

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
      className="relative w-full flex flex-col items-center bg-white overflow-x-hidden"
      style={{ height: "9104px" }}
    >
      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full h-[65px] bg-[#5425FF] flex items-center justify-center z-50 animate-fade-in-down">
        <p className="text-white font-figtree text-[24px] leading-[120%] text-center">
          Hackathon begins in: 05 Days 12 Hours 46 Minutes
        </p>
      </div>

      {/* Hero Section - Full Width */}
      <div className="absolute top-[65px] left-0 w-full h-[971px] overflow-hidden z-10 animate-fade-in">
        <img
          src="/images/highlights/image.png"
          alt="Hero"
          fill
          quality={100}
          priority
          className="object-cover"
        />

        {/* Buttons */}
        <div className="absolute bottom-[350px] left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20 animate-scale-in">
          <a
            href="/signup"
            className="flex items-center justify-center px-6 py-3 gap-[10px] w-[171px] h-[48px] bg-[#5425FF] hover:bg-[#4319CC] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
          >
            <span className="w-[123px] h-[24px] font-figtree font-medium text-[20px] leading-[24px] text-center text-white">
              Register Now
            </span>
          </a>
          <a
            href="/login"
            className="box-border flex items-center justify-center px-6 py-3 gap-[10px] w-[98px] h-[48px] bg-white border-2 border-[#5425FF] hover:bg-[#F9F9F9] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
          >
            <span className="w-[50px] h-[24px] font-figtree font-medium text-[20px] leading-[24px] text-center text-[#5425FF]">
              Login
            </span>
          </a>
        </div>
      </div>

      <main
        className="relative w-[1440px] bg-white overflow-hidden"
        style={{ minHeight: "8604px" }}
      >
        {/* Decorative Groups */}
        <div className="absolute left-[88px] top-[3630px] w-[105.27px] h-[121.27px] -rotate-[44.83deg] animate-float z-50">
          <img src="/images/decoration-1.svg" alt="" width={105} height={121} />
        </div>
        <div
          className="absolute left-[1217.94px] top-[1033.33px] w-[105.27px] h-[121.27px] -rotate-[44.83deg] animate-float z-50"
          style={{ animationDelay: "1s" }}
        >
          <img src="/images/decoration-2.svg" alt="" width={105} height={121} />
        </div>
        <div
          className="absolute left-[1310px] top-[3489.8px] w-[105.27px] h-[121.27px] rotate-[32.83deg] animate-float z-50"
          style={{ animationDelay: "2s" }}
        >
          <img src="/images/decoration-3.svg" alt="" width={105} height={121} />
        </div>

        {/* More Green Circles */}
        <div className="absolute left-[359px] top-[1586px] w-[45.8px] h-[45.77px] bg-[#24FF00] rounded-full shadow-[0px_0px_6.48px_2.05px_rgba(36,255,0,1)] animate-pulse-slow" />
        <div
          className="absolute left-[412px] top-[2113px] w-[45.8px] h-[45.77px] bg-[#24FF00] rounded-full shadow-[0px_0px_6.48px_2.05px_rgba(36,255,0,1)] animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute left-[1072px] top-[1818px] w-[45.8px] h-[45.77px] bg-[#24FF00] rounded-full shadow-[0px_0px_6.48px_2.05px_rgba(36,255,0,1)] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />

        {/* HIGHLIGHTS Frame 22 */}
        <div
          className="fade-in-on-scroll absolute top-[1600px] w-[1383px] h-[574px] flex flex-col items-center gap-9"
          style={{ left: "calc(50% - 1383px/2 - 2.5px)" }}
        >
          <h2 className="w-[1383px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
            HIGHLIGHTS
          </h2>

          <div className="w-[1383px] h-[464px] flex flex-col gap-6">
            {/* Row 1 */}
            <div className="w-[1383px] h-[220px] flex gap-6">
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
                  className="fade-in-on-scroll stagger-1 flex-1 flex flex-col justify-center items-center gap-5 px-[84px] py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-20 h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/highlights/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-[264px] h-[68px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="w-[1383px] h-[220px] flex gap-6">
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
                  className="fade-in-on-scroll stagger-1 flex-1 flex flex-col justify-center items-center gap-5 px-[84px] py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${(idx + 3) * 0.1}s` }}
                >
                  <div className="w-20 h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/highlights/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-[264px] h-[68px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LOCATIONS Frame 28 */}
        <div className="fade-in-on-scroll absolute left-[26px] top-[2250px] w-[1388px] h-[716px] flex flex-col justify-center items-center gap-9">
          <div className="w-[1388px] h-[120px] flex flex-col items-center gap-3">
            <h2 className="w-[1388px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
              LOCATIONS
            </h2>
            <p className="w-[1108px] h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-black">
              Choose your city at registration
            </p>
          </div>

          <div className="w-[1388px] h-[560px] flex flex-col gap-6">
            {/* Row 1 */}
            <div className="w-[1388px] h-[172px] flex justify-center items-center gap-6">
              {[
                { city: "Bengaluru", img: "bengaluru.png" },
                { city: "Chennai", img: "chennai.png" },
                { city: "Hyderabad", img: "hyderabad.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="slide-left-on-scroll stagger-1 flex-1 flex items-center justify-center gap-5 px-6 py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-[120px] h-[120px] rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300">
                    <img
                      src={`/images/locations/${item.img}`}
                      alt=""
                      width={120}
                      height={120}
                      className="w-full h-full rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-2 w-[264px] h-[94px]">
                    <p className="w-[264px] h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-black">
                      {item.city}
                    </p>
                    <div className="flex flex-col gap-1 w-[264px] h-[52px]">
                      <p className="w-[264px] h-[24px] font-figtree font-semibold text-[20px] leading-[24px] text-[#6A6A6A]">
                        Date : 17 / 03 / 2025
                      </p>
                      <p className="w-[264px] h-[24px] font-figtree font-semibold text-[20px] leading-[24px] text-[#6A6A6A]">
                        Venue: Social Indirangar
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="w-[1388px] h-[172px] flex justify-center items-center gap-6">
              {[
                { city: "Goa", img: "goa.png" },
                { city: "Pune", img: "pune.png" },
                { city: "Delhi NCR", img: "delhi.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="slide-right-on-scroll stagger-1 flex-1 flex items-center justify-center gap-5 px-6 py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-[120px] h-[120px] rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300">
                    <img
                      src={`/images/locations/${item.img}`}
                      alt=""
                      width={120}
                      height={120}
                      className="w-full h-full rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-2 w-[264px] h-[94px]">
                    <p className="w-[264px] h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-black">
                      {item.city}
                    </p>
                    <div className="flex flex-col gap-1 w-[264px] h-[52px]">
                      <p className="w-[264px] h-[24px] font-figtree font-semibold text-[20px] leading-[24px] text-[#6A6A6A]">
                        Date : 17 / 03 / 2025
                      </p>
                      <p className="w-[264px] h-[24px] font-figtree font-semibold text-[20px] leading-[24px] text-[#6A6A6A]">
                        Venue: Social Indirangar
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="scale-in-on-scroll w-[1389px] h-[168px]">
              <img
                src="/images/map.svg"
                alt=""
                width={1389}
                height={168}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Meet the Experts Frame 35 */}
        <div className="fade-in-on-scroll absolute left-[25.61px] top-[3564px] w-[1389px] h-[552px] flex flex-col gap-9">
          <div className="w-[1389px] h-[154px] flex flex-col items-center gap-3">
            <h2 className="w-[1389px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
              MEET THE EXPERTS
            </h2>
            <p className="w-[765px] h-[68px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-black">
              Your projects will be evaluated and guided by leading
              professionals in HPC, AI, cloud, and engineering.
            </p>
          </div>

          <div className="w-[1389px] h-[362px] flex justify-between items-center gap-[14px]">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="scale-in-on-scroll stagger-1 flex flex-col gap-4 w-[264px] h-[362px] bg-[#F3F3F3] rounded-xl p-4 hover:scale-105 hover:shadow-xl transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="w-full h-[280px] bg-white rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/experts/expert-1.png"
                    alt=""
                    width={260}
                    height={280}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex flex-col justify-center items-center gap-2 w-full">
                  <p className="w-full h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-black">
                    &lt;Name&gt;
                  </p>
                  <p className="w-full h-[24px] font-figtree font-semibold text-[20px] leading-[24px] text-center text-[#6A6A6A]">
                    Director, HPC Labs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prize Pool */}
        <div className="fade-in-on-scroll absolute left-[26px] top-[4176px] w-[1388px] h-[815px] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-500">
          <img
            src="/images/prize-pool-bg.svg"
            alt="Prize Pool"
            width={1388}
            height={815}
            className="w-full h-full rounded-2xl"
          />
        </div>

        {/* THEMES Frame 48 */}
        <div className="fade-in-on-scroll absolute left-[26px] top-[5050px] w-[1388px] h-[586px] flex flex-col items-center gap-9">
          <div className="w-[1388px] h-[120px] flex flex-col items-center gap-3">
            <h2 className="w-[1388px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
              THEMES
            </h2>
            <p className="w-[765px] h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-black">
              Build solutions across cutting-edge domains:
            </p>
          </div>

          <div className="w-[1388px] h-[430px] flex flex-col gap-6">
            {/* Row 1 - 4 cards */}
            <div className="w-[1388px] h-[220px] grid grid-cols-4 gap-6">
              {[
                { text: "High-Performance Computing", img: "theme-1.png" },
                { text: "AI / ML", img: "theme-2.png" },
                { text: "Developer Tools", img: "theme-3.png" },
                { text: "Cloud & Distributed Systems", img: "theme-4.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="scale-in-on-scroll stagger-1 flex flex-col justify-center items-center gap-5 px-[84px] py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-20 h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/themes/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-[264px] min-h-[68px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Row 2 - 3 cards aligned with first 3 cards of Row 1 */}
            <div className="w-[1388px] h-[186px] grid grid-cols-4 gap-6">
              {[
                { text: "Cybersecurity", img: "theme-5.png" },
                { text: "Sustainability", img: "theme-6.png" },
                { text: "Open Innovation", img: "theme-7.png" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="scale-in-on-scroll stagger-1 flex flex-col justify-center items-center gap-5 px-[84px] py-[26px] bg-[#F3F3F3] rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300"
                  style={{ transitionDelay: `${(idx + 4) * 0.1}s` }}
                >
                  <div className="w-20 h-20 bg-[#5425FF] rounded-xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <img
                      src={`/images/themes/${item.img}`}
                      alt=""
                      width={80}
                      height={80}
                      className="w-full h-full rounded-xl object-contain"
                    />
                  </div>
                  <p className="w-[264px] h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-[#6A6A6A]">
                    {item.text}
                  </p>
                </div>
              ))}
              {/* Empty spacer to maintain 4-column grid alignment */}
              <div />
            </div>
          </div>
        </div>

        {/* HOW IT WORKS Frame 57 - Full Width */}
        <div className="fade-in-on-scroll absolute left-0 top-[5650px] w-full h-[592px] flex flex-col items-center gap-8 z-10 relative">
          {/* Floating Cubes - Left Side */}
          <div className="absolute left-[12%] top-[150px] z-30 animate-float pointer-events-none">
            <img src="/images/decoration-1.svg" alt="" width={90} height={90} />
          </div>
          <div
            className="absolute left-[10%] top-[400px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "1.5s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={85} height={85} />
          </div>

          {/* Floating Cubes - Right Side */}
          <div
            className="absolute right-[12%] top-[100px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "0.8s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={95} height={95} />
          </div>
          <div
            className="absolute right-[10%] top-[380px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "2.2s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={88} height={88} />
          </div>

          <div className="w-full h-[112px] flex items-center justify-center gap-[10px] px-[9px] py-[10px] bg-[#24FF00] relative z-10">
            <h2 className="w-[594px] h-[92px] font-silkscreen font-normal text-[72px] leading-[92px] text-center text-[#5425FF]">
              HOW IT WORKS
            </h2>
          </div>

          <div className="w-[731px] h-[448px] flex flex-col gap-4 relative z-10">
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
                className="slide-right-on-scroll stagger-1 w-[731px] h-[100px] flex items-center gap-9 px-[37px] py-[13px] bg-[#E9FEE6] rounded-xl hover:scale-[1.02] hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <p className="w-[37px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
                  {item.step}
                </p>
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-figtree font-semibold text-[28px] leading-[34px] text-black">
                    {item.title}
                  </p>
                  <p className="font-figtree font-semibold text-[20px] leading-[24px] text-[#6A6A6A]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RULES & ELIGIBILITY Frame 56 */}
        <div className="fade-in-on-scroll absolute left-[337.61px] top-[5700px] w-[765px] h-[750px] flex flex-col items-center gap-8 relative">
          {/* Floating Cubes - Left Side */}
          <div className="absolute -left-[160px] top-[50px] z-30 animate-float pointer-events-none">
            <img src="/images/decoration-1.svg" alt="" width={85} height={85} />
          </div>
          <div
            className="absolute -left-[145px] top-[320px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "1.2s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={82} height={82} />
          </div>
          <div
            className="absolute -left-[150px] top-[590px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "2.4s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={88} height={88} />
          </div>

          {/* Floating Cubes - Right Side */}
          <div
            className="absolute -right-[160px] top-[150px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "0.7s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={86} height={86} />
          </div>
          <div
            className="absolute -right-[145px] top-[420px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "1.8s" }}
          >
            <img src="/images/decoration-1.svg" alt="" width={84} height={84} />
          </div>
          <div
            className="absolute -right-[150px] top-[650px] z-30 animate-float pointer-events-none"
            style={{ animationDelay: "3.0s" }}
          >
            <img src="/images/decoration-2.svg" alt="" width={90} height={90} />
          </div>

          <h2 className="w-[765px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF] relative z-20">
            RULES & ELIGIBILITY
          </h2>

          <div className="w-[731px] h-[564px] flex flex-col gap-4 relative z-20">
            {[
              "Team of exactly 4 students",
              "Must be enrolled in any college in India",
              "Only original work allowed",
              "Allowed tech stack: Open-source, Cloud tools, HPC resources",
              "Judging criteria: Innovation | Feasibility | Technical Execution | Presentation",
            ].map((rule, idx) => (
              <div
                key={idx}
                className="slide-left-on-scroll stagger-1 w-[731px] h-[100px] flex items-center gap-9 px-[37px] py-[13px] bg-[#F3F3F3] rounded-xl hover:scale-[1.02] hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <p className="w-[44px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
                  {idx + 1}
                </p>
                <p className="font-figtree font-semibold text-[28px] leading-[34px] text-black flex-1">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          <button className="scale-in-on-scroll flex items-center justify-center px-6 py-3 gap-[10px] w-[183px] h-[48px] bg-[#5425FF] hover:bg-[#4319CC] hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl relative z-20">
            <span className="w-[135px] h-[24px] font-figtree font-medium text-[20px] leading-[24px] text-center text-white">
              View Full Rules
            </span>
          </button>
        </div>

        {/* GALLERY Frame 58 */}
        <div className="fade-in-on-scroll absolute left-[25.61px] top-[7060px] w-[1389px] h-[436px] flex flex-col gap-9">
          <div className="w-[1389px] h-[120px] flex flex-col items-center gap-3">
            <h2 className="w-[1389px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
              GALLERY
            </h2>
            <p className="w-[765px] h-[34px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-black">
              A sneak peek into the vibe
            </p>
          </div>
          <div className="w-[1389px] h-[280px] flex items-center justify-center hover:scale-[1.02] transition-transform duration-500">
            <img
              src="/images/gallery.svg"
              alt="Gallery"
              width={1389}
              height={280}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Registration CTA Frame 65 */}
        <div className="fade-in-on-scroll absolute left-[26.11px] top-[7560px] w-[1388px] h-[440px] overflow-hidden rounded-2xl">
          <img
            src="/images/image.png"
            alt="Registration CTA"
            fill
            quality={100}
            className="object-cover rounded-2xl"
          />
        </div>

        {/* FAQ Frame 59 */}
        <div className="fade-in-on-scroll absolute left-[337.61px] top-[8050px] w-[765px] h-[554px] flex flex-col items-center gap-8">
          <h2 className="w-[765px] h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
            FAQ
          </h2>

          <div className="w-[731px] h-[448px] flex flex-col gap-4">
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
                className="scale-in-on-scroll stagger-1 w-[731px] h-[100px] flex items-center gap-9 px-[37px] py-[13px] bg-[#F3F3F3] rounded-xl hover:scale-[1.02] hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-figtree font-semibold text-[28px] leading-[34px] text-black">
                    {item.q}
                  </p>
                  <p className="font-figtree font-semibold text-[20px] leading-[24px] text-[#6A6A6A]">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Decorative Element */}
        <div
          className="absolute left-[31px] top-[1373.15px] w-[105.27px] h-[121.27px] -rotate-[40.45deg] z-50 animate-float"
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

      {/* Footer Frame 63 */}
      <div className="fade-in-on-scroll absolute left-0 top-[8664px] w-full h-[440px] overflow-hidden">
        <img
          src="/images/footer.png"
          alt="Footer"
          fill
          quality={100}
          className="object-cover"
        />
      </div>

      {/* What's HackOnX Frame 11 - Full Width */}
      <div className="fade-in-on-scroll absolute left-0 top-[1157px] w-full h-[283px] flex flex-col justify-center items-center gap-6 px-[139px] py-12 bg-gradient-to-r from-[#E9E3FF] to-[#E9FFE5] rounded-2xl overflow-hidden">
        <h2 className="w-[486px] h-[61px] font-silkscreen font-normal text-[48px] leading-[61px] text-[#5425FF]">
          What's HackOnX
        </h2>
        <p className="w-[1108px] h-[102px] font-figtree font-semibold text-[28px] leading-[34px] text-center text-black">
          HackOnX is a multi-state offline hackathon bringing together India's
          smartest student builders. Designed around High-Performance Computing,
          it challenges you to solve real-world problems at scale. Learn, build,
          and compete—city by city.
        </p>
      </div>

      {/* In Collaboration With Frame 29 - Full Width */}
      <div className="fade-in-on-scroll absolute left-0 top-[3050px] w-full h-[294px] flex flex-col items-center gap-9">
        <h2 className="w-full h-[74px] font-silkscreen font-normal text-[58px] leading-[74px] text-center text-[#5425FF]">
          IN COLLABORATION WITH
        </h2>
        <div className="w-full max-w-[1390px] h-[184px] flex flex-row flex-wrap justify-center items-center gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="scale-in-on-scroll stagger-1 w-[200px] h-[80px] bg-[#D9D9D9] hover:scale-110 hover:bg-[#C9C9C9] transition-all duration-300 rounded-lg"
              style={{ transitionDelay: `${idx * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
