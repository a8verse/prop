import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "ADMIN" | "CHANNEL_PARTNER" | "VISITOR";
    };
  }

  interface User {
    role: "ADMIN" | "CHANNEL_PARTNER" | "VISITOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "CHANNEL_PARTNER" | "VISITOR";
    id: string;
    image?: string | null;
  }
}

