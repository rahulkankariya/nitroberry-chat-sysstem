"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "./auth-card";
import { Button } from "../../common/button";
import { Input } from "../../common/Input";
import { authService } from "@/app/api/auth-service";
import { notify } from "@/app/utils/toast";
import { LoginSchema } from "@/app/types/auth";


export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);

    // 1. Validation Logic
    const result = LoginSchema.safeParse(rawData);
    
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: formattedErrors.email?.[0],
        password: formattedErrors.password?.[0],
      });
      return;
    }

    // 2. API Calling Logic
    setLoading(true);
    try {
     let res =  await authService.login(result.data);

      notify.success(res.message?? "Login Sucess");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Somtething went wrong";
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Industrial Automation Platform">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="email" 
          name="email" 
          type="email" 
          placeholder="name@nitroberry.com" 
          error={errors.email}

        />
        
        <Input 
          label="Password" 
          name="password" 
          type="password" 
          placeholder="••••••••" 
          error={errors.password}
     
        />

        <div className="pt-2">
          <Button type="submit" isLoading={loading}>
            Sign In
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};