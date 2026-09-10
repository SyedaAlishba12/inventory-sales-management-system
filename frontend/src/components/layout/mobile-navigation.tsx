"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SidebarContent } from "@/components/layout/sidebar";
import type { NavigationGroup } from "@/components/layout/navigation";

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigation?: NavigationGroup[];
}

export function MobileNavigation({ navigation, onOpenChange, open }: MobileNavigationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="top-0 left-0 h-dvh w-72 max-w-72 translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 p-0 lg:hidden"
      >
        <DialogTitle className="sr-only">Main navigation</DialogTitle>
        <SidebarContent navigation={navigation} onNavigate={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
