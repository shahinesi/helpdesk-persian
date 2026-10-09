import { __ } from "@/translation";
import { formatLocalizedDigits } from "@/utils/number";

export function formatTimeHMS(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let formattedTime = "";

  if (days > 0) {
    formattedTime += ` ${formatLocalizedDigits(days)} ${
      days === 1 ? __("day") : __("days")
    }`;
  }

  if (hours > 0) {
    formattedTime += ` ${formatLocalizedDigits(hours)} ${
      hours === 1 ? __("hour") : __("hours")
    }`;
  }

  if (minutes > 0) {
    formattedTime += ` ${formatLocalizedDigits(minutes)} ${
      minutes === 1 ? __("minute") : __("minutes")
    }`;
  }

  if (remainingSeconds > 0) {
    formattedTime += ` ${formatLocalizedDigits(remainingSeconds)} ${
      remainingSeconds === 1 ? __("second") : __("seconds")
    }`;
  }

  return formattedTime.trim();
}
