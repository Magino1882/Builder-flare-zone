export type TimeFormat = "12h" | "24h";

// Convert 24h format (HH:MM) to 12h format (h:MM AM/PM)
export function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Convert 12h format (h:MM AM/PM) to 24h format (HH:MM)
export function convertTo24Hour(time12: string): string {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12; // Return original if format doesn't match

  const [, hoursStr, minutes, period] = match;
  let hours = parseInt(hoursStr);

  if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  } else if (period.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

// Format time based on user preference
export function formatTime(time24: string, format: TimeFormat): string {
  if (format === "12h") {
    return convertTo12Hour(time24);
  }
  return time24;
}

// Format current time based on user preference
export function formatCurrentTime(format: TimeFormat): string {
  const now = new Date();
  const hours24 = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const time24 = `${hours24}:${minutes}`;

  return formatTime(time24, format);
}

// Parse time input and convert to 24h format for storage
export function parseTimeInput(
  input: string,
  currentFormat: TimeFormat,
): string {
  if (currentFormat === "12h") {
    return convertTo24Hour(input);
  }
  return input;
}

// Validate time format
export function isValidTimeFormat(time: string, format: TimeFormat): boolean {
  if (format === "24h") {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  } else {
    return /^(1[0-2]|[1-9]):[0-5][0-9]\s*(AM|PM)$/i.test(time);
  }
}

// Get time input placeholder based on format
export function getTimePlaceholder(format: TimeFormat): string {
  return format === "24h" ? "HH:MM" : "h:MM AM/PM";
}

// Get time input type based on format
export function getTimeInputType(format: TimeFormat): string {
  return format === "24h" ? "time" : "text";
}
