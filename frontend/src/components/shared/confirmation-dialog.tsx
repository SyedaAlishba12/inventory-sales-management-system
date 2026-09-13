"use client"; 
 
import { AlertTriangle } from "lucide-react"; 
 
import { Button } from "@/components/ui/button"; 
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog"; 
 
interface ConfirmationDialogProps { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirm: () => void | Promise<void>; 
  title: string; 
  description: string; 
  confirmLabel?: string; 
  cancelLabel?: string; 
  destructive?: boolean; 
  loading?: boolean; 
} 
 
export function ConfirmationDialog({ 
  cancelLabel = "Cancel", 
  confirmLabel = "Confirm", 
  description, 
  destructive = false, 
  loading = false, 
  onConfirm, 
  onOpenChange, 
  open, 
  title, 
}: ConfirmationDialogProps) { 
  return ( 
    <Dialog open={open} onOpenChange={onOpenChange}> 
      <DialogContent className="max-w-md"> 
        <DialogHeader> 
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-[#E67E72]/15 text-[#E67E72]"> 
            <AlertTriangle className="size-5" /> 
          </div> 
          <DialogTitle>{title}</DialogTitle> 
          <DialogDescription>{description}</DialogDescription> 
        </DialogHeader> 
        <DialogFooter> 
          <DialogClose asChild> 
            <Button variant="outline" disabled={loading}>{cancelLabel}</Button> 
          </DialogClose> 
          <Button variant={destructive ? "destructive" : "default"} disabled={loading} onClick={onConfirm}> 
            {loading ? "Please wait..." : confirmLabel} 
          </Button> 
        </DialogFooter> 
      </DialogContent> 
    </Dialog> 
  ); 
} 