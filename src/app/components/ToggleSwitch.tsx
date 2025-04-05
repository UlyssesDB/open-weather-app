"use client";

interface ToggleSwitchProps {
  isCelsius: boolean;
  onToggle: () => void;
}

export default function ToggleSwitch({
  isCelsius,
  onToggle,
}: ToggleSwitchProps) {
  const containerStyles = {
    backgroundColor: "white",
    opacity: "80%",
    gridColumn: "7 / -1",
    gridRow: "7 / -1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    height: "100%",
    width: "100%",
  };

  const switchStyles = {
    position: "relative",
    display: "inline-block",
    width: "60px",
    height: "34px",
  };

  const sliderStyles = {
    position: "absolute",
    inset: 0,
    cursor: "pointer",
    backgroundColor: "#2196F3",
    transition: ".4s",
    ...(document.activeElement === document.querySelector("input") && {
      boxShadow: "0 0 1px #2196F3",
    }),
  };

  const knobStyles = {
    position: "absolute",
    height: "26px",
    width: "26px",
    left: "4px",
    bottom: "4px",
    backgroundColor: "white",
    transition: ".4s",
    ...(isCelsius && { transform: "translateX(26px)" }),
  };

  const textStyles = (active: boolean) => ({
    color: active ? "#000" : "#666",
    fontWeight: active ? "bold" : "normal",
    textShadow: "0 0 2px rgba(255, 255, 255, 0.8)",
  });

  return (
    <div style={containerStyles}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <p style={textStyles(!isCelsius)}>°F</p>
        <label style={switchStyles}>
          <input
            type="checkbox"
            checked={isCelsius}
            onChange={onToggle} // Call parent toggle function
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={sliderStyles}>
            <span style={knobStyles} />
          </span>
        </label>
        <p style={textStyles(isCelsius)}>°C</p>
      </div>
    </div>
  );
}
