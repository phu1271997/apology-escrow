import { createReadClient } from "./genlayerClient";
import { TransactionStatus } from "genlayer-js/types";
import { toast } from "sonner";

// Constant contract address fallback
const DEFAULT_CONTRACT_ADDRESS = "0x9aA9925c9A20f8937c6a23A4Cb1958794d8bfE72";
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS) as `0x${string}`;

export interface CaseData {
  case_id: string;
  offender: string;
  wronged: string;
  charity: string;
  deposit: string;
  grievance: string;
  standard: string;
  deadline: string;
  apology_text: string;
  apology_url: string;
  status: "OPEN" | "SUBMITTED" | "FAILED" | "QUALIFIED" | "RESOLVED";
  attempts: string;
  pass_threshold: string;
}

export interface FeedbackData {
  case_id: string;
  last_score: string;
  last_feedback: string; // JSON string
  last_feedback_parsed?: {
    responsibility: number;
    specificity: number;
    sincerity: number;
    remedy_or_correction: number;
    no_deflection: number;
    missing_elements: string;
    reasoning: string;
  };
}

export async function fetchCase(caseId: string): Promise<CaseData> {
  const readClient = createReadClient();
  const caseJsonStr = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_case",
    args: [caseId],
  });
  if (!caseJsonStr) throw new Error("Empty case data returned");
  return JSON.parse(caseJsonStr as string);
}

export async function fetchFeedback(caseId: string): Promise<FeedbackData> {
  const readClient = createReadClient();
  const feedbackJsonStr = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_feedback",
    args: [caseId],
  });
  if (!feedbackJsonStr) throw new Error("Empty feedback data returned");
  const parsed = JSON.parse(feedbackJsonStr as string) as FeedbackData;
  if (parsed.last_feedback) {
    try {
      parsed.last_feedback_parsed = JSON.parse(parsed.last_feedback);
    } catch {
      // Ignored
    }
  }
  return parsed;
}

export async function fetchWithdrawable(address: string): Promise<string> {
  const readClient = createReadClient();
  const balance = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_withdrawable",
    args: [address],
  });
  return (Number(balance) / 1e18).toString();
}

export async function fetchReputation(address: string): Promise<number> {
  const readClient = createReadClient();
  const score = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_reputation",
    args: [address],
  });
  return Number(score);
}

// Write helper waiting for finalization
async function executeWriteTx(
  getWriteClient: () => any,
  params: { functionName: string; args: any[]; value?: bigint }
): Promise<string> {
  const client = await getWriteClient();
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName: params.functionName,
    args: params.args,
    value: params.value,
  });
  
  // Wait for tx to finalize
  await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
  });
  
  return hash;
}

export async function openCase(
  getWriteClient: () => any,
  data: {
    wronged: string;
    charity: string;
    grievance: string;
    standard: string;
    passThreshold: number;
    deadlineDays: number;
    depositAmount: string; // in GEN
  }
): Promise<string> {
  const depositWei = BigInt(Math.floor(Number(data.depositAmount) * 1e18));
  const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + data.deadlineDays * 24 * 60 * 60);
  
  const hash = await executeWriteTx(getWriteClient, {
    functionName: "open_case",
    args: [
      data.wronged || "0x0000000000000000000000000000000000000000",
      data.charity || "0x0000000000000000000000000000000000000000",
      data.grievance,
      data.standard,
      BigInt(data.passThreshold),
      deadlineTimestamp,
    ],
    value: depositWei,
  });
  return hash;
}

export async function submitApology(
  getWriteClient: () => any,
  data: {
    caseId: string;
    apologyText: string;
    apologyUrl: string;
  }
): Promise<string> {
  const hash = await executeWriteTx(getWriteClient, {
    functionName: "submit_apology",
    args: [data.caseId, data.apologyText, data.apologyUrl],
  });
  return hash;
}

export async function evaluateApology(
  getWriteClient: () => any,
  caseId: string
): Promise<string> {
  const hash = await executeWriteTx(getWriteClient, {
    functionName: "evaluate_apology",
    args: [caseId],
  });
  return hash;
}

export async function claimOnDeadline(
  getWriteClient: () => any,
  caseId: string
): Promise<string> {
  const hash = await executeWriteTx(getWriteClient, {
    functionName: "claim_on_deadline",
    args: [caseId],
  });
  return hash;
}

export async function withdrawFunds(
  getWriteClient: () => any
): Promise<string> {
  const hash = await executeWriteTx(getWriteClient, {
    functionName: "withdraw",
    args: [],
  });
  return hash;
}

export async function disputeQualification(
  getWriteClient: () => any,
  data: {
    caseId: string;
    reason: string;
    stakeAmount: string; // 50% deposit in GEN (string)
  }
): Promise<string> {
  const stakeWei = BigInt(Math.floor(Number(data.stakeAmount) * 1e18));
  const hash = await executeWriteTx(getWriteClient, {
    functionName: "dispute_qualification",
    args: [data.caseId, data.reason],
    value: stakeWei,
  });
  return hash;
}
