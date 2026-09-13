import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react"; 
 
import type { NotificationSummary } from "@/types"; 
import { cn } from "@/utils/cn"; 
import { formatRelativeDate } from "@/utils/date"; 
 
const notificationStyles = { 
  info: { icon: Info, className: "bg-[#70588C]/15 text-[#70588C]" }, 
  success: { icon: CheckCircle2, className: "bg-[#52B788]/15 text-[#52B788]" }, 
  warning: { icon: AlertTriangle, className: "bg-[#E67E72]/15 text-[#E67E72]" }, 
  error: { icon: XCircle, className: "bg-[#E67E72]/15 text-[#E67E72]" }, 
}; 
 
interface NotificationItemProps { 
  notification: NotificationSummary; 
  onClick?: (notification: NotificationSummary) => void; 
} 
 
export function NotificationItem({ notification, onClick }: NotificationItemProps) { 
  const style = notificationStyles[notification.type] || { icon: Bell, className: "bg-[#EAF0F2] text-[#0F4C5C]" }; 
  const Icon = style.icon; 
 
  return ( 
    <button 
      type="button" 
      onClick={() => onClick?.(notification)} 
      className={cn( 
        "flex w-full items-start gap-3 rounded-xl border border-[#D7E0E3] p-4 text-left outline-none transition hover:bg-[#EAF0F2]/60 focus-visible:ring-2 focus-visible:ring-[#78A394]", 
        !notification.isRead && "border-[#78A394]/30 bg-[#78A394]/10", 
      )} 
    > 
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", style.className)}> 
        <Icon className="size-[18px]" /> 
      </span> 
      <span className="min-w-0 flex-1"> 
        <span className="flex items-start justify-between gap-2"> 
          <span className="font-semibold text-[#0F4C5C]">{notification.title}</span> 
          {!notification.isRead ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0F4C5C]" aria-label="Unread" /> : null} 
        </span> 
        <span className="mt-1 block text-sm leading-relaxed text-[#52646A]">{notification.message}</span> 
        <span className="mt-2 block text-xs text-[#7A8B91]">{formatRelativeDate(notification.createdAt)}</span> 
      </span> 
    </button> 
  ); 
} 