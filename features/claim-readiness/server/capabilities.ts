import type { ActorContext, ClaimReadinessCapability } from "../domain/types";
import { ClaimReadinessError } from "./errors";

export function requireCapability(
  actor: ActorContext,
  capability: ClaimReadinessCapability,
) {
  if (!actor.capabilities.includes(capability)) {
    throw new ClaimReadinessError(
      "forbidden",
      "You do not have permission to perform this claim readiness action.",
    );
  }
}
