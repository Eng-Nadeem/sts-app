import { CheckCircleIcon, XCircleIcon, ZapIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@shared/schema";

// Extended transaction interface to accommodate both DB and mock data
interface ExtendedTransaction {
  id: number;
  type?: string;
  amount: number | string;
  status: string;
  meterNumber?: string;
  timestamp?: string;
  createdAt?: string | Date;
  reference?: string;
  transactionType?: string;
  total?: number | string;
  units?: number | string | null;
  paymentMethod?: string;
  token?: string | null;
  receiptUrl?: string | null;
  userId?: number | null;
}

interface TransactionCardProps {
  transaction: ExtendedTransaction;
  className?: string;
}

const TransactionCard = ({ transaction, className = "" }: TransactionCardProps) => {
  // Handle both DB and mock data format
  const isSuccess = transaction.status === "success" || transaction.status === "completed";
  const isRecharge = (transaction.transactionType === "recharge") || (transaction.type === "recharge");
  const isDebtPayment = (transaction.transactionType === "debt_payment") || (transaction.type === "debt_payment");
  
  // Get appropriate icon and styling based on transaction type
  const getTransactionTypeInfo = () => {
    if (isRecharge) {
      return {
        label: "Recharge",
        icon: <ZapIcon className="h-4 w-4 mr-1" />,
        className: "text-blue-600 bg-blue-50"
      };
    } else if (isDebtPayment) {
      return {
        label: "Debt Payment",
        icon: <CheckCircleIcon className="h-4 w-4 mr-1" />,
        className: "text-indigo-600 bg-indigo-50"
      };
    } else {
      return {
        label: "Transaction",
        icon: <ZapIcon className="h-4 w-4 mr-1" />,
        className: "text-gray-600 bg-gray-50"
      };
    }
  };
  
  // Safely format the date
  const getFormattedDate = () => {
    try {
      // Use timestamp from mock data or createdAt from DB
      const dateString = transaction.timestamp || transaction.createdAt;
      if (!dateString) return "Date unavailable";
      return formatDate(dateString);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date unavailable";
    }
  };
  
  const typeInfo = getTransactionTypeInfo();
  
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className={`w-12 h-12 rounded-full ${isSuccess ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-red-100 to-red-200'} flex items-center justify-center mr-4 shadow-sm`}>
          {isSuccess ? (
            <CheckCircleIcon className="h-6 w-6 text-success" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-error" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <span className="font-medium text-gray-900 block">
                Meter: {transaction.meterNumber || "N/A"}
              </span>
              <span className={`inline-flex items-center text-xs px-2 py-0.5 mt-1 rounded-full ${typeInfo.className}`}>
                {typeInfo.icon}
                {typeInfo.label}
              </span>
            </div>
            <span className="font-semibold text-lg">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">{getFormattedDate()}</span>
            <span className={`font-medium ${isSuccess ? "text-success" : "text-error"}`}>
              {isSuccess ? "Success" : "Failed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
