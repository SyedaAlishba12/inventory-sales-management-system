"use client"; 
 
import type { ReactNode } from "react"; 
 
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog"; 
 
interface ModalProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  title: string; 
  description?: string; 
  children: ReactNode; 
  footer?: ReactNode; 
  size?: "sm" | "md" | "lg"; 
} 
 
const sizeClasses = { 
  sm: "max-w-sm", 
  md: "max-w-lg", 
  lg: "max-w-2xl", 
}; 
 
export function Modal({ 
  children, 
  description, 
  footer, 
  onOpenChange, 
  open, 
  size = "md", 
  title, 
}: ModalProps) { 
  return ( 
    <Dialog open={open} onOpenChange={onOpenChange}> 
      <DialogContent className={sizeClasses[size]}> 
        <DialogHeader> 
          <DialogTitle>{title}</DialogTitle> 
          {description ? <DialogDescription>{description}</DialogDescription> : null} 
        </DialogHeader> 
        <div>{children}</div> 
        {footer ? <DialogFooter>{footer}</DialogFooter> : null} 
      </DialogContent> 
    </Dialog> 
  ); 
} 