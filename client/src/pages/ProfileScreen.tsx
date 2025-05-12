import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	UserIcon,
	CreditCardIcon,
	HomeIcon,
	LockIcon,
	HelpCircleIcon,
	LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User } from "@shared/schema";

const ProfileScreen = () => {
	// In a real app this would fetch the current user's profile
	const { data: user, isLoading } = useQuery<User>({
		queryKey: ["/api/user/profile"],
	});

	// Default username if not available
	const username = user?.username || "User";
	const initials = username.charAt(0).toUpperCase();

	return (
		<div className="slide-in px-4 pt-4">
			<h2 className="text-xl font-semibold mb-4">حسابي</h2>

			<Card className="mb-4">
				<CardContent className="p-4 flex items-center">
					<Avatar className="h-16 w-16 mr-4">
						<AvatarFallback className="bg-primary text-primary-foreground text-xl">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="font-semibold text-lg">
							{isLoading ? "تحميل ..." : username}
						</h3>
						<p className="text-gray-500">
							{isLoading
								? "تحميل ..."
								: user?.username || "user@example.com"}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="space-y-1">
						<Button
							variant="ghost"
							className="w-full justify-start py-6">
							<UserIcon className="h-5 w-5 mr-3 text-gray-500" />
							<span>المعلومات الشخصية</span>
						</Button>
						<Separator />

						<Button
							variant="ghost"
							className="w-full justify-start py-6">
							<CreditCardIcon className="h-5 w-5 mr-3 text-gray-500" />
							<span>طريق الدفع</span>
						</Button>
						<Separator />

						<Button
							variant="ghost"
							className="w-full justify-start py-6">
							<HomeIcon className="h-5 w-5 mr-3 text-gray-500" />
							<span>العدادات</span>
						</Button>
						<Separator />

						<Button
							variant="ghost"
							className="w-full justify-start py-6">
							<LockIcon className="h-5 w-5 mr-3 text-gray-500" />
							<span>اعدادات الامان</span>
						</Button>
						<Separator />

						<Button
							variant="ghost"
							className="w-full justify-start py-6">
							<HelpCircleIcon className="h-5 w-5 mr-3 text-gray-500" />
							<span>الدعم والمساعدة</span>
						</Button>
						<Separator />

						<Button
							variant="ghost"
							className="w-full justify-start py-6 text-red-500">
							<LogOutIcon className="h-5 w-5 mr-3" />
							<span>خروج</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ProfileScreen;
