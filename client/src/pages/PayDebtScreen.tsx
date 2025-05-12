import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  CreditCardIcon, 
  WalletIcon,
  LightbulbIcon,
  DropletIcon,
  WrenchIcon,
  Trash2Icon
} from "lucide-react";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Debt } from "@shared/schema";

// Category icon mapping
const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'water':
      return <DropletIcon className="h-4 w-4 text-blue-500" />;
    case 'maintenance':
      return <WrenchIcon className="h-4 w-4 text-orange-500" />;
    case 'trash':
      return <Trash2Icon className="h-4 w-4 text-green-500" />;
    case 'electricity':
    default:
      return <LightbulbIcon className="h-4 w-4 text-amber-500" />;
  }
};

// Category display text
const getCategoryName = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'water': return 'Water';
    case 'maintenance': return 'Maintenance';
    case 'trash': return 'Trash Collection';
    case 'electricity': return 'Electricity';
    default: return category || 'Utility';
  }
};

const PayDebtScreen = () => {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  
  // Parse URL parameters
  const params = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const isPayAll = params.get('type') === 'all';
  const totalAmount = params.get('amount');
  
  // Get debt ID from URL (only for single debt payment)
  const debtId = !isPayAll ? location.split('/').pop() : null;
  
  // For single debt payment
  const { data: debt, isLoading: isDebtLoading } = useQuery<Debt>({
    queryKey: [`/api/debts/${debtId}`],
    queryFn: async () => {
      if (isPayAll) return null;
      const response = await apiRequest("GET", `/api/debts/${debtId}`);
      return response.json();
    },
    enabled: !isPayAll && !!debtId
  });
  
  // Get all pending debts for "Pay All" mode
  const { data: allDebts, isLoading: isAllDebtsLoading } = useQuery<Debt[]>({
    queryKey: ['/api/debts'],
    enabled: isPayAll
  });
  
  const { data: walletData, isLoading: isWalletLoading } = useQuery<{ balance: number }>({
    queryKey: ['/api/wallet'],
  });
  
  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/debts/${debtId}/pay`, {
        paymentMethod
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/debts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      
      // Show success message
      toast({
        title: "Payment Successful",
        description: "Your debt has been paid successfully",
      });
      
      // Navigate to success page
      navigate('/success?type=debt');
    },
    onError: (error: any) => {
      // Show error message
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      });
    }
  });
  
  const handlePayNow = () => {
    // If wallet method is selected but balance is insufficient
    if (paymentMethod === 'wallet' && 
        walletData && 
        debt && 
        walletData.balance < parseFloat(debt.amount.toString())) {
      toast({
        title: "Insufficient Wallet Balance",
        description: "Please top up your wallet or choose a different payment method",
        variant: "destructive",
      });
      return;
    }
    
    // Process payment
    paymentMutation.mutate();
  };
  
  // For "Pay All" amount
  const payAllAmount = isPayAll && totalAmount ? parseFloat(totalAmount) : 0;
  const pendingDebts = isPayAll && allDebts ? allDebts.filter(d => !d.isPaid) : [];
  
  // Check if wallet has sufficient balance
  const hasSufficientBalance = walletData && (
    isPayAll 
      ? walletData.balance >= payAllAmount
      : debt && walletData.balance >= parseFloat(debt.amount.toString())
  );
  
  if ((isDebtLoading && !isPayAll) || (isAllDebtsLoading && isPayAll)) {
    return (
      <div className="slide-in px-4 pt-6 flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading debt details...</p>
      </div>
    );
  }
  
  if (!isPayAll && !debt) {
    return (
      <div className="slide-in px-4 pt-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Debt Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the debt you're looking for.</p>
            <Button onClick={() => navigate('/debts')}>
              Go Back to Debts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isPayAll && (!pendingDebts || pendingDebts.length === 0)) {
    return (
      <div className="slide-in px-4 pt-6">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Pending Debts</h2>
            <p className="text-gray-600 mb-6">You don't have any pending debts to pay.</p>
            <Button onClick={() => navigate('/debts')}>
              Go Back to Debts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle payment for single debt vs all debts
  const handlePayAllDebts = async () => {
    // For "Pay All Debts", implement payment logic here
    // In a real app, we'd call an API endpoint to pay all debts at once
    
    if (paymentMethod === 'wallet' && walletData && payAllAmount > walletData.balance) {
      toast({
        title: "Insufficient Wallet Balance",
        description: "Please top up your wallet or choose a different payment method",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real implementation, this would be a single API call to pay all debts
      // For demo, we'll show a success message and redirect
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/debts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      
      // Show success message
      toast({
        title: "Payment Successful",
        description: "All your pending debts have been paid",
      });
      
      // Navigate to success page
      navigate('/success?type=debt_all');
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      });
    }
  };

  // Return UI based on mode
  return (
    <div className="slide-in px-4 pt-4 pb-8">
      <h2 className="text-xl font-semibold mb-4">
        {isPayAll ? 'Pay All Utility Debts' : 'Pay Utility Debt'}
      </h2>
      
      {/* Debt Details */}
      {isPayAll ? (
        <Card className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-3">
                <AlertTriangleIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-2">Multiple Pending Debts</h3>
                <p className="text-2xl font-bold mb-3">{formatCurrency(payAllAmount)}</p>
                
                <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                  {pendingDebts.map((debt, index) => (
                    <div key={debt.id} className="flex justify-between text-sm bg-white/50 p-2 rounded">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(debt.category)}
                        <span>{debt.description || getCategoryName(debt.category)}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(debt.amount)}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-600">
                  Pay all {pendingDebts.length} pending debts in a single transaction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-amber-200/60 rounded-full p-3">
                <AlertTriangleIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Outstanding Balance</h3>
                <p className="text-2xl font-bold mb-1">{debt && formatCurrency(debt.amount)}</p>
                <p className="text-sm text-gray-600">Due by {debt && formatDate(debt.dueDate)}</p>
                <p className="text-sm text-gray-600 mt-2">Meter: {debt?.meterNumber}</p>
                {debt?.description && (
                  <p className="text-sm mt-2 text-gray-700">{debt.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payment Method */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
          <CardDescription>Select how you'd like to pay</CardDescription>
        </CardHeader>
        
        <CardContent>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={setPaymentMethod} 
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay using your card</p>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className={`flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${!hasSufficientBalance ? 'opacity-60' : ''}`}>
              <RadioGroupItem value="wallet" id="wallet" disabled={!hasSufficientBalance} />
              <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <WalletIcon className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Wallet Balance</p>
                      {!isWalletLoading && walletData && (
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {formatCurrency(walletData.balance)}
                        </span>
                      )}
                    </div>
                    {hasSufficientBalance ? (
                      <p className="text-sm text-gray-500">Pay using your wallet balance</p>
                    ) : (
                      <p className="text-sm text-red-500">Insufficient balance</p>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/debts')}>
            Cancel
          </Button>
          <Button 
            onClick={isPayAll ? handlePayAllDebts : handlePayNow}
            disabled={paymentMutation.isPending}
            className={isPayAll ? "bg-gradient-to-r from-primary to-indigo-600" : ""}
          >
            {paymentMutation.isPending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : (
              <>Pay Now {isPayAll 
                ? formatCurrency(payAllAmount) 
                : debt ? formatCurrency(debt.amount) : ""}</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PayDebtScreen;