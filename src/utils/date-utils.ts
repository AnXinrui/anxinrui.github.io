const TZ = "Asia/Shanghai";

function getParts(
	date: Date,
	options: { year?: boolean; month?: boolean; day?: boolean; hour?: boolean; minute?: boolean },
) {
	const formatOptions: Intl.DateTimeFormatOptions = {
		timeZone: TZ,
		year: options.year ? "numeric" : undefined,
		month: options.month ? "2-digit" : undefined,
		day: options.day ? "2-digit" : undefined,
		hour: options.hour ? "2-digit" : undefined,
		minute: options.minute ? "2-digit" : undefined,
		hour12: false,
	};

	return Object.fromEntries(
		new Intl.DateTimeFormat("en-US", formatOptions)
			.formatToParts(date)
			.filter((part) => part.type !== "literal")
			.map((part) => [part.type, part.value]),
	) as Record<string, string>;
}

export function formatDateToYYYYMMDD(date: Date): string {
	const { year, month, day } = getParts(date, { year: true, month: true, day: true });
	return `${year}-${month}-${day}`;
}

export function formatDateToMMDD(date: Date): string {
	const { month, day } = getParts(date, { month: true, day: true });
	return `${month}-${day}`;
}

export function formatDateTime(date: Date): string {
	const { year, month, day, hour, minute } = getParts(date, {
		year: true,
		month: true,
		day: true,
		hour: true,
		minute: true,
	});
	return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function getYearInTimeZone(date: Date, timeZone = TZ): number {
	return Number.parseInt(
		new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" }).format(date),
		10,
	);
}
