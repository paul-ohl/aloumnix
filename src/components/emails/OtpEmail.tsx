import type * as React from "react";

interface OtpEmailProps {
  code: string;
  alumniName: string;
  expiresInMinutes: number;
}

/**
 * Transactional email template for alumni one-time password login codes.
 * Uses the same Zinc-palette inline-style approach as other email templates.
 */
export const OtpEmail = ({
  code,
  alumniName,
  expiresInMinutes,
}: OtpEmailProps) => {
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
    margin: "0 0 16px",
  };

  const textStyle: React.CSSProperties = {
    color: "#3f3f46", // zinc-700
    fontSize: "16px",
    lineHeight: "1.5",
    margin: "0 0 24px",
  };

  const codeBoxStyle: React.CSSProperties = {
    backgroundColor: "#f4f4f5", // zinc-100
    border: "1px solid #e4e4e7", // zinc-200
    borderRadius: "8px",
    display: "inline-block",
    fontSize: "36px",
    fontWeight: "700",
    letterSpacing: "0.25em",
    color: "#18181b", // zinc-900
    padding: "16px 32px",
    margin: "0 0 24px",
  };

  const noteStyle: React.CSSProperties = {
    color: "#71717a", // zinc-500
    fontSize: "14px",
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

  return (
    <div style={mainStyle}>
      <div style={containerStyle}>
        <h1 style={h1Style}>Your login code</h1>
        <p style={textStyle}>Hi {alumniName},</p>
        <p style={textStyle}>
          Use the code below to sign in to your Aloumnix alumni account. The
          code is valid for {expiresInMinutes} minutes.
        </p>
        <div style={codeBoxStyle}>{code}</div>
        <p style={noteStyle}>
          If you did not request this code, you can safely ignore this email.
        </p>
        <div style={footerStyle}>
          <p style={{ margin: "0" }}>The Aloumnix team</p>
        </div>
      </div>
    </div>
  );
};
