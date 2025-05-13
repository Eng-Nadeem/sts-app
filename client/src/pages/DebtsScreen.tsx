import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
	AlertTriangleIcon,
	ArrowLeftIcon,
	CheckCircleIcon,
	ClockIcon,
	CreditCardIcon,
	DropletIcon,
	LightbulbIcon,
	RefreshCcwIcon,
	SearchIcon,
	Trash2Icon,
	WrenchIcon,
	WalletIcon,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Debt } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Category icon mapping
const getCategoryIcon = (category: string) => {
	switch (category?.toLowerCase()) {
		case "water":
			return <DropletIcon className="h-4 w-4 text-blue-500" />;
		case "maintenance":
			return <WrenchIcon className="h-4 w-4 text-orange-500" />;
		case "trash":
			return <Trash2Icon className="h-4 w-4 text-green-500" />;
		case "electricity":
		default:
			return <LightbulbIcon className="h-4 w-4 text-amber-500" />;
	}
};

// Category display text
const getCategoryName = (category: string) => {
	switch (category?.toLowerCase()) {
		case "water":
			return "ماء";
		case "maintenance":
			return "صيانة";
		case "trash":
			return "نفايات";
		case "electricity":
			return "كهرباء";
		default:
			return category || "الكل";
	}
};

// Category badge styling
const getCategoryStyle = (category: string) => {
	switch (category?.toLowerCase()) {
		case "water":
			return "bg-blue-50 text-blue-600 hover:bg-blue-100";
		case "maintenance":
			return "bg-orange-50 text-orange-600 hover:bg-orange-100";
		case "trash":
			return "bg-green-50 text-green-600 hover:bg-green-100";
		case "electricity":
		default:
			return "bg-amber-50 text-amber-600 hover:bg-amber-100";
	}
};

// Debt card component
const DebtCard = ({
	debt,
	onPayNow,
}: {
	debt: Debt;
	onPayNow: (debt: Debt) => void;
}) => {
	const categoryName = getCategoryName(debt.category);
	const categoryStyle = getCategoryStyle(debt.category);

	return (
		<Card className="mb-3 overflow-hidden">
			<div
				className={`h-1 ${
					debt.isPaid ? "bg-green-500" : "bg-amber-500"
				}`}
			/>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1 pl-3">
						<div className="flex items-center justify-between mb-2">
							<Badge
								variant="outline"
								className={`flex items-center gap-1 ${categoryStyle}`}>
								{getCategoryIcon(debt.category)}
								{categoryName}
							</Badge>

							{debt.isPaid ? (
								<span className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full">
									<CheckCircleIcon className="h-3 w-3 mr-1" />
									Paid
								</span>
							) : (
								<span className="flex items-center text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded-full">
									<ClockIcon className="h-3 w-3 mr-1" />
									{new Date(debt.dueDate) < new Date()
										? "متعثر"
										: "معلقة"}
								</span>
							)}
						</div>

						<div className="flex justify-between mb-1">
							<p className="text-sm font-medium">
								{debt.description || `${categoryName} Bill`}
							</p>
							<p className="font-bold text-right">
								{formatCurrency(debt.amount)}
							</p>
						</div>

						<div className="flex justify-between text-xs text-gray-500">
							<p>العداد: {debt.meterNumber}</p>
							<p>التاريخ: {formatDate(debt.dueDate)}</p>
						</div>
					</div>

					{!debt.isPaid && (
						<Button
							size="sm"
							className="flex items-center whitespace-nowrap"
							onClick={() => onPayNow(debt)}>
							ادفع الان
							<ArrowLeftIcon className="h-4 w-4 ml-2" />
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

const DebtsScreen = () => {
	const [, navigate] = useLocation();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("pending");
	const { toast } = useToast();

	// Fetch debts
	const {
		data: debts,
		isLoading,
		refetch,
	} = useQuery<Debt[]>({
		queryKey: ["/api/debts"],
	});

	// Handle pay now button
	const handlePayNow = (debt: Debt) => {
		navigate(`/pay-debt/${debt.id}`);
	};

	// Filter and sort debts
	const filteredDebts = debts
		? debts.filter((debt) => {
				// Filter by search query
				if (searchQuery) {
					const query = searchQuery.toLowerCase();
					return (
						debt.meterNumber.toLowerCase().includes(query) ||
						debt.description?.toLowerCase().includes(query) ||
						formatCurrency(debt.amount)
							.toLowerCase()
							.includes(query)
					);
				}

				// Filter by tab
				if (activeTab === "pending") {
					return !debt.isPaid;
				} else if (activeTab === "paid") {
					return debt.isPaid;
				}

				return true; // "all" tab
		  })
		: [];

	// Group debts by meter number
	const groupedDebts: { [key: string]: Debt[] } = {};
	filteredDebts.forEach((debt) => {
		if (!groupedDebts[debt.meterNumber]) {
			groupedDebts[debt.meterNumber] = [];
		}
		groupedDebts[debt.meterNumber].push(debt);
	});

	// Calculate totals
	const pendingTotal = debts
		? debts
				.filter((debt) => !debt.isPaid)
				.reduce(
					(sum, debt) => sum + parseFloat(debt.amount.toString()),
					0
				)
		: 0;

	const paidTotal = debts
		? debts
				.filter((debt) => debt.isPaid)
				.reduce(
					(sum, debt) => sum + parseFloat(debt.amount.toString()),
					0
				)
		: 0;

	return (
		<div className="slide-in px-4 pt-4 pb-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold">الديون المستحقة</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => refetch()}
					className="h-8 w-8">
					<RefreshCcwIcon className="h-4 w-4" />
				</Button>
			</div>

			{/* Search and filters */}
			<div className="mb-4 relative">
				<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
				<Input
					type="text"
					placeholder="ابحث عن اسم العداد او الرقم ..."
					className="pl-9"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{/* Pay All Button (Show only when pending debts exist) */}
			{pendingTotal > 0 && activeTab === "pending" && (
				<Card className="mb-4 bg-gradient-to-r from-primary-50 to-blue-50 border-primary/20">
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<div>
								<h3 className="text-lg font-semibold mb-1">
									دفع جميع الديون
								</h3>
								<p className="text-sm text-gray-500">
									دفع جميع الديون المستحقة مر واحدة
								</p>
							</div>
							<div className="text-right">
								<p className="text-lg font-bold !text-left">
									{formatCurrency(pendingTotal)}
								</p>
								<Button
									className="mt-2 bg-gradient-to-r from-primary to-indigo-600"
									onClick={() => {
										// Get all the pending debts
										const pendingDebts =
											debts?.filter(
												(debt) => !debt.isPaid
											) || [];
										// Navigate to the pay all debts page
										if (pendingDebts.length > 0) {
											navigate(
												`/pay-debt?type=all&amount=${pendingTotal}`
											);
										} else {
											toast({
												title: "No pending debts",
												description:
													"You don't have any pending debts to pay",
												variant: "destructive",
											});
										}
									}}>
									ادفع الان
									<ArrowLeftIcon className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Stats cards */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<Card
					className={`${
						activeTab === "pending"
							? "border-amber-200 bg-amber-50"
							: ""
					}`}>
					<CardContent className="p-3">
						<p className="text-sm text-gray-500">المعلقة</p>
						<p className="text-xl font-semibold">
							{formatCurrency(pendingTotal)}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{debts?.filter((debt) => !debt.isPaid).length || 0}{" "}
							فواتير مستحقة
						</p>
					</CardContent>
				</Card>
				<Card
					className={`${
						activeTab === "paid"
							? "border-green-200 bg-green-50"
							: ""
					}`}>
					<CardContent className="p-3">
						<p className="text-sm text-gray-500">المدفوعة</p>
						<p className="text-xl font-semibold">
							{formatCurrency(paidTotal)}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{debts?.filter((debt) => debt.isPaid).length || 0}{" "}
							فواتير مدفوعة
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs
				defaultValue="pending"
				value={activeTab}
				onValueChange={setActiveTab}
				className="mb-2">
				<TabsList className="grid grid-cols-3 w-full">
					<TabsTrigger value="pending">المعلقة</TabsTrigger>
					<TabsTrigger value="paid">المدفوعة</TabsTrigger>
					<TabsTrigger value="all">الكل</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Debts list */}
			{isLoading ? (
				<div className="py-12 flex flex-col items-center">
					<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
					<p className="text-gray-500">تحميل الفواتير ...</p>
				</div>
			) : filteredDebts.length === 0 ? (
				<div className="py-12 text-center">
					{searchQuery ? (
						<>
							<SearchIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
							<p className="text-gray-500 mb-2">
								لا يوجد فواتير تتوافق مع البحث
							</p>
							<Button
								variant="outline"
								onClick={() => setSearchQuery("")}>
								تنظيف البحث
							</Button>
						</>
					) : activeTab === "pending" ? (
						<>
							<div className="bg-green-100 mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3">
								<CheckCircleIcon className="h-8 w-8 text-green-600" />
							</div>
							<p className="text-gray-800 font-medium mb-1 !text-center">
								لا يوجد ديون مستحقة
							</p>
							<p className="text-gray-500 mb-5 !text-center">
								لا يوجد لديك اي ديون مستحقة
							</p>
						</>
					) : activeTab === "paid" ? (
						<>
							<AlertTriangleIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
							<p className="text-gray-500 !text-center">
								لم يتم العثور على ديون مستحقة
							</p>
						</>
					) : (
						<>
							<AlertTriangleIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
							<p className="text-gray-500 !text-center">
								لم يتم العثور على ديون مستحقة
							</p>
						</>
					)}
				</div>
			) : (
				<div>
					{Object.entries(groupedDebts).map(
						([meterNumber, meterDebts]) => (
							<div key={meterNumber} className="mb-4">
								<h3 className="text-sm font-medium text-gray-500 mb-2">
									العداد: {meterNumber}
								</h3>
								<div>
									{meterDebts.map((debt) => (
										<DebtCard
											key={debt.id}
											debt={debt}
											onPayNow={handlePayNow}
										/>
									))}
								</div>
							</div>
						)
					)}
				</div>
			)}
		</div>
	);
};

export default DebtsScreen;
