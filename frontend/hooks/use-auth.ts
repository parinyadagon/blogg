import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginValues } from "@/lib/schemas";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  async function login(values: LoginValues) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return false;
      }

      router.push(redirectUrl);
      return true;
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
      return false;
    }
  }

  return { login, isLoading, error };
}
