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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box" as const,
    padding: "10px",
    height: "100%",
    width: "auto",
    border: "1px solid rgba(0, 0, 0, 0.1)",
  };

  const switchContainerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "5px",
    padding: "4px 6px",
    borderRadius: "20px",
    backgroundColor: "#f0f0f0",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
    margin: "0 auto",
    width: "auto",
  };

  const switchStyles = {
    position: "relative" as const,
    display: "inline-block",
    width: "40px",
    height: "24px",
  };

  const sliderStyles = {
    position: "absolute" as const,
    inset: 0,
    cursor: "pointer",
    backgroundColor: "#2196F3",
    borderRadius: "34px",
    transition: "all 0.4s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 7px",
  };

  const knobStyles = {
    position: "absolute" as const,
    height: "18px",
    width: "18px",
    left: "3px",
    bottom: "3px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "all 0.4s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    transform: isCelsius ? "translateX(16px)" : "translateX(0)",
  };

  const textStyles = (active: boolean) => ({
    color: active ? "#2196F3" : "#666",
    fontWeight: active ? "bold" : "normal",
    fontSize: "0.9rem",
    userSelect: "none" as const,
  });

  return (
    <div style={containerStyles}>
      <div style={switchContainerStyles}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => !isCelsius && onToggle()}
            style={{
              ...textStyles(!isCelsius),
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: !isCelsius
                ? "rgba(33, 150, 243, 0.1)"
                : "transparent",
            }}
            aria-pressed={!isCelsius}
            aria-label="Switch to Fahrenheit"
          >
            °F
          </button>
        </div>

        <label style={switchStyles}>
          <input
            type="checkbox"
            checked={isCelsius}
            onChange={onToggle}
            style={{ opacity: 0, width: 0, height: 0 }}
            aria-label="Toggle temperature unit"
          />
          <span style={sliderStyles} aria-hidden="true">
            <span
              style={{
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              F
            </span>
            <span
              style={{
                color: "white",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              C
            </span>
            <span style={knobStyles} />
          </span>
        </label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => isCelsius && onToggle()}
            style={{
              ...textStyles(isCelsius),
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor: isCelsius
                ? "rgba(33, 150, 243, 0.1)"
                : "transparent",
            }}
            aria-pressed={isCelsius}
            aria-label="Switch to Celsius"
          >
            °C
          </button>
        </div>
      </div>
    </div>
  );
}
