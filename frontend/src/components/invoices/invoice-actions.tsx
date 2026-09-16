import { ArrowLeft, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InvoiceActionsProps {
  disabled: boolean;
  pdfUrl: string;
  onBack: () => void;
}

export function InvoiceActions({ disabled, pdfUrl, onBack }: InvoiceActionsProps) {
  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="size-4" /> Back to Sales
      </Button>
      <Button variant="outline" onClick={() => window.print()} disabled={disabled}>
        <Printer className="size-4" /> Print
      </Button>
      <Button asChild disabled={disabled}>
        <a href={pdfUrl} target="_blank" rel="noreferrer">
          <Download className="size-4" /> Download PDF
        </a>
      </Button>
    </div>
  );
}
