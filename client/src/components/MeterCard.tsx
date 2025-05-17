import { Card } from "@/components/ui/card";
import { Meter } from "@shared/schema";

interface MeterCardProps {
	meter: Meter;
	onSelect: (meter: Meter) => void;
	className?: string;
}

const MeterCard = ({ meter, onSelect, className = "" }: MeterCardProps) => {
	return (
		<button
			onClick={() => onSelect(meter)}
			className={`flex-shrink-0 bg-gray-100 px-3 py-2 rounded-md border border-gray-200 text-sm ${className}`}>
			<span className="font-medium">{meter.nickname || "Meter"}</span>
			<div className="text-xs text-gray-500">{meter.meterNumber}</div>
		</button>
	);
};

export default MeterCard;
