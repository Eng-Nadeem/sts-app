import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Gauge,
	TagIcon,
	DollarSignIcon,
	CreditCardIcon,
	SmartphoneIcon,
	ChevronRightIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { validateMeterNumber, validateAmount } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
	meterNumber: z
		.string()
		.min(11, "Meter number must be 11 digits")
		.max(11, "Meter number must be 11 digits")
		.regex(/^\d+$/, "Meter number must contain only digits"),
	nickname: z.string().optional(),
	amount: z.coerce
		.number()
		.min(5, "Amount must be at least $5")
		.max(1000, "Amount cannot exceed $1000"),
	paymentMethod: z.enum(["card", "mobile"]),
});

type FormData = z.infer<typeof formSchema>;

const PRESET_AMOUNTS = [10, 20, 50];

const RechargeScreen = () => {
	const [, navigate] = useLocation();
	const [presetAmount, setPresetAmount] = useState<number | null>(null);
	const { toast } = useToast();

	// Get query parameters
	const params = new URLSearchParams(window.location.search);
	const meterId = params.get("meterId");
	const meterNumber = params.get("meterNumber") || "";
	const nickname = params.get("nickname") || "";

	// Fetch meter details if meterId is provided
	const { data: meterData } = useQuery({
		queryKey: ["/api/meters", meterId],
		enabled: !!meterId,
	});

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			meterNumber: meterNumber,
			nickname: nickname,
			amount: 0,
			paymentMethod: "card",
		},
	});

	// Use meter data from API if available
	// useEffect(() => {
	//   if (meterData) {
	//     form.setValue('meterNumber', meterData.meterNumber);
	//     form.setValue('nickname', meterData.nickname || '');
	//   }
	// }, [meterData, form]);

	// Handle preset amount selection
	const handlePresetAmountClick = (amount: number) => {
		setPresetAmount(amount);
		form.setValue("amount", amount, { shouldValidate: true });
	};

	const onSubmit = async (data: FormData) => {
		try {
			// Create meter if it doesn't exist yet
			if (!meterId) {
				await apiRequest("POST", "/api/meters", {
					meterNumber: data.meterNumber,
					nickname: data.nickname,
				});
			}

			// Navigate to payment confirmation
			navigate(
				`/payment-confirmation?meterNumber=${
					data.meterNumber
				}&nickname=${data.nickname || ""}&amount=${
					data.amount
				}&paymentMethod=${data.paymentMethod}`
			);
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description:
					"Failed to save meter information. Please try again.",
			});
		}
	};

	return (
		<div className="slide-in px-4 pt-4">
			<Card>
				<CardContent className="p-4">
					<h2 className="text-lg font-semibold mb-4">شحن العداد</h2>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4">
							{/* Meter Number Input */}
							<FormField
								control={form.control}
								name="meterNumber"
								render={({ field }) => (
									<FormItem>
										<FormLabel>رقم العداد</FormLabel>
										<div className="relative">
											<Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
											<FormControl>
												<Input
													{...field}
													placeholder="ادخل رقم العداد المكون من 3 ارقام"
													className={`pl-10 ${
														!validateMeterNumber(
															field.value
														) && field.value
															? "border-error"
															: ""
													}`}
													inputMode="numeric"
												/>
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Meter Nickname */}
							<FormField
								control={form.control}
								name="nickname"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											اسم العداد (اختياري)
										</FormLabel>
										<div className="relative">
											<TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
											<FormControl>
												<Input
													{...field}
													placeholder="المنزل ، المكتب ، المتجر"
													className="pl-10"
												/>
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Amount Selection */}
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>الكمية</FormLabel>
										<div className="grid grid-cols-3 gap-2 mb-2">
											{PRESET_AMOUNTS.map((amount) => (
												<Button
													key={amount}
													type="button"
													variant={
														presetAmount === amount
															? "default"
															: "outline"
													}
													onClick={() =>
														handlePresetAmountClick(
															amount
														)
													}
													className={
														presetAmount === amount
															? "bg-blue-100 border-primary text-primary"
															: ""
													}>
													${amount}
												</Button>
											))}
										</div>
										<div className="relative">
											<DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
											<FormControl>
												<Input
													{...field}
													value={field.value || ""}
													onChange={(e) => {
														const value =
															e.target.value ===
															""
																? ""
																: e.target
																		.value;
														field.onChange(value);
														setPresetAmount(null);
													}}
													placeholder="ادخل قيمة الشحن"
													className={`pl-10 ${
														!validateAmount(
															field.value
														) && field.value
															? "border-error"
															: ""
													}`}
													inputMode="decimal"
												/>
											</FormControl>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Payment Method */}
							<FormField
								control={form.control}
								name="paymentMethod"
								render={({ field }) => (
									<FormItem>
										<FormLabel>طريقة الدفع</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="space-y-2">
												<div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center">
													<RadioGroupItem
														value="card"
														id="card-payment"
														className="mr-3"
													/>
													<Label
														htmlFor="card-payment"
														className="flex-1 flex items-center cursor-pointer">
														<CreditCardIcon className="h-4 w-4 mr-2 text-gray-700" />
														<span>
															بطاقة ائتمان/خصم
														</span>
													</Label>
													<ChevronRightIcon className="h-4 w-4 text-gray-400" />
												</div>

												<div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center">
													<RadioGroupItem
														value="mobile"
														id="mobile-money"
														className="mr-3"
													/>
													<Label
														htmlFor="mobile-money"
														className="flex-1 flex items-center cursor-pointer">
														<SmartphoneIcon className="h-4 w-4 mr-2 text-gray-700" />
														<span>موبايل موني</span>
													</Label>
													<ChevronRightIcon className="h-4 w-4 text-gray-400" />
												</div>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full">
								اكمال الدفع
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default RechargeScreen;
