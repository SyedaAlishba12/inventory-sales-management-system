import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/utils/api-error-handler";

export const toastUtils = {
  success(message: string, description?: string) {
    return toast.success(message, { description });
  },
  error(error: unknown, fallback = "Something went wrong") {
    return toast.error(getErrorMessage(error, fallback));
  },
  info(message: string, description?: string) {
    return toast.info(message, { description });
  },
  promise<T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) {
    return toast.promise(promise, messages);
  },
};
