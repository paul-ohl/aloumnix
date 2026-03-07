import type * as React from "react";

interface GeneralEmailProps {
  subject: string;
  message: string;
  schoolName: string;
  portalUrl: string;
}

/**
 * General email template for school-to-alumni communications.
 * Uses a clean, Zinc-palette inspired design with plain React/HTML.
 */
export const GeneralEmail = ({
  subject,
  message,
  schoolName,
  portalUrl,
}: GeneralEmailProps) => {
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
    margin: "0 0 24px",
  };

  const textStyle: React.CSSProperties = {
    color: "#3f3f46", // zinc-700
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "0 0 24px",
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
        <h1 style={h1Style}>{subject}</h1>
        <p style={textStyle}>{message}</p>
        <div style={footerStyle}>
          <p style={{ margin: "0 0 12px" }}>Best regards,</p>
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
