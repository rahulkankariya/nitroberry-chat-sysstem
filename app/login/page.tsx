import { LoginForm } from "../components/features/auth/login-form";


export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020202]">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#7f56d9]/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 right-0 w-100 h-100 bg-[#F2E9FD]/5 blur-[100px] rounded-full" />
      </div>

      {/* Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

      <section className="relative z-10 w-full flex justify-center p-6">
        <LoginForm />
      </section>
    </main>
  );
}