import { auth } from "@/auth";

export async function requireStoreId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.storeId) {
    throw new Error("Unauthorized");
  }
  return session.user.storeId;
}
