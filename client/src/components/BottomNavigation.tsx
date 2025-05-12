import { Link, useLocation } from "wouter";
import {
	HomeIcon,
	HistoryIcon,
	UserIcon,
	BoltIcon,
	WalletIcon,
	AlertTriangleIcon,
} from "lucide-react";

const BottomNavigation = () => {
	const [location] = useLocation();

	const isActive = (path: string) => {
		return location === path;
	};

	return (
		<nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
			<div className="flex justify-around">
				<Link href="/">
					<div
						className={`flex flex-col items-center py-2 px-2 ${
							isActive("/") ? "text-primary" : "text-gray-500"
						}`}>
						<HomeIcon className="h-5 w-5" />
						<span className="text-xs mt-1">الرئيسية</span>
					</div>
				</Link>
				<Link href="/meters">
					<div
						className={`flex flex-col items-center py-2 px-2 ${
							isActive("/meters")
								? "text-primary"
								: "text-gray-500"
						}`}>
						<BoltIcon className="h-5 w-5" />
						<span className="text-xs mt-1">العدادات</span>
					</div>
				</Link>
				<Link href="/wallet">
					<div
						className={`flex flex-col items-center py-2 px-2 ${
							isActive("/wallet")
								? "text-primary"
								: "text-gray-500"
						}`}>
						<WalletIcon className="h-5 w-5" />
						<span className="text-xs mt-1">المحفظة</span>
					</div>
				</Link>
				<Link href="/debts">
					<div
						className={`flex flex-col items-center py-2 px-2 ${
							isActive("/debts")
								? "text-primary"
								: "text-gray-500"
						}`}>
						<AlertTriangleIcon className="h-5 w-5" />
						<span className="text-xs mt-1">الديون</span>
					</div>
				</Link>
				<Link href="/profile">
					<div
						className={`flex flex-col items-center py-2 px-2 ${
							isActive("/profile")
								? "text-primary"
								: "text-gray-500"
						}`}>
						<UserIcon className="h-5 w-5" />
						<span className="text-xs mt-1">الحساب</span>
					</div>
				</Link>
			</div>
		</nav>
	);
};

export default BottomNavigation;
