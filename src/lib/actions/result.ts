import { GatewayError } from "@/lib/api/gateway";

/** Result of a Server Action that saves something; rendered next to the Save button. */
export interface ActionResult {
  error?: string;
  success?: string;
}

/** Turns a gateway failure into a message for the user, preferring the first field error. */
export function actionError(error: unknown): ActionResult {
  if (error instanceof GatewayError) {
    const fields = error.body.details?.fields as Record<string, string> | undefined;
    const first = fields ? Object.entries(fields)[0] : undefined;
    return { error: first ? `${first[0]}: ${first[1]}` : error.body.message };
  }
  return { error: "Something went wrong. Please try again." };
}
