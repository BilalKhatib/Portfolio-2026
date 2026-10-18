"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: "power3.out" });
// optional elements (e.g. the stats row) may legitimately be absent
gsap.config({ nullTargetWarn: false });

export { gsap, ScrollTrigger, useGSAP };
