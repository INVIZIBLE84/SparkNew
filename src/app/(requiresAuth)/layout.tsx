"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthUser, getCurrentUser } from "@/types/user";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * A layout component that checks for authentication before rendering children.
 * Redirects to login page if user is not authenticated.
 * Apply this layout to directories containing pages that require login.
 */
export default function RequiresAuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        const checkAuth = async () => {
            setIsCheckingAuth(true);
            const user = await getCurrentUser();
            if (user) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                console.log("Auth check failed in layout, redirecting to /login.");
                router.replace('/login'); // Redirect to login if not authenticated
            }
            setIsCheckingAuth(false);
        };
        checkAuth();
        // Intentionally excluding router to avoid potential infinite loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isCheckingAuth) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Verifying authentication...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // This part might show briefly during the redirect transition.
        // Or if the redirect somehow fails.
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Required</AlertTitle>
                    <AlertDescription>
                        You must be logged in to access this page. Redirecting to login...
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // User is authenticated, render the requested page content
    return <>{children}</>;
}
