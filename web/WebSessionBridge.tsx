import React, { createContext, useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

type LikeResult = { liked: boolean; count: number };
type BridgeContextType = {
  openLogin: () => void;
  closeLogin: () => void;
  isLoginOpen: boolean;
  likeEvent: (id: string) => Promise<LikeResult>;
  checkSession: () => Promise<{ authenticated: boolean }>;
};

export const WebBridgeContext = createContext<BridgeContextType | null>(null);

const ORIGIN = "https://ondetemeventorio.vercel.app";

export const WebSessionBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const webRef = useRef<WebView>(null);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const resolvers = useRef<Record<string, (v: any) => void>>({});
  const rejecters = useRef<Record<string, (e: any) => void>>({});

  const uuid = () => Math.random().toString(36).slice(2);
  const inject = (js: string) => webRef.current?.injectJavaScript(js + "\ntrue;");

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      const resolve = resolvers.current[msg.id];
      const reject = rejecters.current[msg.id];
      if (!resolve && !reject) return;
      if (msg.ok) resolve?.(msg.payload);
      else reject?.(msg.error ?? "Erro");
      delete resolvers.current[msg.id];
      delete rejecters.current[msg.id];
    } catch {}
  };

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const checkSession = useCallback(() => {
    return new Promise<{ authenticated: boolean }>((resolve, reject) => {
      const id = uuid();
      resolvers.current[id] = resolve as any;
      rejecters.current[id] = reject;
      inject(`
        (async function(){
          try{
            const res = await fetch('${ORIGIN}/api/auth/session', { credentials: 'include' });
            const data = await res.json();
            const authenticated = !!(data && data.user && data.user.email);
            window.ReactNativeWebView.postMessage(JSON.stringify({ id: '${id}', ok: true, payload: { authenticated } }));
          }catch(err){
            window.ReactNativeWebView.postMessage(JSON.stringify({ id: '${id}', ok: false, error: String(err) }));
          }
        })();
      `);
    });
  }, []);

  const likeEvent = useCallback((eventId: string) => {
    return new Promise<LikeResult>((resolve, reject) => {
      const id = uuid();
      resolvers.current[id] = resolve;
      rejecters.current[id] = reject;
      inject(`
        (async function(){
          try{
            const res = await fetch('${ORIGIN}/api/events/${eventId}/like', {
              method:'POST',
              credentials:'include',
              headers:{'Content-Type':'application/json'}
            });
            const payload = await res.json();
            window.ReactNativeWebView.postMessage(JSON.stringify({ id: '${id}', ok: ${true}, payload, status: res.status }));
          }catch(err){
            window.ReactNativeWebView.postMessage(JSON.stringify({ id: '${id}', ok: false, error: String(err) }));
          }
        })();
      `);
    });
  }, []);

  const ctx = useMemo(() => ({ openLogin, closeLogin, isLoginOpen, likeEvent, checkSession }), [openLogin, closeLogin, isLoginOpen, likeEvent, checkSession]);

  return (
    <WebBridgeContext.Provider value={ctx}>
      {/* WebView oculta para manter sessão e fazer fetch com cookies */}
      <WebView
        ref={webRef}
        source={{ uri: ORIGIN }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        style={{ width: 0, height: 0, opacity: 0 }}
      />
      {/* Modal de login (NextAuth) */}
      <Modal visible={isLoginOpen} animationType="slide" onRequestClose={closeLogin}>
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: `${ORIGIN}/api/auth/signin` }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}><ActivityIndicator /></View>
            )}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
          />
        </View>
      </Modal>
      {children}
    </WebBridgeContext.Provider>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
