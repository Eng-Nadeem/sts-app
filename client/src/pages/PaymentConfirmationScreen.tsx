import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, BoltIcon, CreditCardIcon, WalletIcon } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, generateToken } from "@/lib/utils";
import MockPaymentForm from "@/components/MockPaymentForm";
import Confetti from "@/components/ui/confetti";

const SERVICE_FEE = 0.5;

const PaymentConfirmationScreen = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTab, setSelectedTab] = useState("review");
  
  // Get query parameters
  const params = new URLSearchParams(window.location.search);
  const meterNumber = params.get('meterNumber') || '';
  const meterId = params.get('meterId');
  const nickname = params.get('nickname') || 'Not specified';
  const amountParam = params.get('amount') || '0';
  const amount = parseFloat(amountParam);
  const total = amount + SERVICE_FEE;
  
  // Fetch wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(0);
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch('/api/wallet');
        const data = await response.json();
        setWalletBalance(parseFloat(data.balance));
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };
    
    fetchWalletBalance();
  }, []);
  
  // Validate required parameters are present
  useEffect(() => {
    if (!meterNumber || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid parameters",
        description: "Please select a meter and enter an amount first",
        variant: "destructive",
      });
      navigate('/recharge');
    }
  }, [meterNumber, amount, navigate, toast]);
  
  // Calculate estimated units
  const estimatedUnits = (amount / 0.45).toFixed(1);
  
  // Check if wallet has sufficient balance
  const hasSufficientBalance = walletBalance >= total;
  
  // Mutation for processing the payment
  const paymentMutation = useMutation({
    mutationFn: async () => {
      // Generate a unique token for this transaction (simulated)
      const token = generateToken(20);
      
      // Create transaction data
      const paymentData = {
        meterNumber,
        meterId: meterId ? parseInt(meterId) : undefined,
        amount,
        total,
        paymentMethod,
        token,
        serviceFee: SERVICE_FEE
      };
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      // If using wallet but insufficient balance, reject the payment
      if (paymentMethod === 'wallet' && !hasSufficientBalance) {
        throw new Error("Insufficient wallet balance");
      }
      
      // In a real app, we would send this to the backend
      // Since we're using a mock for demo, we'll return a simulated response
      return {
        id: Math.floor(Math.random() * 10000),
        status: "success",
        meterNumber,
        amount,
        token,
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      // Trigger confetti animation
      setShowConfetti(true);
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: "Your meter has been recharged successfully",
      });
      
      // Navigate to success screen with the transaction details
      setTimeout(() => {
        navigate(`/success?transactionId=${data.id}&meterNumber=${meterNumber}&amount=${amount}&token=${data.token}`);
      }, 2000);
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Payment failed",
        description: error.message || "Unable to process your payment. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleBack = () => {
    navigate(`/recharge?meterNumber=${meterNumber}&nickname=${nickname}&amount=${amount}`);
  };
  
  const handlePayWithWallet = () => {
    if (!hasSufficientBalance) {
      toast({
        title: "Insufficient balance",
        description: "Please top up your wallet or use a different payment method",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    paymentMutation.mutate();
  };
  
  const handleCardPaymentSuccess = () => {
    // Show confetti animation first
    setShowConfetti(true);
    
    // Proceed with processing the transaction after a brief delay
    setTimeout(() => {
      paymentMutation.mutate();
    }, 500);
  };
  
  const handleCardPaymentError = (error: string) => {
    toast({
      title: "Payment failed",
      description: error,
      variant: "destructive",
    });
    setIsProcessing(false);
  };
  
  return (
    <div className="slide-in px-4 pt-4 pb-8">
      {/* Confetti animation */}
      <Confetti active={showConfetti} />
      
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2"
          disabled={isProcessing}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Complete Payment</h2>
      </div>
      
      <Tabs 
        defaultValue="review" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="payment" disabled={isProcessing}>Payment</TabsTrigger>
        </TabsList>
        
        {/* Review Tab */}
        <TabsContent value="review">
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Details</CardTitle>
              <CardDescription>Review your electricity purchase</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Meter Number</p>
                  <p className="font-medium">{meterNumber}</p>
                  {nickname && nickname !== 'Not specified' && (
                    <p className="text-xs text-blue-500">({nickname})</p>
                  )}
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Est. Units</p>
                  <p className="font-medium">{estimatedUnits} kWh</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-lg p-4 text-white mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm mb-1">Amount</div>
                    <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-white/80 text-xs">Service Fee:</div>
                      <div className="text-white/90 text-xs">{formatCurrency(SERVICE_FEE)}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-white/80 text-xs">Total:</div>
                      <div className="text-white/90 text-xs font-bold">{formatCurrency(total)}</div>
                    </div>
                  </div>
                  <div className="bg-white/20 h-14 w-14 rounded-full flex items-center justify-center">
                    <BoltIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <RadioGroup 
                defaultValue={paymentMethod} 
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
                        <p className="text-sm text-gray-500">Pay with your card</p>
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
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {formatCurrency(walletBalance)}
                          </span>
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
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (paymentMethod === 'wallet') {
                    handlePayWithWallet();
                  } else {
                    setSelectedTab('payment');
                  }
                }}
                disabled={isProcessing || (paymentMethod === 'wallet' && !hasSufficientBalance)}
              >
                {paymentMethod === 'wallet' ? 'Pay with Wallet' : 'Continue'}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-gray-500">
            <p>By proceeding, you agree to our Terms of Service</p>
          </div>
        </TabsContent>
        
        {/* Payment Tab */}
        <TabsContent value="payment">
          <MockPaymentForm 
            amount={total} 
            onSuccess={handleCardPaymentSuccess}
            onError={handleCardPaymentError}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setSelectedTab('review')}
            disabled={isProcessing}
          >
            Back to Review
          </Button>
        </TabsContent>
      </Tabs>
      
      {/* Purchase benefits */}
      <Card>
        <CardContent className="p-4 text-sm">
          <h3 className="font-medium mb-2">Your purchase includes:</h3>
          <ul className="space-y-2 pl-6">
            <li className="list-disc">Instant token delivery via SMS</li>
            <li className="list-disc">24/7 customer support</li>
            <li className="list-disc">Receipt for your records</li>
            <li className="list-disc">Loyalty points for future discounts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentConfirmationScreen;
