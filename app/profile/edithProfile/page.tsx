"use client";
import React, { useState, useEffect } from "react";
import {
  Flex,
  Stack,
  Card,
  Avatar,
  Text,
  TextInput,
  Button,
  Group,
  Container,
  Alert,
  Divider,
  Box,
  Title,
  SimpleGrid,
} from "@mantine/core";
import {
  IconCheck,
  IconAlertCircle,
  IconUpload,
  IconArrowLeft,
} from "@tabler/icons-react";
import styles from "./styles.module.css";
import Navbar from "@/components/navbar";
import CustomFooter from "@/components/Footer";
import { RootState, updateUser } from "@/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { getAuthToken, setAuthToken } from "@/app/services/auth";

interface User {
  username?: string;
  email?: string;
  phone_number?: string;
  profile_url?: string;
  country?: string;
  currency?: string;
  language?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  country: string;
  currency: string;
  language: string;
}

const EdithProfilePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [imgSrc, setImgSrc] = useState<string>("/default-avatar.png");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const isLogged = useSelector((state: RootState) => state.user.isLogged);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    if (!isLogged || !userInfo) {
      router.push("/auth/signin");
      return;
    }

    const defaultImage = "/default-avatar.png"; // Ensure this exists in public/
    const profileUrl =
      userInfo.profile_url && userInfo.profile_url !== "undefined"
        ? userInfo.profile_url
        : defaultImage;
    setImgSrc(profileUrl);

    // Since `name` is not in the schema, we'll skip splitting it
    setValue("firstName", ""); // Optional: Keep for UI but don't send to API
    setValue("lastName", "");
    setValue("email", userInfo.email || "");
    setValue("phoneNumber", userInfo.phone_number || "");
    setValue("country", userInfo.country || "");
    setValue("currency", userInfo.currency || "");
    setValue("language", userInfo.language || "");
  }, [userInfo, isLogged, router, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImgSrc(e.target.result as string); // For UI preview
      }
    };
    reader.readAsDataURL(file);
    setImgFile(file);
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("No refresh token found");
        setUpdateError("Please log in again.");
        router.push("/auth/signin");
        return false;
      }

      const apiUrl =
        (process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api").replace(/\/$/, "");
      const response = await fetch(`${apiUrl}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error("Failed to refresh token:", await response.text());
        setUpdateError("Session expired. Please log in again.");
        router.push("/auth/signin");
        return false;
      }

      const data = await response.json();
      setAuthToken(data.access);
      localStorage.setItem("authToken", data.access);
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      setUpdateError("Authentication error. Please log in again.");
      router.push("/auth/signin");
      return false;
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      if (!userInfo) {
        setUpdateError("User information not available. Please log in again.");
        return;
      }

      // Construct payload based on schema
      const updatedUserData: Partial<User> = {
        phone_number: data.phoneNumber || null,
        country: data.country || undefined,
        currency: data.currency || undefined,
        language: data.language || undefined,
      };

      if (imgFile) {
        setUploading(true);
        try {
          const isLocalDev =
            process.env.NODE_ENV === "development" ||
            window.location.hostname === "localhost";
          if (isLocalDev) {
            console.warn(
              "In development mode, profile_url will not be updated. Upload to server in production."
            );
          } else {
            const formData = new FormData();
            formData.append("file", imgFile);
            const token = getAuthToken();
            const apiUrl =
              (process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api").replace(/\/$/, "");

            const imageResponse = await fetch(`${apiUrl}/upload/image`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });

            if (!imageResponse.ok) {
              console.error("Image upload failed:", await imageResponse.text());
            } else {
              const imageData = await imageResponse.json();
              updatedUserData.profile_url = imageData.url; // Must be a valid URI
            }
          }
        } catch (error) {
          console.error("Image upload error:", error);
        } finally {
          setUploading(false);
        }
      }

      // Construct payload for PATCH /users/update_profile/
      const profileUpdateData: Partial<User> = {
        phone_number: updatedUserData.phone_number,
        country: updatedUserData.country,
        currency: updatedUserData.currency,
        language: updatedUserData.language,
      };
      if (updatedUserData.profile_url) {
        profileUpdateData.profile_url = updatedUserData.profile_url;
      }

      let token = getAuthToken();
      if (!token) {
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          throw new Error("Authentication expired. Please log in again.");
        }
        token = getAuthToken();
      }

      const apiUrl =
        (process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api").replace(/\/$/, "");
      const updateProfileUrl = `${apiUrl}/users/update_profile/`;

      let response = await fetch(updateProfileUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileUpdateData),
      });

      if (response.status === 401) {
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          throw new Error("Your session has expired. Please log in again.");
        }
        token = getAuthToken();
        const retryResponse = await fetch(updateProfileUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileUpdateData),
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          console.error("API error details:", {
            status: retryResponse.status,
            statusText: retryResponse.statusText,
            errorData,
          });
          throw new Error(
            errorData?.detail ||
              `Failed to update profile. Server returned status: ${retryResponse.status}`
          );
        }
        response = retryResponse;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error details:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData?.detail ||
            `Failed to update profile. Server returned status: ${response.status}`
        );
      }

      const responseData = await response.json();
      const updatedUserInfo = {
        ...userInfo,
        ...updatedUserData,
        profile_url:
          responseData.profile_url ||
          updatedUserData.profile_url ||
          userInfo.profile_url ||
          "/default-avatar.png",
      };

      dispatch(updateUser(updatedUserInfo));
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      setUpdateSuccess(true);

      setTimeout(() => {
        router.push("/profile/profile");
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Stack
      gap={0}
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f5f7",
      }}
    >
      <Navbar alwaysDark />
      
      <Flex style={{ flex: 1, width: "100%", paddingTop: "80px", justifyContent: "center", paddingBottom: "60px" }}>
        <Container size="md" style={{ width: "100%" }}>
          <Box mb={32}>
            <Title order={2} style={{ fontSize: "1.8rem", color: "#111827" }}>Edit Profile</Title>
            <Text c="dimmed">Update your personal details, profile photo, and regional preferences.</Text>
          </Box>

          <Card radius="md" p="xl" withBorder style={{ backgroundColor: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
            {updateSuccess && (
              <Alert icon={<IconCheck size={16} />} title="Success" color="teal" mb="xl">
                Profile updated successfully! Redirecting...
              </Alert>
            )}
            {updateError && (
              <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="xl">
                {updateError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Profile Image Section */}
              <Group align="flex-start" mb="xl" gap="xl">
                <Avatar
                  src={imgSrc}
                  size={100}
                  radius={100}
                  style={{ border: "1px solid #e2e8f0" }}
                  imageProps={{ onError: () => setImgSrc("/default-avatar.png") }}
                />
                <Stack gap={8} justify="center" style={{ height: "100px" }}>
                  <Text fw={500}>Profile Photo</Text>
                  <Text size="sm" c="dimmed">This will be displayed on your profile.</Text>
                  <Button
                    component="label"
                    htmlFor="imageUpload"
                    variant="light"
                    color="teal"
                    size="xs"
                    radius="md"
                    leftSection={<IconUpload size={14} />}
                    loading={uploading}
                    style={{ width: "fit-content" }}
                  >
                    {uploading ? "Uploading..." : "Change Picture"}
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </Button>
                </Stack>
              </Group>

              <Divider mb="xl" />

              {/* Personal Details Section */}
              <Title order={4} mb="md" style={{ color: "#111827" }}>Personal details</Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
                <TextInput
                  label={<Text fw={500} size="sm" mb={4}>Phone Number</Text>}
                  placeholder="Enter phone number"
                  size="md"
                  maxLength={20}
                  {...register("phoneNumber")}
                  error={errors.phoneNumber?.message}
                />
                <TextInput
                  label={<Text fw={500} size="sm" mb={4}>Email Address</Text>}
                  placeholder="Your email"
                  readOnly
                  size="md"
                  styles={{ input: { backgroundColor: '#f8fafc', color: '#64748b' } }}
                  {...register("email", {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                  error={errors.email?.message}
                />
                <TextInput
                  label={<Text fw={500} size="sm" mb={4}>Country</Text>}
                  placeholder="Enter your country"
                  size="md"
                  maxLength={100}
                  {...register("country")}
                />
                <TextInput
                  label={<Text fw={500} size="sm" mb={4}>Currency</Text>}
                  placeholder="e.g., USD, EUR"
                  size="md"
                  maxLength={10}
                  {...register("currency")}
                />
                <TextInput
                  label={<Text fw={500} size="sm" mb={4}>Language</Text>}
                  placeholder="e.g., en, fr"
                  size="md"
                  maxLength={20}
                  {...register("language")}
                />
              </SimpleGrid>

              <Divider mb="xl" />

              <Group justify="flex-end" gap="md">
                <Button
                  component={Link}
                  href="/profile/profile"
                  variant="subtle"
                  color="gray"
                  size="md"
                  radius="md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  color="teal"
                  size="md"
                  radius="md"
                  loading={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </Group>
            </form>
          </Card>
        </Container>
      </Flex>
      <Box mt="auto">
        <CustomFooter />
      </Box>
    </Stack>
  );
};

export default EdithProfilePage;
