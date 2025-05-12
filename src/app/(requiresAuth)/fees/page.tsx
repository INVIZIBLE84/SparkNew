"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, AlertTriangle, Download, PlusCircle, Edit, Loader2, Search, Filter, Upload } from "lucide-react"; // Added Upload and Download
import {
    getFeeDetails,
    getFeePayments,
    getAllFeeDetails, // For admin
    addFeePayment, // For admin
    importFeeDataFromFile, // New import function
    exportFeeDataToCSV, // New export function
    type FeeDetails,
    type FeePayment,
    type FeeBreakdownItem,
    type FeeFilters
} from "@/services/fee-management";
import { AuthUser, getCurrentUser, UserRole } from "@/types/user";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // For Add Payment Modal
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';


export default function FeesPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<FeePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin specific state
  const [allFeeDetails, setAllFeeDetails] = useState<FeeDetails[]>([]);
  const [isAdminView, setIsAdminView] = useState(false);
  const [filters, setFilters] = useState<FeeFilters>({});
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<string | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = React.useState(false); // Control dialog
  const [isImportingFees, setIsImportingFees] = React.useState(false);
  const [isExportingFees, setIsExportingFees] = React.useState(false);


  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (!currentUser) {
        // Handled by layout, set state for consistency
        setError("User not authenticated.");
        setIsLoading(false);
        return;
      }

      setIsAdminView(currentUser.role === 'admin');

      try {
        if (currentUser.role === 'student') {
          const details = await getFeeDetails(currentUser.id);
          const history = await getFeePayments(currentUser.id);
          setFeeDetails(details);
          setPaymentHistory(history);
        } else if (currentUser.role === 'admin') {
          // Fetch initial list for admin
          const allDetails = await getAllFeeDetails(filters);
          setAllFeeDetails(allDetails);
           // Also fetch details for the admin user themselves if needed? Optional.
            // const adminOwnDetails = await getFeeDetails(currentUser.id);
            // setFeeDetails(adminOwnDetails);
        } else {
            // Faculty view - might show summary or nothing, depending on requirements
             // Students and Admins are primary users here
            // setError("Faculty view for fees is not currently implemented.");
        }
      } catch (err) {
        console.error("Error fetching fee data:", err);
        setError("Failed to load fee information. Please try again.");
        toast({ variant: "destructive", title: "Error", description: "Could not fetch fee data." });
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

   // --- Admin: Handle Filter Changes ---
  const handleFilterChange = (key: keyof FeeFilters, value: string | undefined) => {
      setFilters(prev => ({ ...prev, [key]: value }));
  };

  // --- Admin: Fetch data based on filters ---
   useEffect(() => {
        if (isAdminView) {
            const fetchAdminData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const allDetails = await getAllFeeDetails(filters);
                    setAllFeeDetails(allDetails);
                } catch (err) {
                    console.error("Error fetching filtered admin fee data:", err);
                    setError("Failed to load filtered fee information.");
                    toast({ variant: "destructive", title: "Error", description: "Could not fetch filtered fee data." });
                } finally {
                    setIsLoading(false);
                }
            };
            // Debounce or add a button to trigger fetch? For now, fetch on filter change.
            const timer = setTimeout(() => fetchAdminData(), 300); // Simple debounce
             return () => clearTimeout(timer);
        }
    }, [filters, isAdminView, toast]); // Re-fetch when filters change


   // --- Admin: Handle Add Payment ---
   const handleAddPaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedStudentForPayment || !user || user.role !== 'admin') return;

        const formData = new FormData(event.currentTarget);
        const amount = parseFloat(formData.get('amount') as string);
        const paymentDate = formData.get('paymentDate') as string;
        const method = formData.get('method') as string;
        const transactionId = formData.get('transactionId') as string || undefined;

        if (isNaN(amount) || amount <= 0) {
             toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid positive amount." });
             return;
        }
        if (!paymentDate) {
            toast({ variant: "destructive", title: "Invalid Date", description: "Please select a payment date." });
            return;
        }

        setIsAddingPayment(true);
        try {
            const result = await addFeePayment(selectedStudentForPayment, { amount, paymentDate, method, transactionId }, user.id);
            if (result.success && result.payment) {
                toast({ title: "Success", description: result.message });
                // Update the specific student's details in the admin list (or re-fetch all)
                 setAllFeeDetails(prev => prev.map(fd => {
                    if (fd.studentId === selectedStudentForPayment) {
                        const newTotalPaid = fd.totalPaid + result.payment!.amount;
                        const newBalanceDue = fd.totalDue - newTotalPaid;
                        let newStatus: FeeDetails['status'] = 'Unpaid';
                         if (newBalanceDue <= 0) newStatus = 'Paid';
                         else if (newTotalPaid > 0) newStatus = 'Partially Paid';
                        return { ...fd, totalPaid: newTotalPaid, balanceDue: newBalanceDue, status: newStatus };
                    }
                    return fd;
                 }));
                 setShowAddPaymentDialog(false); // Close the dialog
                 setSelectedStudentForPayment(null); // Reset selected student
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } catch (err) {
             console.error("Error adding payment:", err);
             toast({ variant: "destructive", title: "Error", description: "Could not add payment." });
        } finally {
            setIsAddingPayment(false);
        }
   };

   const handleFeeDataImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || user.role !== 'admin') return;
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImportingFees(true);
        try {
            const result = await importFeeDataFromFile(file, user.id);
            if (result.success) {
                toast({
                    title: "Import Successful",
                    description: result.message,
                });
                // Refresh the list of all fee details
                const updatedDetails = await getAllFeeDetails(filters);
                setAllFeeDetails(updatedDetails);
            } else {
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: result.message,
                });
            }
        } catch (err: any) {
            console.error("Error importing fee data:", err);
            toast({
                variant: "destructive",
                title: "Import Error",
                description: err.message || "An unexpected error occurred during import.",
            });
        } finally {
            setIsImportingFees(false);
            event.target.value = ''; // Reset file input to allow re-upload of same file
        }
    };

    const handleExportFeeData = async () => {
        if (!user || user.role !== 'admin') return;
        setIsExportingFees(true);
        toast({ title: "Exporting...", description: "Generating fee data CSV." });
        try {
            const csvData = await exportFeeDataToCSV(filters);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
                link.setAttribute("download", `fee_data_export_${timestamp}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ title: "Success", description: "Fee data CSV exported." });
            } else {
                toast({ variant: "destructive", title: "Export Failed", description: "Browser does not support automatic downloads." });
            }
        } catch (err: any) {
            console.error("Error exporting fee data:", err);
            toast({ variant: "destructive", title: "Export Error", description: err.message || "Could not export fee data." });
        } finally {
            setIsExportingFees(false);
        }
    };


  // --- Loading / Error States ---
  if (isLoading && (!feeDetails && !isAdminView || isAdminView && !allFeeDetails.length)) {
    return <FeeSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Fee Management</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

   // --- Get Status Style Helper ---
    const getStatusStyle = (status: FeeDetails['status']): { variant: "default" | "secondary" | "destructive" | "outline", className: string } => {
        switch (status) {
            case 'Paid': return { variant: 'default', className: 'bg-green-100 text-green-800 border-green-300' };
            case 'Unpaid': return { variant: 'destructive', className: 'bg-red-100 text-red-800 border-red-300' };
            case 'Partially Paid': return { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
            default: return { variant: 'outline', className: '' };
        }
    };

    const statusIcon = (status: FeeDetails['status']) => {
        switch(status) {
            case 'Paid': return <CheckCircle className="h-4 w-4 mr-1 text-green-600" />;
            case 'Unpaid': return <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />;
            case 'Partially Paid': return <Clock className="h-4 w-4 mr-1 text-yellow-600" />;
            default: return null;
        }
    }

  // --- Render Student View ---
  const renderStudentView = () => {
    if (!feeDetails) {
       return <Alert><AlertDescription>No fee details found for your account.</AlertDescription></Alert>;
    }
    const statusStyle = getStatusStyle(feeDetails.status);

    return (
        <>
            {/* Fee Status Summary */}
            <Card className="transform transition-transform duration-300 hover:shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center justify-between">
                   <span>Fee Status</span>
                   <Badge variant={statusStyle.variant} className={cn("text-sm", statusStyle.className)}>
                       {statusIcon(feeDetails.status)} {feeDetails.status}
                   </Badge>
                </CardTitle>
                <CardDescription>
                    Your current fee balance overview.
                    {feeDetails.dueDate && ` Due Date: ${format(new Date(feeDetails.dueDate), 'PPP')}`}
                </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <SummaryBox label="Total Due" value={feeDetails.totalDue} />
                     <SummaryBox label="Total Paid" value={feeDetails.totalPaid} color="green" />
                     <SummaryBox label="Balance Due" value={feeDetails.balanceDue} color={feeDetails.balanceDue > 0 ? 'red' : 'green'} />
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4">
                    <p className="text-xs text-muted-foreground">Contact finance for payment queries.</p>
                    {/* TODO: Link to actual payment gateway */}
                    <Button disabled={feeDetails.balanceDue <= 0} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <DollarSign className="mr-2 h-4 w-4" /> Pay Now
                    </Button>
                </CardFooter>
            </Card>

             {/* Fee Breakdown */}
             <Card className="transform transition-transform duration-300 hover:shadow-lg">
                 <CardHeader>
                     <CardTitle>Fee Breakdown</CardTitle>
                     <CardDescription>Detailed structure of your fees.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Table>
                         <TableHeader>
                             <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {feeDetails.breakdown.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                                </TableRow>
                             ))}
                              <TableRow className="border-t font-semibold">
                                <TableCell>Total Due</TableCell>
                                <TableCell className="text-right">${feeDetails.totalDue.toFixed(2)}</TableCell>
                              </TableRow>
                        </TableBody>
                    </Table>
                 </CardContent>
             </Card>

            {/* Payment History */}
            <Card className="transform transition-transform duration-300 hover:shadow-lg">
                <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>List of your past fee payments.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead className="hidden sm:table-cell">Method</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Transaction ID</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {paymentHistory.length > 0 ? (
                        paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell>{format(new Date(payment.paymentDate), 'PPP')}</TableCell>
                            <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{payment.method || 'N/A'}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-right">{payment.transactionId || 'N/A'}</TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No payment history found.
                        </TableCell>
                        </TableRow>
                    )}
                    {/* Footer for Total Paid */}
                    {paymentHistory.length > 0 && (
                        <TableRow className="border-t border-dashed">
                            <TableCell colSpan={3} className="font-semibold">Total Paid</TableCell>
                            <TableCell className="text-right font-bold">${feeDetails.totalPaid.toFixed(2)}</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </>
    );
  };

  // --- Render Admin View ---
  const renderAdminView = () => (
     <Card className="transform transition-transform duration-300 hover:shadow-lg">
        <CardHeader>
            <CardTitle>Fee Management Dashboard</CardTitle>
            <CardDescription>View and manage student fee records.</CardDescription>
             {/* Filters & Actions */}
             <div className="flex flex-wrap items-center gap-2 pt-4">
                 <div className="relative flex-grow max-w-xs">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                         type="search"
                         placeholder="Search Student ID/Name..."
                         className="pl-8"
                         value={filters.searchQuery || ''}
                         onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                     />
                 </div>
                 <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value as FeeDetails['status'])}>
                     <SelectTrigger className="w-full sm:w-[180px]">
                         <Filter className="h-4 w-4 mr-1 text-muted-foreground inline-block"/>
                         <SelectValue placeholder="Filter by Status" />
                     </SelectTrigger>
                     <SelectContent>
                         <SelectItem value="all">All Statuses</SelectItem>
                         <SelectItem value="Paid">Paid</SelectItem>
                         <SelectItem value="Unpaid">Unpaid</SelectItem>
                         <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                     </SelectContent>
                 </Select>
                 <Button variant="outline" onClick={() => setFilters({})}>Clear Filters</Button>
                 <Button variant="outline" asChild disabled={isImportingFees}>
                    <Label htmlFor="import-fee-data" className="cursor-pointer">
                        {isImportingFees ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import Fee Data
                        <input id="import-fee-data" type="file" className="sr-only" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFeeDataImport} />
                    </Label>
                 </Button>
                 <Button variant="outline" onClick={handleExportFeeData} disabled={isExportingFees}>
                    {isExportingFees ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export CSV
                 </Button>
             </div>
        </CardHeader>
        <CardContent>
           {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto my-10"/> :
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student ID</TableHead>
                         <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Balance Due</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Total Paid</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Total Due</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allFeeDetails.length > 0 ? (
                        allFeeDetails.map((fd) => {
                           const statusStyle = getStatusStyle(fd.status);
                           return (
                             <TableRow key={fd.studentId}>
                                <TableCell className="font-medium">{fd.studentId}</TableCell>
                                <TableCell>{fd.studentName || 'N/A'}</TableCell>
                                <TableCell>
                                     <Badge variant={statusStyle.variant} className={cn("text-xs", statusStyle.className)}>
                                       {statusIcon(fd.status)} {fd.status}
                                     </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-semibold ${fd.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ${fd.balanceDue.toFixed(2)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-right text-muted-foreground">${fd.totalPaid.toFixed(2)}</TableCell>
                                <TableCell className="hidden lg:table-cell text-right text-muted-foreground">${fd.totalDue.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    {/* Add Payment Dialog Trigger */}
                                    <Dialog open={showAddPaymentDialog && selectedStudentForPayment === fd.studentId} onOpenChange={(open) => { if (!open) setSelectedStudentForPayment(null); setShowAddPaymentDialog(open); }}>
                                         <DialogTrigger asChild>
                                             <Button variant="outline" size="sm" onClick={() => {setSelectedStudentForPayment(fd.studentId); setShowAddPaymentDialog(true);}}>
                                                 <PlusCircle className="h-4 w-4 mr-1" /> Add Payment
                                             </Button>
                                         </DialogTrigger>
                                         <DialogContent>
                                             <DialogHeader>
                                                 <DialogTitle>Add Payment for {fd.studentId} ({fd.studentName || 'N/A'})</DialogTitle>
                                                 <DialogDescription>Record a new fee payment received for this student.</DialogDescription>
                                             </DialogHeader>
                                             <form onSubmit={handleAddPaymentSubmit} className="space-y-4">
                                                <div>
                                                     <Label htmlFor="amount">Amount</Label>
                                                     <Input id="amount" name="amount" type="number" step="0.01" required />
                                                </div>
                                                <div>
                                                     <Label htmlFor="paymentDate">Payment Date</Label>
                                                     <Input id="paymentDate" name="paymentDate" type="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')}/>
                                                </div>
                                                 <div>
                                                    <Label htmlFor="method">Payment Method</Label>
                                                    <Select name="method" defaultValue="Manual Entry">
                                                         <SelectTrigger id="method">
                                                             <SelectValue placeholder="Select method" />
                                                         </SelectTrigger>
                                                         <SelectContent>
                                                            <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                             <SelectItem value="Online">Online</SelectItem>
                                                             <SelectItem value="Cash">Cash</SelectItem>
                                                             <SelectItem value="Other">Other</SelectItem>
                                                         </SelectContent>
                                                    </Select>
                                                </div>
                                                 <div>
                                                     <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                                                     <Input id="transactionId" name="transactionId" type="text" />
                                                 </div>
                                                 <DialogFooter>
                                                     <Button type="button" variant="ghost" onClick={() => { setShowAddPaymentDialog(false); setSelectedStudentForPayment(null); }}>Cancel</Button>
                                                     <Button type="submit" disabled={isAddingPayment}>
                                                         {isAddingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                         Add Payment
                                                     </Button>
                                                 </DialogFooter>
                                             </form>
                                         </DialogContent>
                                     </Dialog>

                                    {/* TODO: Add Edit/View Details buttons */}
                                     {/* <Button variant="ghost" size="icon" className="ml-1"><Edit className="h-4 w-4" /></Button> */}
                                </TableCell>
                             </TableRow>
                           );
                       })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                No fee records found matching filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
           }
        </CardContent>
     </Card>
  );

  // --- Main Return ---
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
        <DollarSign className="h-7 w-7" /> Fee Tracker
        <span className="text-sm font-normal text-muted-foreground">({user?.role})</span>
      </h1>

      {isAdminView ? renderAdminView() : renderStudentView()}

      {/* Show message for faculty if they try to access */}
       {!isAdminView && user?.role !== 'student' && (
           <Alert>
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Information</AlertTitle>
             <AlertDescription>Fee details are primarily available for students and administrators.</AlertDescription>
           </Alert>
       )}

    </div>
  );
}


// --- Helper Components ---

// Summary Box
interface SummaryBoxProps {
    label: string;
    value: number;
    color?: 'green' | 'red';
}

function SummaryBox({ label, value, color }: SummaryBoxProps) {
    const colorClass = color === 'green' ? 'bg-green-500/10 text-green-600'
                     : color === 'red' ? 'bg-red-500/10 text-red-600'
                     : 'bg-secondary/10 text-secondary-foreground'; // Default or 'Total Due'
     const valueColor = color === 'green' ? 'text-green-600'
                       : color === 'red' ? 'text-red-600'
                       : 'text-foreground'; // Default

    return (
        <div className={`flex flex-col items-center p-4 rounded-lg ${colorClass}`}>
            <span className={`text-2xl font-bold ${valueColor}`}>${value.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
}

// Skeleton Loader
function FeeSkeleton() {
    return (
         <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div> {/* Title */}
            {/* Summary Card */}
            <Card>
                 <CardHeader><div className="h-6 bg-muted rounded w-1/4"></div></CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-20 bg-muted rounded-lg"></div>
                    <div className="h-20 bg-muted rounded-lg"></div>
                    <div className="h-20 bg-muted rounded-lg"></div>
                 </CardContent>
                 <CardFooter><div className="h-10 bg-muted rounded w-24 ml-auto"></div></CardFooter>
            </Card>
             {/* Details/History Card */}
            <Card>
                 <CardHeader><div className="h-6 bg-muted rounded w-1/3"></div></CardHeader>
                 <CardContent>
                     <div className="h-4 bg-muted rounded w-full mb-2"></div>
                     <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
                     <div className="h-4 bg-muted rounded w-full mb-2"></div>
                     <div className="h-4 bg-muted rounded w-3/4"></div>
                 </CardContent>
            </Card>
         </div>
    );
}