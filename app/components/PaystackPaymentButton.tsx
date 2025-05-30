// "use client";

// import { usePaystackPayment, PaystackProps as ReactPaystackProps } from 'react-paystack'; // Try importing PaystackProps
// import { Loader, Button } from '@mantine/core';
// import { useEffect, useMemo } from 'react';

// // If PaystackProps cannot be imported, use our custom one.
// // Otherwise, ReactPaystackProps might be more accurate if available.
// interface CustomPaystackConfig {
//   publicKey: string;
//   email: string;
//   amount: number; // Amount in Kobo
//   reference: string;
//   currency?: string;
//   metadata?: {
//     [key: string]: any;
//     custom_fields?: Array<{
//       display_name: string;
//       variable_name: string;
//       value: string | number;
//     }>;
//   };
//   // react-paystack might also accept other Paystack standard options here
// }

// interface PaystackHookResponse {
//   reference: string;
// }

// interface PaystackPaymentButtonProps {
//   // This config prop should now be the complete configuration for Paystack
//   config: CustomPaystackConfig; 
//   onSuccess: (response: PaystackHookResponse) => void;
//   onClose: () => void;
//   setPaymentLoading: (loading: boolean) => void;
//   className?: string;
//   buttonText?: string;
//   triggerAutomatically?: boolean;
// }

// export default function PaystackPaymentButton({
//   config, // This config now contains email, amount, reference, metadata etc.
//   onSuccess,
//   onClose,
//   setPaymentLoading,
//   className,
//   buttonText = "Pay with Paystack",
//   triggerAutomatically = false,
// }: PaystackPaymentButtonProps) {

//   // Memoize the full config to pass to the hook.
//   // This ensures the hook only re-initializes if these critical props change.
//   const memoizedConfig = useMemo(() => {
//     // Ensure basic requirements are met before creating the config for the hook
//     if (!config.publicKey || !config.email || !config.amount || !config.reference) {
//         console.warn("PaystackPaymentButton: Incomplete base config for usePaystackPayment hook.", config);
//         // Return a minimal valid config or handle error appropriately
//         // For now, let's proceed, but the hook might fail if essential parts are missing.
//     }
//     return {
//       publicKey: String(config.publicKey),
//       email: String(config.email),
//       amount: Number(config.amount), // Already in Kobo
//       reference: String(config.reference),
//       currency: config.currency || "NGN",
//       metadata: config.metadata || {}, // Use provided metadata or default to empty
//       // Do NOT include onSuccess or onClose here; they are passed to the function returned by the hook
//     };
//   }, [config.publicKey, config.email, config.amount, config.reference, config.currency, config.metadata]);


//   // The usePaystackPayment hook is initialized with the full configuration.
//   const initializePayment = usePaystackPayment(memoizedConfig as ReactPaystackProps); // Cast if using ReactPaystackProps

//   const handlePayment = () => {
//     console.log("PaystackPaymentButton: handlePayment triggered.");
//     setPaymentLoading(true); 

//     console.log("PaystackPaymentButton: Config used by hook (memoizedConfig):", JSON.stringify(memoizedConfig, null, 2));
    
//     // Pre-flight checks based on memoizedConfig
//     if (!memoizedConfig.publicKey) {
//         console.error("PaystackPaymentButton: ERROR - publicKey is missing.");
//         alert("Paystack configuration error (publicKey).");
//         setPaymentLoading(false); return;
//     }
//     if (!memoizedConfig.email) {
//         console.error("PaystackPaymentButton: ERROR - email is missing.");
//         alert("Customer email is missing for payment.");
//         setPaymentLoading(false); return;
//     }
//     if (memoizedConfig.amount <= 0) {
//         console.error("PaystackPaymentButton: ERROR - amount is zero or less:", memoizedConfig.amount);
//         alert("Payment amount is invalid.");
//         setPaymentLoading(false); return;
//     }
//     if (!memoizedConfig.reference) {
//         console.error("PaystackPaymentButton: ERROR - reference is missing.");
//         alert("Transaction reference is missing.");
//         setPaymentLoading(false); return;
//     }

//     try {
//         // Call initializePayment with ONLY onSuccess and onClose callbacks
//         initializePayment(onSuccess, onClose);
//     } catch (error: any) {
//         console.error("PaystackPaymentButton: DETAILED ERROR calling initializePayment -", error);
//         if (error && error.issues) {
//             console.error("PaystackPaymentButton: Detailed issues from Paystack:", JSON.stringify(error.issues, null, 2));
//         }
//         alert(`Error initializing payment: ${error.message || 'Unknown error'}. See console for details.`);
//         setPaymentLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (triggerAutomatically && config.publicKey && config.email && config.amount > 0 && config.reference) {
//       console.log("PaystackPaymentButton: Triggering payment automatically because config is ready.");
//       handlePayment();
//     } else if (triggerAutomatically) {
//         console.warn("PaystackPaymentButton: Auto-trigger requested, but essential config props are missing.");
//     }
//   }, [triggerAutomatically, config.publicKey, config.email, config.amount, config.reference]); // Re-evaluate if these change


//   if (triggerAutomatically) {
//     // If auto-triggering, this component might just be logical and not render a button.
//     // The parent handles the visual loading state.
//     return null; 
//   }

//   // This button is for manual click if triggerAutomatically is false
//   return (
//     <Button
//       className={className}
//       onClick={handlePayment}
//       disabled={false} 
//       title={buttonText}
//     >
//       {buttonText}
//     </Button>
//   );
// }