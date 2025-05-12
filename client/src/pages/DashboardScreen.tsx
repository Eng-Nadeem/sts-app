import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
	PlusCircleIcon,
	WalletIcon,
	AlertTriangleIcon,
	LightbulbIcon,
	ReceiptIcon,
	ArrowRightCircleIcon,
	MapPinIcon,
	PhoneIcon,
	UserCogIcon,
	CreditCardIcon,
	BellIcon,
	BadgeCheckIcon,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MeterCard from "@/components/MeterCard";
import TransactionCard from "@/components/TransactionCard";
import { formatCurrency } from "@/lib/utils";
import { Meter, Transaction, Debt, User } from "@shared/schema";
// import React from "react";
interface QuickActionButtonProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	onClick: () => void;
	color?: string;
}

const QuickActionButton = ({
	icon,
	title,
	description,
	onClick,
	color = "from-blue-100 to-indigo-50",
}: QuickActionButtonProps) => (
	<button
		onClick={onClick}
		className="block w-full rounded-xl overflow-hidden border-0 hover:scale-[1.02] transition-all duration-300 card-shadow hover:shadow-md">
		<div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-primary"></div>
		<div className="flex items-center p-4 bg-gradient-to-br from-white to-gray-50">
			<div
				className={`h-14 w-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mr-4 shadow-sm border border-white/80`}>
				{icon}
			</div>
			<div className="text-left">
				<h3 className="font-medium text-sm mb-1 text-gradient">
					{title}
				</h3>
				<p className="text-xs text-gray-500">{description}</p>
			</div>
		</div>
	</button>
);

const DashboardScreen = () => {
	const [, navigate] = useLocation();

	const { data: recentMeters, isLoading: isMetersLoading } = useQuery<
		Meter[]
	>({
		queryKey: ["/api/meters/recent"],
	});

	const { data: recentTransactions, isLoading: isTransactionsLoading } =
		useQuery<Transaction[]>({
			queryKey: ["/api/transactions/recent"],
		});

	const { data: stats, isLoading: isStatsLoading } = useQuery<{
		totalSpent: number;
		transactionCount: number;
	}>({
		queryKey: ["/api/transactions/stats"],
	});

	const { data: walletData } = useQuery<{ balance: number }>({
		queryKey: ["/api/wallet"],
	});

	const { data: debts } = useQuery<Debt[]>({
		queryKey: ["/api/debts"],
	});

	const { data: userProfile } = useQuery<User>({
		queryKey: ["/api/user/profile"],
	});

	const handleMeterSelect = (meter: Meter) => {
		navigate(
			`/recharge?meterId=${meter.id}&meterNumber=${
				meter.meterNumber
			}&nickname=${meter.nickname || ""}`
		);
	};

	const pendingDebtsCount =
		debts?.filter((debt) => !debt.isPaid)?.length || 0;
	const walletBalance = walletData?.balance || 0;

	// Hello message based on the time
	function Greeting() {
		const hour = new Date().getHours();
		const message = hour < 12 ? "يسعد صباحك" : "يسعد مساك";
		return message;
	}

	return (
		<div className="slide-in px-4 pt-4 pb-8">
			{/* Welcome Card */}
			<Card className="mb-5 overflow-hidden card-shadow-lg border-0">
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700"></div>
					<div className="absolute inset-0 opacity-10 bg-pattern-dots"></div>
					<div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
					<div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10"></div>
					<CardContent className="p-6 relative text-white">
						<h2 className="text-xl font-bold mb-1">
							اهلا وسهلا
							{userProfile?.fullName
								? `, ${userProfile.fullName.split(" ")[0]}`
								: ""}
							!
						</h2>
						<p className="text-sm text-white/90 mb-5">
							{Greeting() + " ," + `كيف بتحب اساعدك اليوم!`}
						</p>

						<div className="flex flex-wrap gap-2">
							<Button
								size="sm"
								className="bg-white/25 hover:bg-white/40 text-white border-0 shadow-sm hover:shadow-md transition-all rounded-lg"
								onClick={() => navigate("/recharge")}>
								<LightbulbIcon className="h-4 w-4 mr-2" />
								الشحن السريع
							</Button>
							<Button
								size="sm"
								className="bg-white/25 hover:bg-white/40 text-white border-0 shadow-sm hover:shadow-md transition-all rounded-lg"
								onClick={() => navigate("/wallet")}>
								<WalletIcon className="h-4 w-4 mr-2" />
								عرض المحفظة
							</Button>
							{pendingDebtsCount > 0 && (
								<Button
									size="sm"
									className="bg-amber-500/80 hover:bg-amber-500/100 text-white border-0 shadow-sm hover:shadow-md transition-all rounded-lg"
									onClick={() => navigate("/debts")}>
									<AlertTriangleIcon className="h-4 w-4 mr-2" />
									دفع المستحقات ({pendingDebtsCount})
								</Button>
							)}
						</div>
					</CardContent>
				</div>
			</Card>

			{/* Quick Actions & Stats */}
			<div className="grid grid-cols-2 gap-4 mb-5">
				<Card className="col-span-1 border-0 card-shadow overflow-hidden">
					<div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500"></div>
					<CardContent className="p-5 bg-gradient-to-br from-white to-green-50">
						<div className="flex items-center gap-2 mb-2">
							<WalletIcon className="h-4 w-4 text-green-600" />
							<p className="text-sm font-medium text-gray-700">
								رصيد المحفظة
							</p>
						</div>
						<p className="text-2xl font-semibold text-gradient-green mb-1">
							{formatCurrency(walletBalance)}
						</p>
						<div className="mt-3">
							<Button
								className="w-full btn-gradient-green border-0"
								size="sm"
								onClick={() => navigate("/wallet")}>
								<PlusCircleIcon className="h-4 w-4 mr-2" />
								اعادة الشحن
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-1 border-0 card-shadow overflow-hidden">
					<div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
					<CardContent className="p-5 bg-gradient-to-br from-white to-amber-50">
						<div className="flex items-center gap-2 mb-2">
							<AlertTriangleIcon className="h-4 w-4 text-amber-600" />
							<p className="text-sm font-medium text-gray-700">
								الديون المستحقة
							</p>
						</div>
						<p className="text-2xl font-semibold mb-1">
							<span
								className={
									pendingDebtsCount > 0
										? "text-gradient-orange"
										: "text-gray-600"
								}>
								{pendingDebtsCount}
							</span>
						</p>
						<div className="mt-3">
							<Button
								className={`w-full border-0 ${
									pendingDebtsCount > 0
										? "btn-gradient-orange"
										: "bg-gray-200 text-gray-600 hover:bg-gray-300"
								}`}
								size="sm"
								onClick={() => navigate("/debts")}>
								{pendingDebtsCount > 0 ? (
									<>
										<CreditCardIcon className="h-4 w-4 mr-2" />
										دفع الان!
									</>
								) : (
									<>
										<BadgeCheckIcon className="h-4 w-4 mr-2" />
										لا يوجد ديون
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<h2 className="text-lg font-semibold mb-3">الاجراءات السريعة</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
				<QuickActionButton
					icon={<LightbulbIcon className="h-6 w-6 text-primary" />}
					title="شحن كهرباء"
					description="اعادة شحن العداد الخاص بك"
					onClick={() => navigate("/recharge")}
				/>

				<QuickActionButton
					icon={
						<AlertTriangleIcon className="h-6 w-6 text-amber-500" />
					}
					title="دفع الديون"
					description="دفع الديون المستحقة عليك"
					onClick={() => navigate("/debts")}
					color="from-amber-100 to-yellow-50"
				/>

				<QuickActionButton
					icon={<WalletIcon className="h-6 w-6 text-green-600" />}
					title="ادارة المحفظة"
					description="اضافة رصيد الى محفظتك"
					onClick={() => navigate("/wallet")}
					color="from-green-100 to-emerald-50"
				/>

				<QuickActionButton
					icon={<ReceiptIcon className="h-6 w-6 text-blue-600" />}
					title="تاريخ المعاملات"
					description="عرض المعاملات الاخيرة"
					onClick={() => navigate("/history")}
					color="from-blue-100 to-sky-50"
				/>
			</div>

			{/* Quick Recharge */}
			<Card className="mb-5 border-0 card-shadow overflow-hidden">
				<div className="h-1.5 bg-gradient-to-r from-indigo-600 to-primary"></div>
				<CardHeader className="pb-0">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg text-gradient-purple">
							العدادات الخاصة بي
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/meters")}
							className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
							عرض الكل
						</Button>
					</div>
					<CardDescription>
						اختر العداد الذي تريد شحنه
					</CardDescription>
				</CardHeader>

				<CardContent className="p-5">
					{/* Recent Meters */}
					<div className="flex overflow-x-auto pb-2 gap-3">
						{isMetersLoading ? (
							<div className="py-8 px-4 text-center w-full">
								<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
								<p className="text-sm text-gray-500">
									تحميل العداد الخاص بك ...
								</p>
							</div>
						) : recentMeters && recentMeters.length > 0 ? (
							recentMeters.map((meter) => (
								<MeterCard
									key={meter.id}
									meter={meter}
									onSelect={handleMeterSelect}
									className="min-w-[200px] card-shadow hover:shadow-md transition-all"
								/>
							))
						) : (
							<div className="py-8 px-4 text-center w-full bg-gray-50/50 rounded-xl border border-gray-100">
								<PlusCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
								<p className="text-sm text-gray-500 mb-4">
									لا يوجد عدادات تم اضافتها لحد الأن
								</p>
								<Button
									onClick={() => navigate("/meters")}
									className="btn-gradient">
									<PlusCircleIcon className="mr-2 h-4 w-4" />
									اضافة العداد الأول لك
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Recent Transactions */}
			<Card className="mb-5 border-0 card-shadow overflow-hidden">
				<div className="h-1.5 bg-gradient-to-r from-teal-500 to-blue-500"></div>
				<CardHeader className="pb-0">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg text-gradient-teal">
							المعاملات الأخيرة
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/history")}
							className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
							عرض الكل
						</Button>
					</div>
					<CardDescription>
						معاملاتك الأخيرة من الكهرباء والديون
					</CardDescription>
				</CardHeader>

				<CardContent className="p-5">
					<div className="space-y-3">
						{isTransactionsLoading ? (
							<div className="py-8 px-4 text-center">
								<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
								<p className="text-sm text-gray-500">
									تحميل المعاملات الاخيرة ...
								</p>
							</div>
						) : recentTransactions &&
						  recentTransactions.length > 0 ? (
							recentTransactions.map((transaction) => (
								<TransactionCard
									key={transaction.id}
									transaction={transaction}
									className="card-shadow hover:shadow-md transition-all border border-gray-100 rounded-xl"
								/>
							))
						) : (
							<div className="py-8 text-center bg-gray-50/50 rounded-xl border border-gray-100">
								<ReceiptIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
								<p className="text-sm text-gray-500 mb-3">
									لم يتم إجراء أي معاملات بعد
								</p>
								<Button
									onClick={() => navigate("/recharge")}
									className="btn-gradient">
									<LightbulbIcon className="mr-2 h-4 w-4" />
									قم بإجراء أول عملية شراء
								</Button>
							</div>
						)}
					</div>
				</CardContent>

				{recentTransactions && recentTransactions.length > 0 && (
					<CardFooter className="pt-0 pb-5 px-5">
						<Button
							variant="outline"
							className="w-full border-blue-100 hover:bg-blue-50 text-blue-600"
							onClick={() => navigate("/history")}>
							عرض جميع المعاملات
							<ArrowRightCircleIcon
								className="ml-2 h-4 w-4"
								style={{ transform: "rotateY(180deg)" }}
							/>
						</Button>
					</CardFooter>
				)}
			</Card>

			{/* Client Information */}
			<Card className="mb-4 border-0 card-shadow overflow-hidden">
				<div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-center">
						<CardTitle className="text-lg text-gradient-orange">
							معلومات المشترك
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/profile")}
							className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
							<UserCogIcon className="h-4 w-4 mr-1" />
							تعديل الملف الشخصي
						</Button>
					</div>
					<CardDescription>معلومات الحساب الشخصي</CardDescription>
				</CardHeader>

				<CardContent className="p-5">
					<div className="grid grid-cols-1 gap-4">
						<div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 card-shadow">
							<Avatar className="h-12 w-12 mr-4 border-2 border-primary/10">
								<AvatarFallback className="bg-gradient-to-r from-primary to-blue-600 text-white font-medium">
									{userProfile?.fullName
										? userProfile.fullName
												.charAt(0)
												.toUpperCase()
										: "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-medium text-gray-800">
									{userProfile?.fullName || "اسم المشترك"}
								</h3>
								<p className="text-sm text-gray-500">
									{userProfile?.email ||
										userProfile?.username ||
										"لا يوجد معلومات شخصية"}
								</p>
							</div>
						</div>

						{userProfile?.address && (
							<div className="p-4 bg-gray-50 rounded-xl border border-gray-100 card-shadow">
								<div className="flex gap-2 items-center mb-2">
									<MapPinIcon className="h-4 w-4 text-primary/80" />
									<p className="text-sm font-medium text-gray-700">
										العنوان
									</p>
								</div>
								<p className="text-sm pl-6">
									{userProfile.address}
								</p>
							</div>
						)}

						{userProfile?.phone && (
							<div className="p-4 bg-gray-50 rounded-xl border border-gray-100 card-shadow">
								<div className="flex gap-2 items-center mb-2">
									<PhoneIcon className="h-4 w-4 text-primary/80" />
									<p className="text-sm font-medium text-gray-700">
										رقم الهاتف
									</p>
								</div>
								<p className="text-sm pl-6">
									{userProfile.phone}
								</p>
							</div>
						)}

						{!userProfile?.fullName &&
							!userProfile?.address &&
							!userProfile?.phone && (
								<div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
									<UserCogIcon className="h-6 w-6 text-primary/60 mx-auto mb-2" />
									<p className="text-sm text-gray-600 mb-3">
										أكمل ملفك الشخصي للوصول إلى جميع الميزات
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate("/profile")}
										className="border-primary/20 text-primary hover:bg-primary/5">
										اكمال الملف الشخصي
									</Button>
								</div>
							)}
					</div>
				</CardContent>
			</Card>

			{/* Monthly Stats */}
			<Card className="mb-4 border-0 card-shadow overflow-hidden">
				<div className="h-1.5 bg-gradient-to-r from-pink-500 to-red-500"></div>
				<CardHeader className="pb-0">
					<CardTitle className="text-lg text-gradient-pink">
						الاحصاءات الشهرية
					</CardTitle>
					<CardDescription>
						نظرة عامة على استهلاكك للكهرباء
					</CardDescription>
				</CardHeader>

				<CardContent className="p-5">
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gradient-to-br from-white to-pink-50 p-4 rounded-lg border border-pink-100 card-shadow">
							<div className="flex items-center gap-2 mb-1">
								<CreditCardIcon className="h-4 w-4 text-pink-600" />
								<p className="text-gray-700 text-sm font-medium">
									إجمالي المبلغ المنفق
								</p>
							</div>
							<p className="text-2xl font-semibold text-gradient-pink">
								{isStatsLoading ? (
									<span className="text-gray-400 text-lg">
										تحميل ...
									</span>
								) : stats ? (
									formatCurrency(stats.totalSpent)
								) : (
									"$0.00"
								)}
							</p>
						</div>
						<div className="bg-gradient-to-br from-white to-pink-50 p-4 rounded-lg border border-pink-100 card-shadow">
							<div className="flex items-center gap-2 mb-1">
								<ReceiptIcon className="h-4 w-4 text-pink-600" />
								<p className="text-gray-700 text-sm font-medium">
									المعاملات
								</p>
							</div>
							<p className="text-2xl font-semibold text-gradient-pink">
								{isStatsLoading ? (
									<span className="text-gray-400 text-lg">
										تحميل ...
									</span>
								) : stats ? (
									stats.transactionCount
								) : (
									"0"
								)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default DashboardScreen;
