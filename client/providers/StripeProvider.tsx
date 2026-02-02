import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { apiRequest } from "@/lib/query-client";

interface StripeProviderProps {
  children: React.ReactNode;
}

const isExpoGo = Constants.appOwnership === "expo";

export function StripeProvider({ children }: StripeProviderProps) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [StripeNativeProvider, setStripeNativeProvider] =
    useState<React.ComponentType<any> | null>(null);
  const [stripeAvailable, setStripeAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" && !isExpoGo) {
      loadStripe();
    }
  }, []);

  const loadStripe = async () => {
    try {
      const { StripeProvider: NativeStripeProvider } = await import(
        "@stripe/stripe-react-native"
      );
      setStripeNativeProvider(() => NativeStripeProvider);
      setStripeAvailable(true);

      const response = await apiRequest("GET", "/api/stripe/publishable-key");
      const data = await response.json();
      setPublishableKey(data.publishableKey);
    } catch (error) {
      console.log("Stripe native not available in this environment");
      setStripeAvailable(false);
    }
  };

  if (
    Platform.OS === "web" ||
    isExpoGo ||
    !stripeAvailable ||
    !publishableKey ||
    !StripeNativeProvider
  ) {
    return <>{children}</>;
  }

  return (
    <StripeNativeProvider publishableKey={publishableKey}>
      {children}
    </StripeNativeProvider>
  );
}
