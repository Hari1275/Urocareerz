// Edge Runtime compatible JWT utilities using Web Crypto API

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

// Generate JWT token using Web Crypto API
export async function generateEdgeToken(
  payload: JWTPayload,
  secret: string
): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60; // 24 hours from now for development

  const finalPayload = {
    ...payload,
    iat: now,
    exp: exp,
  };

  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(finalPayload));

  const data = `${headerB64}.${payloadB64}`;

  // Create HMAC signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return `${data}.${signatureB64}`;
}

// Verify JWT token using Web Crypto API
export async function verifyEdgeToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header and payload
    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64)) as JWTPayload;

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(atob(signatureB64), (c) =>
      c.charCodeAt(0)
    );
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const isValid = await crypto.subtle.verify("HMAC", key, signature, data);

    if (!isValid) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Decode JWT token without verification (for debugging)
export function decodeToken(token: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const [headerB64, payloadB64] = parts;

    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64));

    return { header, payload };
  } catch {
    throw new Error("Invalid token format");
  }
}
