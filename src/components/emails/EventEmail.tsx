import type * as React from "react";

interface EventEmailProps {
  eventName: string;
  location: string;
  datetime: string;
  details: string;
  schoolName: string;
  optionalMessage?: string;
}

/**
 * Event email template for sharing upcoming events with alumni.
 * Uses a clean, Zinc-palette inspired design with plain React/HTML.
 */
export const EventEmail = ({
  eventName,
  location,
  datetime,
  details,
  schoolName,
  optionalMessage,
}: EventEmailProps) => {
  const mainStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "580px",
  };

  const containerStyle: React.CSSProperties = {
    padding: "0 20px",
  };

  const h1Style: React.CSSProperties = {
    color: "#18181b", // zinc-900
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.25",
    margin: "0 0 12px",
  };

  const subtitleStyle: React.CSSProperties = {
    color: "#71717a", // zinc-500
    fontSize: "18px",
    margin: "0 0 24px",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e4e4e7", // zinc-200
    borderRadius: "8px",
    padding: "24px",
    backgroundColor: "#fafafa", // zinc-50
    marginBottom: "24px",
  };

  const textStyle: React.CSSProperties = {
    color: "#3f3f46", // zinc-700
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "0 0 16px",
  };

  const metaRowStyle: React.CSSProperties = {
    color: "#52525b", // zinc-600
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 8px",
  };

  const footerStyle: React.CSSProperties = {
    color: "#71717a", // zinc-500
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "48px 0 0",
    borderTop: "1px solid #e4e4e7", // zinc-200
    paddingTop: "24px",
  };

  return (
    <div style={mainStyle}>
      <div style={containerStyle}>
        <h1 style={h1Style}>{eventName}</h1>
        <p style={subtitleStyle}>Upcoming Event</p>

        {optionalMessage && (
          <p
            style={{
              ...textStyle,
              marginBottom: "32px",
              whiteSpace: "pre-wrap",
            }}
          >
            {optionalMessage}
          </p>
        )}

        <div style={cardStyle}>
          <p style={metaRowStyle}>
            <strong>Date &amp; Time:</strong> {datetime}
          </p>
          <p style={{ ...metaRowStyle, marginBottom: "16px" }}>
            <strong>Location:</strong> {location}
          </p>
          <p style={{ ...textStyle, marginBottom: "0" }}>{details}</p>
        </div>

        <div style={footerStyle}>
          <p style={{ margin: "0" }}>Shared by,</p>
          <p style={{ margin: "0", fontWeight: "600" }}>{schoolName}</p>
        </div>
      </div>
    </div>
  );
};
