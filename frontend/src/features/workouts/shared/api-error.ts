import { isAxiosError } from "axios";

// Turns any failed request into an Error the UI can show as is.
// A 4xx message is written for the user ("Plan not found.", "Plan name is required.");
// a 5xx one is only "Internal server error", so the fallback text reads better.
export function toApiError(error: unknown, fallback: string): Error
{
    if (isAxiosError<{ message?: string }>(error)) {
        const status = error.response?.status ?? 0
        const message = error.response?.data?.message
        if (status >= 400 && status < 500 && message)
            return new Error(message);
    }
    return new Error(fallback);
}
