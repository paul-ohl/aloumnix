import type * as React from "react";

interface JobEmailProps {
  jobTitle: string;
  companyName: string;
  location: string;
  description: string;
  applyUrl: string;
  schoolName: string;
  optionalMessage?: string;
  portalUrl: string;
}

/**
 * Job email template for sharing career opportunities with alumni.
 * Uses a clean, Zinc-palette inspired design with plain React/HTML.
 */
export const JobEmail = ({
  jobTitle,
  companyName,
  location,
  description,
  applyUrl,
  schoolName,
  optionalMessage,
  portalUrl,
}: JobEmailProps) => {
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
    margin: "0 0 24px",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#18181b", // zinc-900
    borderRadius: "6px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1",
    padding: "12px 24px",
    textDecoration: "none",
    textAlign: "center",
  };

  const footerStyle: React.CSSProperties = {
    color: "#71717a", // zinc-500
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "48px 0 0",
    borderTop: "1px solid #e4e4e7", // zinc-200
    paddingTop: "24px",
  };

  const portalLinkStyle: React.CSSProperties = {
    color: "#18181b", // zinc-900
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
  };

  return (
    <div style={mainStyle}>
      <div style={containerStyle}>
        <h1 style={h1Style}>{jobTitle}</h1>
        <p style={subtitleStyle}>
          {companyName} • {location}
        </p>

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
          <p style={textStyle}>{description}</p>
          <a href={applyUrl} style={buttonStyle}>
            View Opportunity
          </a>
        </div>

        <div style={footerStyle}>
          <p style={{ margin: "0 0 12px" }}>Shared by,</p>
          <p style={{ margin: "0 0 16px", fontWeight: "600" }}>{schoolName}</p>
          <p style={{ margin: "0", color: "#71717a", fontSize: "13px" }}>
            <a href={portalUrl} style={portalLinkStyle}>
              Log in to the alumni portal →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
