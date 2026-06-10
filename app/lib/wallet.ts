import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const STORAGE_KEY = "apology_escrow_pk";

export function getOrCreateAccount() {
  if (typeof window === "undefined") return null;
  
  let pk = localStorage.getItem(STORAGE_KEY);
  if (!pk) {
    pk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, pk);
  }
  
  try {
    const account = privateKeyToAccount(pk as `0x${string}`);
    return { account, privateKey: pk };
  } catch {
    // Corrupt key — regenerate
    const newPk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, newPk);
    const account = privateKeyToAccount(newPk as `0x${string}`);
    return { account, privateKey: newPk };
  }
}
