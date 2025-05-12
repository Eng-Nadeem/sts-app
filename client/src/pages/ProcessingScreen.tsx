import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

const ProcessingScreen = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get query parameters
  const params = new URLSearchParams(window.location.search);
  const meterNumber = params.get('meterNumber') || '';
  const nickname = params.get('nickname') || '';
  const amountParam = params.get('amount') || '0';
  const amount = parseFloat(amountParam);
  const totalParam = params.get('total') || '0';
  const total = parseFloat(totalParam);
  const paymentMethod = params.get('paymentMethod') || 'card';
  
  useEffect(() => {
    const processPayment = async () => {
      try {
        // Process the payment through API
        const response = await apiRequest('POST', '/api/transactions', {
          meterNumber,
          amount,
          total,
          paymentMethod
        });
        
        const data = await response.json();
        
        // Navigate to success page with transaction data
        navigate(`/success?transactionId=${data.id}&meterNumber=${meterNumber}&amount=${amount}&token=${data.token}`);
      } catch (error) {
        console.error('Payment processing error:', error);
        
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: "We couldn't process your payment. Please try again."
        });
        
        navigate(`/error?meterNumber=${meterNumber}&amount=${amount}`);
      }
    };
    
    // Simulate a realistic processing delay
    const processingTimer = setTimeout(() => {
      processPayment();
    }, 3000);
    
    return () => clearTimeout(processingTimer);
  }, [meterNumber, amount, total, paymentMethod, navigate, toast]);
  
  return (
    <div className="slide-in h-full flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="w-10 h-10 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
        <p className="text-gray-500 mb-8">Please wait while we process your payment...</p>
        
        <Card className="mb-4 mx-auto max-w-xs">
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Meter:</span>
              <span className="font-medium">{meterNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-sm text-gray-500">This may take a few moments. Please don't close this screen.</p>
      </div>
    </div>
  );
};

export default ProcessingScreen;
