import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCardIcon, LockIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils";

// Payment form schema
const paymentFormSchema = z.object({
  cardNumber: z.string()
    .min(1, "Card number is required")
    .regex(/^[\d\s]{16,19}$/, "Invalid card number format"),
  cardholderName: z.string()
    .min(1, "Cardholder name is required"),
  expiryDate: z.string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format. Use MM/YY"),
  cvv: z.string()
    .min(1, "CVV is required")
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface MockPaymentFormProps {
  amount: number | string;
  onSuccess: () => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const MockPaymentForm = ({ 
  amount, 
  onSuccess, 
  onError, 
  isProcessing,
  setIsProcessing 
}: MockPaymentFormProps) => {
  const amountValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Default cards for testing
  const testCards = [
    { name: "Test Card (Success)", number: "4242 4242 4242 4242", expiry: "12/25", cvv: "123" },
    { name: "Test Card (Decline)", number: "4000 0000 0000 0002", expiry: "12/25", cvv: "123" },
  ];
  
  // Form setup
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      cvv: "",
    },
  });
  
  // Card number masking
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Handle input formatting
  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(event.target.value);
    form.setValue('cardNumber', formattedValue);
  };
  
  const handleExpiryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    form.setValue('expiryDate', value);
  };
  
  // Handle form submission
  const handleSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      // Simulate API call with random delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Check if card is the "decline" test card
      if (data.cardNumber.replace(/\s/g, '') === '4000000000000002') {
        throw new Error("Your card has been declined");
      }
      
      onSuccess();
    } catch (error: any) {
      onError(error.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Use a test card
  const useTestCard = (cardIndex: number) => {
    const card = testCards[cardIndex];
    form.setValue('cardNumber', card.number);
    form.setValue('cardholderName', card.name);
    form.setValue('expiryDate', card.expiry);
    form.setValue('cvv', card.cvv);
  };
  
  return (
    <div>
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Card Payment</h3>
            </div>
            <div className="text-xl font-semibold">
              {formatCurrency(amountValue)}
            </div>
          </div>
          
          {/* Test Card Options */}
          <div className="mb-4 bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2">Test Card Options:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => useTestCard(0)}
              >
                Use Success Card
              </Button>
              <Button
                type="button" 
                size="sm"
                variant="outline"
                onClick={() => useTestCard(1)}
              >
                Use Decline Card
              </Button>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0000 0000 0000 0000"
                        onChange={handleCardNumberChange}
                        maxLength={19}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Name on card" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="MM/YY"
                          onChange={handleExpiryChange}
                          maxLength={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="***"
                          maxLength={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LockIcon className="h-4 w-4 mr-2" />
                      Pay {formatCurrency(amountValue)}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-center text-xs text-gray-500 flex items-center justify-center mt-2">
                <LockIcon className="h-3 w-3 mr-1" />
                This is a mock payment for demonstration purposes only
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockPaymentForm;