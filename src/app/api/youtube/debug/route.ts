import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  return Response.json({
    authenticated: !!session,
    hasAccessToken: !!session?.accessToken,
    accessTokenPrefix: session?.accessToken
      ? session.accessToken.substring(0, 10) + "..."
      : null,
    hasError: !!session?.error,
    sessionError: session?.error || null,
    user: session?.user
      ? {
          name: session.user.name,
          email: session.user.email,
        }
      : null,
  });
}
