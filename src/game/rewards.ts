export type RewardOutcome = "completed" | "unavailable" | "technical-failure" | "cancelled";
/** Native AdMob is not provisioned. The browser adapter reports unavailability truthfully. */
export async function browserReward(): Promise<RewardOutcome> { return "unavailable"; }
export function rewardGranted(outcome: RewardOutcome) { return outcome === "completed" || outcome === "unavailable" || outcome === "technical-failure"; }
/** One action token can never be granted twice, even if an SDK sends duplicate callbacks. */
export function rewardOnce(grant: () => Promise<void>) { let settled = false;
  return async (outcome: RewardOutcome) => { if (settled) return; settled = true; if (rewardGranted(outcome)) await grant(); };
}
