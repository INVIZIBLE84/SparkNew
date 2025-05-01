
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Upload, Search, Filter, Edit, Trash2, KeyRound, Lock, Unlock, Loader2 } from "lucide-react";
import { AuthUser, UserRole } from "@/types/user"; // Use existing user type
import { getUsers, addUser, updateUser, deleteUser, resetPassword, toggleUserLock, importUsers, type AdminUserFilters, type UserUpdateData } from "@/services/admin"; // Import admin service functions
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = React.useState<AuthUser[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filters, setFilters] = React.useState<AdminUserFilters>({});
    const [showUserDialog, setShowUserDialog] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null); // For editing
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Fetch users on mount and filter change
    React.useEffect(() => {
        const fetchUsersData = async () => {
            setIsLoading(true);
            try {
                // TODO: Implement actual getUsers API call with filters
                const fetchedUsers = await getUsers(filters);
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch users." });
            } finally {
                setIsLoading(false);
            }
        };
        // Debounce or add a button to trigger fetch? For now, fetch on filter change.
        const timer = setTimeout(() => fetchUsersData(), 300); // Simple debounce
        return () => clearTimeout(timer);
    }, [filters, toast]);

    const handleFilterChange = (key: keyof AdminUserFilters, value: string | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value === 'all' || value === '' ? undefined : value }));
    };

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const userData: UserUpdateData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as UserRole,
            department: formData.get('department') as string || undefined,
            studentId: formData.get('studentId') as string || undefined,
            facultyId: formData.get('facultyId') as string || undefined,
            // Password handled separately (add or reset)
        };

        try {
            let result;
            if (currentUser) { // Editing existing user
                result = await updateUser(currentUser.id, userData);
            } else { // Adding new user
                 const password = formData.get('password') as string; // Only for new user
                  if (!password) throw new Error("Password is required for new users.");
                 // TODO: Add password confirmation
                 result = await addUser({ ...userData, password });
            }

            if (result.success) {
                toast({ title: "Success", description: result.message });
                setShowUserDialog(false);
                setCurrentUser(null);
                // Refresh user list
                 const fetchedUsers = await getUsers(filters);
                 setUsers(fetchedUsers);
            } else {
                 toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } catch (error: any) {
            console.error("Error submitting user form:", error);
            toast({ variant: "destructive", title: "Operation Failed", description: error.message || "Could not save user." });
        } finally {
            setIsSubmitting(false);
        }
    };

     const handleEdit = (user: AuthUser) => {
        setCurrentUser(user);
        setShowUserDialog(true);
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete user "${userName}" (${userId})? This action cannot be undone.`)) return;
         setIsLoading(true); // Use general loading or specific state
         try {
             const result = await deleteUser(userId);
             if (result.success) {
                 toast({ title: "Success", description: result.message });
                  // Refresh list
                  const fetchedUsers = await getUsers(filters);
                  setUsers(fetchedUsers);
             } else {
                 toast({ variant: "destructive", title: "Error", description: result.message });
             }
         } catch (error: any) {
             console.error("Error deleting user:", error);
             toast({ variant: "destructive", title: "Delete Failed", description: error.message || "Could not delete user." });
         } finally {
            setIsLoading(false);
         }
    };

     const handleResetPassword = async (userId: string, userName: string) => {
         if (!confirm(`Are you sure you want to reset the password for "${userName}" (${userId})?`)) return;
         // Consider using a loading state for the specific action
         try {
             const result = await resetPassword(userId);
             if (result.success) {
                 toast({ title: "Success", description: result.message + (result.newPassword ? ` New password: ${result.newPassword}` : '') });
                 // Optionally show the new password in a more secure way or just confirm reset
             } else {
                 toast({ variant: "destructive", title: "Error", description: result.message });
             }
         } catch (error: any) {
              console.error("Error resetting password:", error);
             toast({ variant: "destructive", title: "Reset Failed", description: error.message || "Could not reset password." });
         }
     };

     const handleToggleLock = async (userId: string, isLocked: boolean) => {
         const actionText = isLocked ? "unlock" : "lock";
         if (!confirm(`Are you sure you want to ${actionText} the account for user ${userId}?`)) return;
         // Consider specific loading state
         try {
             const result = await toggleUserLock(userId, !isLocked); // Send the desired new lock state
             if (result.success) {
                 toast({ title: "Success", description: result.message });
                  // Refresh list
                  const fetchedUsers = await getUsers(filters);
                  setUsers(fetchedUsers);
             } else {
                  toast({ variant: "destructive", title: "Error", description: result.message });
             }
         } catch (error: any) {
              console.error(`Error ${actionText}ing user:`, error);
             toast({ variant: "destructive", title: "Action Failed", description: error.message || `Could not ${actionText} user.` });
         }
     };

      const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
         const file = event.target.files?.[0];
         if (!file) return;

         // Show loading indicator for import
         setIsLoading(true);
         try {
             const result = await importUsers(file);
             if (result.success) {
                 toast({ title: "Import Successful", description: `${result.importedCount} users imported, ${result.skippedCount} skipped.` });
                 // Refresh list
                 const fetchedUsers = await getUsers(filters);
                 setUsers(fetchedUsers);
             } else {
                 toast({ variant: "destructive", title: "Import Failed", description: result.message });
             }
         } catch (error: any) {
             console.error("Error importing users:", error);
             toast({ variant: "destructive", title: "Import Error", description: error.message || "An unexpected error occurred during import." });
         } finally {
            setIsLoading(false);
            // Reset file input
            event.target.value = '';
         }
     };


    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-primary">User Management</h1>
                <div className="flex gap-2">
                     <Button variant="outline" asChild>
                        <Label htmlFor="import-users">
                            <Upload className="mr-2 h-4 w-4" /> Import Users
                             {/* Hidden file input */}
                             <input id="import-users" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="sr-only" onChange={handleImport} />
                         </Label>
                     </Button>
                    <Dialog open={showUserDialog} onOpenChange={(open) => { if (!open) setCurrentUser(null); setShowUserDialog(open); }}>
                        <DialogTrigger asChild>
                            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setCurrentUser(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                             <DialogHeader>
                                <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                                <DialogDescription>{currentUser ? `Update details for ${currentUser.name}` : 'Enter details for the new user.'}</DialogDescription>
                             </DialogHeader>
                             <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                                 {/* Common Fields */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" name="name" defaultValue={currentUser?.name} required className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue={currentUser?.email} required className="col-span-3" />
                                </div>
                                 {!currentUser && ( // Only show password for new users
                                     <div className="grid grid-cols-4 items-center gap-4">
                                         <Label htmlFor="password" className="text-right">Password</Label>
                                         <Input id="password" name="password" type="password" required className="col-span-3" />
                                     </div>
                                      // TODO: Add password confirmation field
                                 )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                     <Label htmlFor="role" className="text-right">Role</Label>
                                    <Select name="role" defaultValue={currentUser?.role} required>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                             {/* TODO: Dynamically list roles */}
                                             <SelectItem value="student">Student</SelectItem>
                                             <SelectItem value="faculty">Faculty</SelectItem>
                                             <SelectItem value="admin">Admin</SelectItem>
                                             <SelectItem value="print_cell">Print Cell</SelectItem>
                                             <SelectItem value="clearance_officer">Clearance Officer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                     <Label htmlFor="department" className="text-right">Department</Label>
                                     <Input id="department" name="department" defaultValue={currentUser?.department} className="col-span-3" />
                                </div>
                                 {/* Role-specific fields */}
                                 {/* TODO: Conditionally render based on selected role */}
                                 <div className="grid grid-cols-4 items-center gap-4">
                                     <Label htmlFor="studentId" className="text-right">Student ID</Label>
                                     <Input id="studentId" name="studentId" defaultValue={currentUser?.studentId} className="col-span-3" placeholder="If student"/>
                                 </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                     <Label htmlFor="facultyId" className="text-right">Faculty ID</Label>
                                     <Input id="facultyId" name="facultyId" defaultValue={currentUser?.facultyId} className="col-span-3" placeholder="If faculty"/>
                                 </div>

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => {setShowUserDialog(false); setCurrentUser(null);}}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                         {currentUser ? 'Save Changes' : 'Add User'}
                                    </Button>
                                </DialogFooter>
                             </form>
                        </DialogContent>
                    </Dialog>
                 </div>
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>User List</CardTitle>
                     <CardDescription>Manage user accounts and access.</CardDescription>
                     {/* Filters */}
                    <div className="flex flex-wrap gap-2 pt-4">
                         <div className="relative flex-grow max-w-xs">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                 type="search"
                                 placeholder="Search Name/Email/ID..."
                                 className="pl-8"
                                 value={filters.searchQuery || ''}
                                 onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                             />
                         </div>
                         <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value as UserRole)}>
                             <SelectTrigger className="w-full sm:w-[180px]">
                                 <Filter className="h-4 w-4 mr-1 text-muted-foreground inline-block"/>
                                 <SelectValue placeholder="Filter by Role" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="all">All Roles</SelectItem>
                                  {/* TODO: Dynamically list roles */}
                                 <SelectItem value="student">Student</SelectItem>
                                 <SelectItem value="faculty">Faculty</SelectItem>
                                 <SelectItem value="admin">Admin</SelectItem>
                                 <SelectItem value="print_cell">Print Cell</SelectItem>
                                 <SelectItem value="clearance_officer">Clearance Officer</SelectItem>
                             </SelectContent>
                         </Select>
                         <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                             <SelectTrigger className="w-full sm:w-[180px]">
                                  <Filter className="h-4 w-4 mr-1 text-muted-foreground inline-block"/>
                                  <SelectValue placeholder="Filter by Status" />
                             </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">All Statuses</SelectItem>
                                 <SelectItem value="active">Active</SelectItem>
                                 <SelectItem value="locked">Locked</SelectItem>
                             </SelectContent>
                         </Select>
                         {/* Add Department Filter if needed */}
                         <Button variant="outline" onClick={() => setFilters({})}>Clear Filters</Button>
                     </div>
                 </CardHeader>
                 <CardContent>
                    <Table>
                         <TableHeader>
                             <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Email</TableHead>
                                <TableHead>Role</TableHead>
                                 <TableHead className="hidden lg:table-cell">Department</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                             {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40 rounded" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                                         <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24 rounded" /></TableCell>
                                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                             ) : users.length > 0 ? (
                                 users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                             {user.studentId && <span className="block text-xs text-muted-foreground">ID: {user.studentId}</span>}
                                             {user.facultyId && <span className="block text-xs text-muted-foreground">ID: {user.facultyId}</span>}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                                        <TableCell className="capitalize">{user.role}</TableCell>
                                         <TableCell className="hidden lg:table-cell text-muted-foreground">{user.department || 'N/A'}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                             {/* @ts-ignore Add isLocked to AuthUser if needed */}
                                             <Badge variant={user.isLocked ? "destructive" : "default"} className={cn(!user.isLocked && "bg-green-100 text-green-800")}>
                                                {/* @ts-ignore */}
                                                 {user.isLocked ? 'Locked' : 'Active'}
                                             </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                     {/* @ts-ignore */}
                                                     <DropdownMenuItem onClick={() => handleToggleLock(user.id, user.isLocked)}>
                                                         {/* @ts-ignore */}
                                                        {user.isLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                                                         {/* @ts-ignore */}
                                                        {user.isLocked ? 'Unlock' : 'Lock'}
                                                     </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.name)}>
                                                         <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                     </DropdownMenuItem>
                                                     <DropdownMenuSeparator />
                                                     <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => handleDelete(user.id, user.name)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                     </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                 ))
                             ) : (
                                 <TableRow>
                                     <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No users found matching filters.</TableCell>
                                 </TableRow>
                             )}
                         </TableBody>
                    </Table>
                    {/* TODO: Add Pagination */}
                 </CardContent>
            </Card>
        </div>
    );
}
