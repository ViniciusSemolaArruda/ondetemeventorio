import { useContext } from "react";
import { WebBridgeContext } from "./WebSessionBridge";

export function useWebApi() {
  const ctx = useContext(WebBridgeContext);
  if (!ctx) throw new Error("useWebApi deve ser usado dentro de <WebSessionBridgeProvider>");
  return ctx;
}
