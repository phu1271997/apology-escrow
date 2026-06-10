import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { getOrCreateAccount } from "./wallet";
import { wrapWithSnapsBypass } from "./snapsBypass";

export type WalletMode = "demo" | "metamask";

export function createReadClient() {
  return createClient({
    chain: studionet,
  });
}

export function createDemoClient() {
  const wallet = getOrCreateAccount();
  if (!wallet) throw new Error("Must run in browser");
  
  return createClient({
    chain: studionet,
    account: wallet.account, // Use private key account, bypass provider entirely
  });
}

export async function createMetaMaskClient(address: `0x${string}`) {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not detected");
  }
  
  const ethereum = (window as any).ethereum;
  // Wrap provider with Snaps bypass
  const safeProvider = wrapWithSnapsBypass(ethereum);
  
  return createClient({
    chain: studionet,
    account: address,
    // Note: genlayer-js createClient takes provider as transport or provider depending on spec,
    // let's pass it to both or as provider to match sdk v1.1.8 pattern.
    // Actually, in the user's spec: `provider: safeProvider` is used.
    provider: safeProvider,
  });
}
