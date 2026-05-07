import { useEffect, useState } from "react";
import tabMonitor from "./tabMonitor";

function App() {
  const [switchCount, setSwitchCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [deviceType, setDeviceType] = useState("");
  const [lastEvent, setLastEvent] = useState(null);
  const [debounceActive, setDebounceActive] = useState(false);

  useEffect(() => {
    tabMonitor.init("test-session-001");
    setIsMonitoring(true);
    setDeviceType(tabMonitor.isMobile ? "Mobile" : "Desktop");

    const interval = setInterval(() => {
      setSwitchCount(tabMonitor.switchCount);
      setDebounceActive(tabMonitor.debounceTimer !== null);
    }, 500);

    return () => {
      tabMonitor.stop();
      clearInterval(interval);
    };
  }, []);

  const getRiskLevel = () => {
    if (switchCount === 0) return { label: "No Risk", color: "#e6ffe6" };
    if (switchCount <= 2) return { label: "Low Risk", color: "#fffbe6" };
    if (switchCount <= 5) return { label: "Medium Risk", color: "#fff3e6" };
    return { label: "High Risk", color: "#ffe6e6" };
  };

  const risk = getRiskLevel();

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "700px", margin: "0 auto" }}>

      <h1>AI Assessment System</h1>
      <h3>Tab Switch Detection Module</h3>
      <hr />

      {/* Monitoring Status */}
      <div style={{
        padding: "15px",
        backgroundColor: isMonitoring ? "#e6ffe6" : "#ffe6e6",
        borderRadius: "8px",
        marginBottom: "15px"
      }}>
        <strong>Monitoring Status:</strong>{" "}
        {isMonitoring ? "🟢 Active" : "🔴 Inactive"}
        {"  |  "}
        <strong>Device:</strong> {deviceType === "Mobile" ? "📱 Mobile" : "🖥️ Desktop"}
      </div>

      {/* Debounce Status */}
      <div style={{
        padding: "15px",
        backgroundColor: debounceActive ? "#fff3e6" : "#f0f0f0",
        borderRadius: "8px",
        marginBottom: "15px"
      }}>
        <strong>Debounce Status:</strong>{" "}
        {debounceActive
          ? "⏳ Waiting 2s to confirm switch..."
          : "✅ No pending switch"}
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "gray" }}>
          Accidental switches under 2 seconds are ignored
        </p>
      </div>

      {/* Risk Level */}
      <div style={{
        padding: "15px",
        backgroundColor: risk.color,
        borderRadius: "8px",
        marginBottom: "15px"
      }}>
        <strong>Tab Switches Detected:</strong> {switchCount}
        {"  |  "}
        <strong>Risk Level:</strong> {risk.label}
        {switchCount >= 3 && (
          <p style={{ color: "red", margin: "5px 0 0" }}>
            ⚠️ Warning: Too many tab switches detected!
          </p>
        )}
      </div>

      {/* Output Format */}
      <div style={{
        padding: "15px",
        backgroundColor: "#f8f8f8",
        borderRadius: "8px",
        marginBottom: "15px",
        fontFamily: "monospace",
        fontSize: "13px"
      }}>
        <strong>Current Log Output Format:</strong>
        <pre>{JSON.stringify({
          tab_switched: true,
          timestamp: new Date().toISOString(),
          trigger: "visibility_hidden",
          switch_count: switchCount,
          session_id: "test-session-001",
          device_type: deviceType.toLowerCase()
        }, null, 2)}</pre>
      </div>

      {/* Instructions */}
      <div style={{
        padding: "15px",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        marginBottom: "15px"
      }}>
        <strong>Test Instructions:</strong>
        <ul>
          <li>Switch to another tab and come back <strong>quickly</strong> — should be ignored</li>
          <li>Switch to another tab and <strong>wait 2+ seconds</strong> — should be counted</li>
          <li>Press Alt+Tab and come back after 2+ seconds</li>
          <li>Minimize the window and come back after 2+ seconds</li>
          <li>Check browser console for detailed logs</li>
        </ul>
      </div>

      <p style={{ color: "gray", fontSize: "14px" }}>
        💡 Open browser DevTools (F12) → Console tab to see detailed logs
      </p>

    </div>
  );
}

export default App;