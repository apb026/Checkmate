import { TriangleAlert } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-destructive mt-2">
      <TriangleAlert className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
