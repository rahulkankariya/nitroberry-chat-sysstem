"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "./auth-card";
import { Button } from "../../common/button";
import { Input } from "../../common/Input";
import { authService } from "@/app/api/auth-service";
import { notify } from "@/app/utils/toast";
import { LoginSchema } from "@/app/types/auth";
import { useAuth } from "@/app/context/AuthContext";
// 1. Import icons from lucide-react (standard in most Next.js setups)
import { Eye, EyeOff } from "lucide-react";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  // 2. State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const router = useRouter();
  const { setCurrentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);

    const result = LoginSchema.safeParse(rawData);
    
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: formattedErrors.email?.[0],
        password: formattedErrors.password?.[0],
      });
      return;
    }

    setLoading(true);
    try {
      let res = await authService.login(result.data);
      notify.success(res.message ?? "Login Success");
      setCurrentUser(res?.data?.socketUser);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong";
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Industrial Automation Platform">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Email" 
          name="email" 
          type="email" 
          placeholder="name@nitroberry.com" 
          error={errors.email}
        />
        
        <Input 
          label="Password" 
          name="password" 
          // 3. Toggle the type between 'password' and 'text'
          type={showPassword ? "text" : "password"} 
          placeholder="••••••••" 
          error={errors.password}
          // 4. Add the Toggle Icon as a suffix
          suffix={
            <button
              type="button" // Important: prevents form submission
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-500 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
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