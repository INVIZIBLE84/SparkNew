
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { authenticateUser } from "@/services/auth";
import { loginUser, getCurrentUser, UserRole } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component mounts.
    setIsClient(true);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 20, mass: 0.5 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 20, mass: 0.5 });

  const rotateX = useTransform(smoothMouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const authResult = await authenticateUser(username, password);

      if (authResult.success && authResult.user) {
        await loginUser(authResult.user.role);

        toast({
          title: "Login Successful",
          description: `Welcome, ${authResult.user.name}! Redirecting...`,
        });

        await new Promise(res => setTimeout(res, 100));
        const loggedInUser = await getCurrentUser();

        if (loggedInUser) {
            switch (loggedInUser.role) {
                case "student":
                  router.push("/dashboard/student");
                  break;
                case "faculty":
                   router.push("/dashboard/faculty");
                   break;
                 case "clearance_officer":
                   router.push("/clearance");
                   break;
                 case "print_cell":
                   router.push("/documents");
                   break;
                case "admin":
                  router.push("/admin");
                  break;
                default:
                  router.push("/");
            }
        } else {
             setError("Login succeeded but failed to retrieve user data.");
             setIsLoading(false);
        }

      } else {
        setError(authResult.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const renderCard = () => (
    <Card className="w-full max-w-sm shadow-2xl overflow-hidden relative z-20 bg-card/80 backdrop-blur-lg border-primary/20">
        <div className="relative z-10 p-2">
        <CardHeader className="space-y-1 text-center">
            <Image
            src="/sogo.png"
            alt="S.P.A.R.K. sogo"
            data-ai-hint="spark sogo"
            width={219}
            height={55}
            className="mx-auto mb-4 h-auto"
            priority
            />
            <CardTitle className="text-2xl font-bold text-primary">Login</CardTitle>
            <CardDescription>
            Enter your username and password to access your dashboard.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                id="username"
                type="text"
                placeholder="Your unique username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-background/80"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                id="password"
                type="password"
                placeholder="Your secure password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-background/80"
                />
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <LogIn className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
                Forgot your password? Contact Administrator.
            </p>
            </CardFooter>
        </form>
        </div>
    </Card>
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-background overflow-hidden"
         style={{ perspective: "800px" }}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
    >
      {isClient ? (
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative"
        >
          {renderCard()}
           <div
            style={{
              transform: "translateZ(-20px)",
              transformStyle: "preserve-3d",
              background: "conic-gradient(from 180deg at 50% 70%, hsl(var(--glow-color-1)), hsl(var(--glow-color-2)), hsl(var(--glow-color-3)), hsl(var(--glow-color-1)))",
              animation: "rotate 5s linear infinite",
            }}
            className="absolute inset-[-2px] -z-10 rounded-[calc(var(--radius)+2px)] opacity-40 blur-lg"
          />
        </motion.div>
      ) : (
        // Render a non-animated fallback for SSR
        renderCard()
      )}
    </div>
  );
}
