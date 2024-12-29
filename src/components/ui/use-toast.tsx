import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import {
  useToast as useToastOriginal,
  ToastActionElement as ToastActionElementOriginal,
} from "@/components/ui/use-toast-primitive"

export { Toast, ToastActionElement }
export type { ToastProps }
export const useToast = useToastOriginal 