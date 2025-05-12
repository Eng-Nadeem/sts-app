import { useLocation } from "wouter";
import { AlertCircleIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

const ErrorScreen = () => {
  const [, navigate] = useLocation();
  
  // Get query parameters
  const params = new URLSearchParams(window.location.search);
  const meterNumber = params.get('meterNumber') || '';
  const amountParam = params.get('amount') || '0';
  const amount = parseFloat(amountParam);
  const errorCode = params.get('errorCode') || 'ERR-5001';
  const reason = params.get('reason') || 'Payment declined';
  
  const handleContactSupport = () => {
    // In a real app, you would implement actual support contact functionality
    alert('Contact support functionality would be implemented here');
  };
  
  const handleTryAgain = () => {
    navigate(`/payment-confirmation?meterNumber=${meterNumber}&amount=${amount}`);
  };
  
  return (
    <div className="slide-in h-full flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircleIcon className="h-10 w-10 text-error" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Transaction Failed</h2>
        <p className="text-gray-500 mb-6">We couldn't complete your payment</p>
        
        <Card className="mb-6 mx-auto max-w-xs">
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Error Code:</span>
              <span className="font-medium">{errorCode}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Reason:</span>
              <span className="font-medium">{reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date & Time:</span>
              <span className="font-medium">{formatDate(new Date())}</span>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-sm text-gray-500 mb-6">
          Your account has not been charged. Please try again or contact customer support if the problem persists.
        </p>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleContactSupport}
          >
            Contact Support
          </Button>
          <Button 
            className="flex-1"
            onClick={handleTryAgain}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
