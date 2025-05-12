import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionCard from "@/components/TransactionCard";
import { Transaction } from "@shared/schema";

const TransactionHistoryScreen = () => {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', filter],
  });
  
  const filteredTransactions = transactions
    ? filter === "all" 
      ? transactions 
      : transactions.filter(t => t.status === filter)
    : [];
  
  return (
    <div className="slide-in px-4 pt-4">
      <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
      
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="success" className="flex-1">Successful</TabsTrigger>
          <TabsTrigger value="failed" className="flex-1">Failed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter}>
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="py-8 text-center">Loading transactions...</div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No {filter !== "all" ? filter : ""} transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionHistoryScreen;
