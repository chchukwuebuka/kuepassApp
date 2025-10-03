// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { Stack, Text, Button } from "@mantine/core";

// export default function TestRedirectPage() {
//   const searchParams = useSearchParams();
//   const [currentUrl, setCurrentUrl] = useState("");

//   useEffect(() => {
//     setCurrentUrl(window.location.href);
//   }, []);

//   const userId = searchParams.get("userId");

//   const handleRedirect = () => {
//     if (userId) {
//       window.location.href = `/user/${userId}`;
//     }
//   };

//   return (
//     <Stack style={{ padding: "2rem" }}>
//       <Text size="xl" fw="bold">
//         Test Redirect Page
//       </Text>
//       <Text>Current URL: {currentUrl}</Text>
//       <Text>User ID from searchParams: {userId || "Not found"}</Text>
//       <Text>All search params: {searchParams.toString()}</Text>

//       {userId && (
//         <Button onClick={handleRedirect} color="green">
//           Redirect to User Profile: {userId}
//         </Button>
//       )}

//       <Button onClick={() => (window.location.href = "/")} color="blue">
//         Go to Home
//       </Button>
//     </Stack>
//   );
// }
