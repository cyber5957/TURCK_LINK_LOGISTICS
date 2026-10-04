import { LandingPageFrame } from "./shaders/landing-pages/LandingPageFrame";
import "./kage-landing-page.css";

/** The authored Kage world sits behind TruckLink's logistics experience. */
export default function KageLandingPage() {
  return (
    <LandingPageFrame
      className="kage-scene-background"
      sourceUrl="/landing-pages/kage.html"
      title="Kage temple world background"
      backgroundCanvasSelector="#gl"
      backgroundVisualSelector="#vignette, #grain, #fg-sky"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        width: "100vw",
        height: "100vh",
        opacity: 0.7,
        pointerEvents: "none",
      }}
    />
  );
}
