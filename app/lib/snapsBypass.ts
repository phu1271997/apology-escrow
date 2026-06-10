/**
 * Intercepts MetaMask Snaps calls to prevent RPC errors on wallets
 * that do not support Snaps (e.g. Rabby, OKX, older MetaMask, Coinbase Wallet).
 */
export function wrapWithSnapsBypass(provider: any) {
  if (!provider || !provider.request) return provider;
  
  const originalRequest = provider.request.bind(provider);
  
  return new Proxy(provider, {
    get(target, prop, receiver) {
      if (prop === "request") {
        return async (args: { method: string; params?: any[] }) => {
          if (
            args.method === "wallet_getSnaps" ||
            args.method === "wallet_requestSnaps" ||
            args.method === "wallet_invokeSnap"
          ) {
            // Return empty object/array to let genlayer-js fallback gracefully
            return args.method === "wallet_getSnaps" ? {} : [];
          }
          return originalRequest(args);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
