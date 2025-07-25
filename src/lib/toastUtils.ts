import { toast } from "@/hooks/use-toast";

export function showErrorToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "destructive",
  });
}

export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "default",
  });
}

export function showInfoToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "info",
  });
} 