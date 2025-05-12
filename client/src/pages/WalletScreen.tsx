import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	PlusIcon,
	ArrowDownIcon,
	ArrowUpIcon,
	HistoryIcon,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { WalletTransaction } from "@shared/schema";

// Schema for the top-up form
const topUpSchema = z.object({
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine((val) => parseFloat(val) >= 5, {
			message: "Minimum amount is $5",
		})
		.refine((val) => parseFloat(val) <= 1000, {
			message: "Maximum amount is $1,000",
		}),
});

type TopUpFormData = z.infer<typeof topUpSchema>;

const WalletTransactionItem = ({
	transaction,
}: {
	transaction: WalletTransaction;
}) => {
	// Determine if it's a deposit or payment
	const isDeposit = transaction.type === "deposit";

	return (
		<div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 transition-all hover:bg-gray-50/50 px-2 rounded-lg">
			<div className="flex items-center">
				<div
					className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 shadow-sm ${
						isDeposit
							? "bg-gradient-to-br from-green-100 to-green-50"
							: "bg-gradient-to-br from-blue-100 to-blue-50"
					}`}>
					{isDeposit ? (
						<ArrowDownIcon className="h-5 w-5 text-green-600" />
					) : (
						<ArrowUpIcon className="h-5 w-5 text-blue-600" />
					)}
				</div>
				<div>
					<p className="font-medium text-sm text-gray-900">
						{transaction.description ||
							(isDeposit ? "Wallet Deposit" : "Payment")}
					</p>
					<p className="text-xs text-gray-500 mt-0.5">
						{formatDate(transaction.createdAt)}
					</p>
				</div>
			</div>
			<div
				className={`font-semibold ${
					isDeposit ? "text-green-600" : "text-blue-600"
				}`}>
				{isDeposit ? "+" : "-"}
				{formatCurrency(transaction.amount)}
			</div>
		</div>
	);
};

const WalletScreen = () => {
	const [isTopUpOpen, setIsTopUpOpen] = useState(false);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch wallet balance
	const { data: walletData, isLoading: isWalletLoading } = useQuery<{
		balance: number;
	}>({
		queryKey: ["/api/wallet"],
	});

	// Fetch wallet transactions
	const { data: walletTransactions, isLoading: isTransactionsLoading } =
		useQuery<WalletTransaction[]>({
			queryKey: ["/api/wallet/transactions"],
		});

	// Form setup
	const form = useForm<TopUpFormData>({
		resolver: zodResolver(topUpSchema),
		defaultValues: {
			amount: "",
		},
	});

	// Mutation for wallet top-up
	const topUpMutation = useMutation({
		mutationFn: async (data: TopUpFormData) => {
			const response = await apiRequest("POST", "/api/wallet/add-funds", {
				amount: data.amount,
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
			queryClient.invalidateQueries({
				queryKey: ["/api/wallet/transactions"],
			});
			toast({
				title: "Wallet topped up successfully",
				description: "Your wallet balance has been updated",
			});
			setIsTopUpOpen(false);
			form.reset();
		},
		onError: (error) => {
			toast({
				title: "Failed to top up wallet",
				description: "Please try again later",
				variant: "destructive",
			});
		},
	});

	const handleTopUp = (data: TopUpFormData) => {
		topUpMutation.mutate(data);
	};

	// Calculate stats from transactions
	const totalDeposits = walletTransactions
		? walletTransactions
				.filter((t) => t.type === "deposit")
				.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
		: 0;

	const totalSpent = walletTransactions
		? walletTransactions
				.filter((t) => t.type === "payment")
				.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
		: 0;

	return (
		<div className="slide-in px-4 pt-4 pb-8">
			<h2 className="text-xl font-semibold mb-5 text-gradient">محفظتي</h2>

			{/* Wallet Balance Card */}
			<Card className="overflow-hidden mb-6 border-0 card-shadow-lg">
				<div className="bg-gradient-to-r from-primary to-indigo-600 px-6 pt-6 pb-12 text-white relative bg-pattern-dots">
					<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
					<div className="absolute -bottom-5 -left-10 w-24 h-24 bg-white/5 rounded-full"></div>
					<div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/10"></div>
					<div className="absolute top-10 right-10 w-8 h-8 rounded-full bg-white/10"></div>

					<div className="relative z-10">
						<h3 className="text-lg font-medium text-white/90 mb-1">
							الرصيد المتوفر
						</h3>
						<div className="text-4xl font-bold mb-2">
							{isWalletLoading ? (
								<div className="h-10 w-32 bg-white/20 animate-pulse rounded-md"></div>
							) : (
								formatCurrency(walletData?.balance || 0)
							)}
						</div>

						<div className="flex text-white/80 text-sm">
							<span>محفظة تطبيقي</span>
							<span className="mx-2">•</span>
							<span>تم التحديث الان</span>
						</div>
					</div>
				</div>

				<div className="bg-white px-6 py-4 flex justify-between -mt-4 rounded-t-2xl relative z-10 shadow-sm">
					<Button
						onClick={() => setIsTopUpOpen(true)}
						className="gap-1 btn-gradient">
						<PlusIcon className="h-4 w-4" />
						اضافة رصيد
					</Button>

					{!isWalletLoading && (
						<div className="flex gap-6">
							<div className="text-center">
								<p className="text-xs text-gray-500 font-medium mb-1">
									اجمالي الرصيد المضاف
								</p>
								<p className="font-semibold text-green-600">
									{formatCurrency(totalDeposits)}
								</p>
							</div>

							<div className="text-center">
								<p className="text-xs text-gray-500 font-medium mb-1">
									اجمالي الرصيد المنفق
								</p>
								<p className="font-semibold text-red-600">
									{formatCurrency(totalSpent)}
								</p>
							</div>
						</div>
					)}
				</div>
			</Card>

			{/* Quick Actions */}
			<div className="grid grid-cols-3 gap-4 mb-6">
				<Card className="text-center cursor-pointer card-shadow hover:shadow-md transition-all overflow-hidden border-0">
					<div className="h-1 bg-gradient-to-r from-blue-500 to-primary"></div>
					<CardContent className="p-4">
						<div className="bg-gradient-to-br from-blue-100 to-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
							<ArrowUpIcon className="h-5 w-5 text-blue-600" />
						</div>
						<p
							className="text-sm font-medium text-gray-800"
							style={{ textAlign: "center" }}>
							ارسال
						</p>
					</CardContent>
				</Card>

				<Card className="text-center cursor-pointer card-shadow hover:shadow-md transition-all overflow-hidden border-0">
					<div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
					<CardContent className="p-4">
						<div className="bg-gradient-to-br from-green-100 to-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
							<ArrowDownIcon className="h-5 w-5 text-green-600" />
						</div>
						<p
							className="text-sm font-medium text-gray-800"
							style={{ textAlign: "center" }}>
							استقبال
						</p>
					</CardContent>
				</Card>

				<Card
					className="text-center cursor-pointer card-shadow hover:shadow-md transition-all overflow-hidden border-0"
					onClick={() => setIsTopUpOpen(true)}>
					<div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
					<CardContent className="p-4">
						<div className="bg-gradient-to-br from-indigo-100 to-purple-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
							<PlusIcon className="h-5 w-5 text-indigo-600" />
						</div>
						<p
							className="text-sm font-medium text-gray-800"
							style={{ textAlign: "center" }}>
							اعادة الشحن
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Transactions */}
			<Card className="border-0 card-shadow overflow-hidden">
				<div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg text-gradient">
							المعاملات الاخيرة
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-1 text-primary hover:text-primary/90 hover:bg-primary/5">
							<HistoryIcon className="h-4 w-4" />
							عرض الكل
						</Button>
					</div>
					<CardDescription>نشاط محفظتك الأخير</CardDescription>
				</CardHeader>

				<CardContent className="pb-4 px-5">
					{isTransactionsLoading ? (
						<div className="py-8 flex flex-col items-center justify-center">
							<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
							<p className="text-sm text-gray-500">
								تحميل المعاملات ...
							</p>
						</div>
					) : walletTransactions && walletTransactions.length > 0 ? (
						<div className="divide-y divide-gray-100 custom-scrollbar">
							{walletTransactions
								.slice(0, 5)
								.map((transaction) => (
									<WalletTransactionItem
										key={transaction.id}
										transaction={transaction}
									/>
								))}
						</div>
					) : (
						<div className="py-10 text-center bg-gray-50/50 rounded-xl border border-gray-100">
							<div className="bg-gradient-to-br from-blue-100 to-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
								<HistoryIcon className="h-8 w-8 text-primary/70" />
							</div>
							<p className="text-gray-700 font-medium mb-1">
								لا يوجد معاملات حاليا
							</p>
							<p className="text-gray-500 text-sm mb-4">
								أضف أموالاً إلى محفظتك لتبدأ
							</p>
							<Button
								onClick={() => setIsTopUpOpen(true)}
								className="btn-gradient"
								size="sm">
								<PlusIcon className="h-4 w-4 mr-2" />
								قم باضافة الرصيد الآن
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Top Up Dialog */}
			<Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
				<DialogContent className="max-w-md overflow-hidden border-0 card-shadow-lg">
					<div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 absolute top-0 left-0 right-0"></div>
					<DialogHeader className="text-center pt-6">
						<DialogTitle
							className="text-xl text-gradient"
							style={{ textAlign: "center" }}>
							أضف أموالاً إلى المحفظة
						</DialogTitle>
						<DialogDescription style={{ textAlign: "center" }}>
							قم بإعادة تعبئة محفظتك لمدفوعات الكهرباء السلسة
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={form.handleSubmit(handleTopUp)}>
						<div className="py-4">
							<div className="mb-6">
								<div className="relative">
									<div className="absolute left-0 top-1/2 -translate-y-1/2 pl-3 text-gray-500 text-xl font-bold">
										$
									</div>
									<Input
										{...form.register("amount")}
										className="pl-10 h-14 text-2xl font-bold text-center bg-gray-50 border-2 focus-visible:ring-primary form-input-gradient rounded-xl"
										placeholder="0.00"
										type="number"
										step="0.01"
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<Button
											size="sm"
											variant="ghost"
											type="button"
											className="h-8 px-2 text-primary hover:bg-primary/5"
											onClick={() =>
												form.setValue("amount", "")
											}>
											مسح
										</Button>
									</div>
								</div>
								{form.formState.errors.amount && (
									<p className="text-sm text-red-500 mt-2 text-center">
										{form.formState.errors.amount.message}
									</p>
								)}
							</div>

							<div className="space-y-5">
								<p
									className="text-sm font-medium text-gray-500 text-center mb-3"
									style={{ textAlign: "center" }}>
									كميات سريعة
								</p>

								<div className="grid grid-cols-3 gap-3">
									{[10, 20, 50].map((amount) => (
										<Button
											key={amount}
											type="button"
											variant="outline"
											size="lg"
											className={`h-16 text-lg font-medium rounded-xl transition-all ${
												form.watch("amount") ===
												amount.toString()
													? "border-primary/70 bg-primary/5 text-primary shadow-sm"
													: "hover:border-primary/20 hover:bg-primary/5"
											}`}
											onClick={() =>
												form.setValue(
													"amount",
													amount.toString()
												)
											}>
											${amount}
										</Button>
									))}
								</div>

								<div className="grid grid-cols-3 gap-3">
									{[100, 200, 500].map((amount) => (
										<Button
											key={amount}
											type="button"
											variant="outline"
											size="lg"
											className={`h-16 text-lg font-medium rounded-xl transition-all ${
												form.watch("amount") ===
												amount.toString()
													? "border-primary/70 bg-primary/5 text-primary shadow-sm"
													: "hover:border-primary/20 hover:bg-primary/5"
											}`}
											onClick={() =>
												form.setValue(
													"amount",
													amount.toString()
												)
											}>
											${amount}
										</Button>
									))}
								</div>
							</div>

							<div className="bg-pattern-dots bg-primary/5 rounded-xl p-4 my-5 flex items-center">
								<div className="bg-white/80 rounded-full p-2 ml-3 shadow-sm">
									<PlusIcon className="h-5 w-5 text-indigo-600" />
								</div>
								<div className="text-sm">
									<p className="font-medium">ائتمان فوري</p>
									<p className="text-gray-500">
										الأموال متاحة على الفور بعد إعادة الشحن
									</p>
								</div>
							</div>
						</div>

						<DialogFooter className="flex-col gap-2">
							<Button
								type="submit"
								size="lg"
								disabled={topUpMutation.isPending}
								className="w-full btn-gradient-purple rounded-xl h-12 text-base">
								{topUpMutation.isPending ? (
									<div className="flex items-center justify-center">
										<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
										قيد المعالجة ...
									</div>
								) : (
									`اضافة ${
										form.watch("amount")
											? "$" + form.watch("amount")
											: "رصيد"
									} الى المحفظة`
								)}
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsTopUpOpen(false)}
								size="sm"
								className="w-full text-gray-500 hover:text-gray-700">
								الغاء
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default WalletScreen;
