// import { Center, Box, Text, Stack } from "@mantine/core";
// import Image from "next/image";

// interface GlobalLoaderProps {
//   text?: string;
//   size?: number;
// }

// export function GlobalLoader({
//   text = "Loading...",
//   size = 80,
// }: GlobalLoaderProps) {
//   return (
//     <Center style={{ width: "100%", height: "100vh" }}>
//       <Stack align="center">
//         <Box
//           style={{
//             position: "relative",
//             width: size,
//             height: size,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {/* Logo stays still in the center */}
//           <Box
//             style={{
//               position: "relative",
//               zIndex: 2, // Ensure logo appears above the spinner
//             }}
//           >
//             <Image
//               src="/images/Kuepass.svg"
//               alt="Kuepass Logo"
//               width={50}
//               height={50}
//               style={{ objectFit: "contain" }}
//             />
//           </Box>

//           {/* Cloudy spinner rotates around the logo */}
//           <Box
//             style={{
//               position: "absolute",
//               top: -10,
//               left: -10,
//               right: -10,
//               bottom: -10,
//               border: "3px solid transparent",
//               borderTopColor: "#025a3a",
//               borderRadius: "50%",
//               animation: "spin 1s linear infinite",
//               filter: "blur(1px)", // Creates cloudy effect
//               opacity: 0.7, // Makes it slightly transparent for cloudier look
//               boxShadow: "0 0 8px rgba(2, 90, 58, 0.4)", // Adds glow effect
//             }}
//           />

//           {/* Second spinner for enhanced cloudy effect */}
//           <Box
//             style={{
//               position: "absolute",
//               top: -5,
//               left: -5,
//               right: -5,
//               bottom: -5,
//               border: "2px solid transparent",
//               borderRightColor: "rgba(2, 90, 58, 0.5)",
//               borderRadius: "50%",
//               animation: "spin-reverse 1.5s linear infinite",
//               filter: "blur(2px)", // More blur for cloudier effect
//               opacity: 0.5,
//             }}
//           />
//         </Box>
//         <Text size="lg" fw={500} color="dimmed">
//           {text}
//         </Text>
//       </Stack>
//     </Center>
//   );
// }
