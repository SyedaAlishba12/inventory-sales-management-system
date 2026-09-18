"use client";

import { useState } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/utils/api-client";
import { toastUtils } from "@/utils/toast";

interface InvoiceActionsProps {
  disabled: boolean;
  saleId: string;
  invoiceNumber?: string;
  onBack: () => void;
}

export function InvoiceActions({ disabled, saleId, invoiceNumber, onBack }: InvoiceActionsProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await apiClient.getBlob(`/api/sales/${saleId}/invoice/pdf`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNumber || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toastUtils.error(error, "Could not download the invoice PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="size-4" /> Back to Sales
      </Button>
      <Button variant="outline" onClick={() => window.print()} disabled={disabled}>
        <Printer className="size-4" /> Print
      </Button>
      <Button onClick={handleDownload} disabled={disabled || downloading}>
        <Download className="size-4" /> {downloading ? "Downloading..." : "Download PDF"}
      </Button>
    </div>
  );
}
