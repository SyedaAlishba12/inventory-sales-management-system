"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/utils/api-client";
import { getErrorMessage } from "@/utils/api-error-handler";
import type {
  CustomerReportResponse,
  InventoryReportResponse,
  ProductReportResponse,
  PurchaseReportResponse,
  ReportType,
  SalesReportResponse,
  SupplierReportResponse,
} from "@/types";

const reportOptions: Array<{
  value: ReportType;
  label: string;
}> = [
  { value: "sales", label: "Sales" },
  { value: "products", label: "Products" },
  { value: "inventory", label: "Inventory" },
  { value: "customers", label: "Customers" },
  { value: "suppliers", label: "Suppliers" },
  { value: "purchases", label: "Purchases" },
];

const paymentMethods = [
  "CASH",
  "CARD",
  "ONLINE",
];

const saleStatuses = [
  "COMPLETED",
  "PENDING",
  "CANCELLED",
];

function formatCurrency(value: number) {
  return `Rs ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("en-PK");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "COMPLETED" || normalized === "PAID") {
    return "bg-[#52B788]/15 text-[#2F855A]";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "DAMAGED"
  ) {
    return "bg-[#E67E72]/15 text-[#C0564A]";
  }

  return "bg-[#70588C]/15 text-[#70588C]";
}

function getDefaultFileName(
  reportType: ReportType,
  format: "excel" | "pdf",
) {
  const names: Record<ReportType, string> = {
    sales: "sales_report",
    products: "product_sales_report",
    inventory: "inventory_report",
    customers: "customer_report",
    suppliers: "supplier_report",
    purchases: "purchase_report",
  };

  return `${names[reportType]}.${format === "excel" ? "xlsx" : "pdf"}`;
}

export default function ReportsPage() {
  const [reportType, setReportType] =
    useState<ReportType>("sales");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [saleStatus, setSaleStatus] = useState("");

  const [salesReport, setSalesReport] =
    useState<SalesReportResponse | null>(null);

  const [productsReport, setProductsReport] =
    useState<ProductReportResponse | null>(null);

  const [inventoryReport, setInventoryReport] =
    useState<InventoryReportResponse | null>(null);

  const [customersReport, setCustomersReport] =
    useState<CustomerReportResponse | null>(null);

  const [suppliersReport, setSuppliersReport] =
    useState<SupplierReportResponse | null>(null);

  const [purchasesReport, setPurchasesReport] =
    useState<PurchaseReportResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] =
    useState<"excel" | "sales-pdf" | "monthly-pdf" | null>(
      null,
    );
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      setSalesReport(null);
      setProductsReport(null);
      setInventoryReport(null);
      setCustomersReport(null);
      setSuppliersReport(null);
      setPurchasesReport(null);

      switch (reportType) {
        case "sales": {
          const response =
            await apiClient.get<SalesReportResponse>(
              "/api/reports/sales",
              {
                query: {
                  ...query,
                  payment_method:
                    paymentMethod || undefined,
                  status: saleStatus || undefined,
                },
              },
            );

          setSalesReport(response);
          break;
        }

        case "products": {
          const response =
            await apiClient.get<ProductReportResponse>(
              "/api/reports/products",
              {
                query,
              },
            );

          setProductsReport(response);
          break;
        }

        case "inventory": {
          const response =
            await apiClient.get<InventoryReportResponse>(
              "/api/reports/inventory",
            );

          setInventoryReport(response);
          break;
        }

        case "customers": {
          const response =
            await apiClient.get<CustomerReportResponse>(
              "/api/reports/customers",
              {
                query,
              },
            );

          setCustomersReport(response);
          break;
        }

        case "suppliers": {
          const response =
            await apiClient.get<SupplierReportResponse>(
              "/api/reports/suppliers",
              {
                query,
              },
            );

          setSuppliersReport(response);
          break;
        }

        case "purchases": {
          const response =
            await apiClient.get<PurchaseReportResponse>(
              "/api/reports/purchases",
              {
                query,
              },
            );

          setPurchasesReport(response);
          break;
        }
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to load the selected report.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [
    reportType,
    startDate,
    endDate,
    paymentMethod,
    saleStatus,
  ]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  function handleReportTypeChange(
    value: ReportType,
  ) {
    setReportType(value);

    if (value !== "sales") {
      setPaymentMethod("");
      setSaleStatus("");
    }
  }

  function clearFilters() {
    setStartDate("");
    setEndDate("");
    setPaymentMethod("");
    setSaleStatus("");
  }

  const hasFilters =
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(paymentMethod) ||
    Boolean(saleStatus);

  async function downloadFile(
    path: string,
    format: "excel" | "sales-pdf" | "monthly-pdf",
    fallbackName: string,
    query?: Record<string, string | undefined>,
  ) {
    setDownloading(format);

    try {
      const result = await apiClient.getBlob(path, {
        query,
      });

      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download =
        result.filename || fallbackName;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        getErrorMessage(
          downloadError,
          "Unable to download the report.",
        ),
      );
    } finally {
      setDownloading(null);
    }
  }

  function handleExcelExport() {
    const paths: Record<ReportType, string> = {
      sales: "/api/reports/exports/sales/excel",
      products: "/api/reports/exports/products/excel",
      inventory: "/api/reports/exports/inventory/excel",
      customers: "/api/reports/exports/customers/excel",
      suppliers: "/api/reports/exports/suppliers/excel",
      purchases: "/api/reports/exports/purchases/excel",
    };

    const query =
      reportType === "sales"
        ? {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            payment_method:
              paymentMethod || undefined,
            status: saleStatus || undefined,
          }
        : reportType === "inventory"
          ? undefined
          : {
              start_date: startDate || undefined,
              end_date: endDate || undefined,
            };

    void downloadFile(
      paths[reportType],
      "excel",
      getDefaultFileName(
        reportType,
        "excel",
      ),
      query,
    );
  }

  function handleSalesPdfExport() {
    void downloadFile(
      "/api/reports/exports/sales/pdf",
      "sales-pdf",
      "sales_report.pdf",
      {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        payment_method:
          paymentMethod || undefined,
        status: saleStatus || undefined,
      },
    );
  }

  function handleMonthlyPdfExport() {
    void downloadFile(
      "/api/reports/exports/monthly-business/pdf",
      "monthly-pdf",
      "monthly_business_report.pdf",
      {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      },
    );
  }

  const currentRowCount =
    reportType === "sales"
      ? salesReport?.rows.length ?? 0
      : reportType === "products"
        ? productsReport?.rows.length ?? 0
        : reportType === "inventory"
          ? inventoryReport?.rows.length ?? 0
          : reportType === "customers"
            ? customersReport?.rows.length ?? 0
            : reportType === "suppliers"
              ? suppliersReport?.rows.length ?? 0
              : purchasesReport?.rows.length ?? 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Review sales, products, inventory, customers, suppliers, and purchase performance using real business data."
          breadcrumbs={[
            {
              label: "Overview",
              href: "/dashboard",
            },
            {
              label: "Reports",
            },
          ]}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => void loadReport()}
                disabled={loading}
                className="border-[#D7E0E3] bg-white text-[#0F4C5C] hover:bg-[#F3F6F8]"
              >
                <RefreshCw
                  className={`mr-2 size-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                  aria-hidden="true"
                />
                Refresh
              </Button>

              <Button
                onClick={handleExcelExport}
                disabled={downloading !== null}
                className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90"
              >
                <FileSpreadsheet
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                {downloading === "excel"
                  ? "Exporting..."
                  : "Excel"}
              </Button>
            </>
          }
        />

        <Card className="border-[#E2E8F0] bg-white shadow-sm">
          <CardHeader className="border-b border-[#E2E8F0]">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#0F4C5C]">
                  <Filter
                    className="size-5"
                    aria-hidden="true"
                  />
                  Report Filters
                </CardTitle>

                <p className="mt-1 text-sm text-[#64748B]">
                  Select a report and narrow the results
                  using the available filters.
                </p>
              </div>

              {hasFilters ? (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-fit text-[#70588C] hover:bg-[#70588C]/10 hover:text-[#70588C]"
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="report-type"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  Report type
                </label>

                <select
                  id="report-type"
                  value={reportType}
                  onChange={(event) =>
                    handleReportTypeChange(
                      event.target.value as ReportType,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white px-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                >
                  {reportOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="report-start-date"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  From
                </label>

                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />

                  <input
                    id="report-start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white pl-10 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="report-end-date"
                  className="mb-2 block text-sm font-medium text-[#1E293B]"
                >
                  To
                </label>

                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]"
                    aria-hidden="true"
                  />

                  <input
                    id="report-end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white pl-10 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                  />
                </div>
              </div>

              {reportType === "sales" ? (
                <div>
                  <label
                    htmlFor="payment-method"
                    className="mb-2 block text-sm font-medium text-[#1E293B]"
                  >
                    Payment method
                  </label>

                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white px-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                  >
                    <option value="">
                      All payment methods
                    </option>

                    {paymentMethods.map((method) => (
                      <option
                        key={method}
                        value={method}
                      >
                        {formatLabel(method)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="report-status"
                    className="mb-2 block text-sm font-medium text-[#1E293B]"
                  >
                    Report status
                  </label>

                  <div className="flex h-10 items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFB] px-3 text-sm text-[#64748B]">
                    Date filters
                  </div>
                </div>
              )}

              {reportType === "sales" ? (
                <div>
                  <label
                    htmlFor="sale-status"
                    className="mb-2 block text-sm font-medium text-[#1E293B]"
                  >
                    Sale status
                  </label>

                  <select
                    id="sale-status"
                    value={saleStatus}
                    onChange={(event) =>
                      setSaleStatus(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D7E0E3] bg-white px-3 text-sm text-[#1E293B] outline-none transition focus:border-[#78A394] focus:ring-2 focus:ring-[#78A394]/20"
                  >
                    <option value="">
                      All statuses
                    </option>

                    {saleStatuses.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {reportType === "sales" && salesReport ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-[#E2E8F0] bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#64748B]">
                    Total Sales
                  </p>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#52B788]/10 text-[#52B788]">
                    <TrendingUp
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <p className="mt-3 text-2xl font-bold text-[#1E293B]">
                  {formatCurrency(
                    salesReport.summary.total_sales,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0] bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#64748B]">
                    Transactions
                  </p>

                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#70588C]/10 text-[#70588C]">
                    <BarChart3
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <p className="mt-3 text-2xl font-bold text-[#1E293B]">
                  {formatNumber(
                    salesReport.summary.total_transactions,
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0] bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#64748B]">
                    Average Sale
                  </p>

                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C]">
                    <BarChart3
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <p className="mt-3 text-2xl font-bold text-[#1E293B]">
                  {formatCurrency(
                    salesReport.summary.average_sale,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card className="border-[#E2E8F0] bg-white shadow-sm">
          <CardHeader className="border-b border-[#E2E8F0]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle className="text-[#0F4C5C]">
                  {reportOptions.find(
                    (option) =>
                      option.value === reportType,
                  )?.label}{" "}
                  Report
                </CardTitle>

                <p className="mt-1 text-sm text-[#64748B]">
                  {loading
                    ? "Loading report..."
                    : `${currentRowCount} ${
                        currentRowCount === 1
                          ? "record"
                          : "records"
                      } found`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {reportType === "sales" ? (
                  <Button
                    variant="outline"
                    onClick={handleSalesPdfExport}
                    disabled={downloading !== null}
                    className="border-[#D7E0E3] text-[#70588C] hover:bg-[#70588C]/10"
                  >
                    <FileText
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {downloading === "sales-pdf"
                      ? "Exporting..."
                      : "Sales PDF"}
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  onClick={handleMonthlyPdfExport}
                  disabled={downloading !== null}
                  className="border-[#D7E0E3] text-[#0F4C5C] hover:bg-[#F3F6F8]"
                >
                  <Download
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />
                  {downloading === "monthly-pdf"
                    ? "Exporting..."
                    : "Monthly PDF"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-[#64748B]">
                  <RefreshCw
                    className="size-5 animate-spin text-[#0F4C5C]"
                    aria-hidden="true"
                  />
                  Loading report data...
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#E67E72]/10 text-[#E67E72]">
                  <BarChart3
                    className="size-6"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-base font-semibold text-[#1E293B]">
                  Unable to load report
                </h3>

                <p className="mt-1 max-w-md text-sm text-[#64748B]">
                  {error}
                </p>

                <Button
                  variant="outline"
                  onClick={() => void loadReport()}
                  className="mt-4 border-[#D7E0E3]"
                >
                  Try again
                </Button>
              </div>
            ) : currentRowCount === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C]">
                  <BarChart3
                    className="size-6"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-base font-semibold text-[#1E293B]">
                  No report data
                </h3>

                <p className="mt-1 max-w-md text-sm text-[#64748B]">
                  There is no data available for this report
                  with the current filters.
                </p>
              </div>
            ) : (
              <ReportTable
                reportType={reportType}
                salesReport={salesReport}
                productsReport={productsReport}
                inventoryReport={inventoryReport}
                customersReport={customersReport}
                suppliersReport={suppliersReport}
                purchasesReport={purchasesReport}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

interface ReportTableProps {
  reportType: ReportType;
  salesReport: SalesReportResponse | null;
  productsReport: ProductReportResponse | null;
  inventoryReport: InventoryReportResponse | null;
  customersReport: CustomerReportResponse | null;
  suppliersReport: SupplierReportResponse | null;
  purchasesReport: PurchaseReportResponse | null;
}

function ReportTable({
  reportType,
  salesReport,
  productsReport,
  inventoryReport,
  customersReport,
  suppliersReport,
  purchasesReport,
}: ReportTableProps) {
  if (reportType === "sales" && salesReport) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
              <TableHeading>Invoice</TableHeading>
              <TableHeading>Customer</TableHeading>
              <TableHeading>Date</TableHeading>
              <TableHeading>Payment</TableHeading>
              <TableHeading>Status</TableHeading>
              <TableHeading>Subtotal</TableHeading>
              <TableHeading>Discount</TableHeading>
              <TableHeading>Tax</TableHeading>
              <TableHeading>Total</TableHeading>
            </tr>
          </thead>

          <tbody>
            {salesReport.rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <TableCell>
                  <span className="font-semibold text-[#0F4C5C]">
                    {row.invoice_number}
                  </span>
                </TableCell>

                <TableCell>
                  {row.customer_name}
                </TableCell>

                <TableCell>
                  {formatDateTime(row.sale_date)}
                </TableCell>

                <TableCell>
                  {formatLabel(row.payment_method)}
                </TableCell>

                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>

                <TableCell>
                  {formatCurrency(row.subtotal)}
                </TableCell>

                <TableCell>
                  {formatCurrency(row.discount)}
                </TableCell>

                <TableCell>
                  {formatCurrency(row.tax)}
                </TableCell>

                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {formatCurrency(row.total)}
                  </span>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (reportType === "products" && productsReport) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
              <TableHeading>Product</TableHeading>
              <TableHeading>SKU</TableHeading>
              <TableHeading>Quantity Sold</TableHeading>
              <TableHeading>Revenue</TableHeading>
            </tr>
          </thead>

          <tbody>
            {productsReport.rows.map((row) => (
              <tr
                key={row.product_id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {row.product_name}
                  </span>
                </TableCell>

                <TableCell>{row.sku}</TableCell>

                <TableCell>
                  {formatNumber(row.quantity_sold)}
                </TableCell>

                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {formatCurrency(row.revenue)}
                  </span>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (reportType === "inventory" && inventoryReport) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
              <TableHeading>Product</TableHeading>
              <TableHeading>SKU</TableHeading>
              <TableHeading>Current Stock</TableHeading>
              <TableHeading>Opening Stock</TableHeading>
              <TableHeading>Damaged</TableHeading>
              <TableHeading>Minimum Level</TableHeading>
            </tr>
          </thead>

          <tbody>
            {inventoryReport.rows.map((row) => (
              <tr
                key={row.product_id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {row.product_name}
                  </span>
                </TableCell>

                <TableCell>{row.sku}</TableCell>

                <TableCell>
                  <span
                    className={
                      row.current_stock <=
                      row.min_stock_level
                        ? "font-semibold text-[#C0564A]"
                        : "font-semibold text-[#2F855A]"
                    }
                  >
                    {formatNumber(row.current_stock)}
                  </span>
                </TableCell>

                <TableCell>
                  {formatNumber(row.opening_stock)}
                </TableCell>

                <TableCell>
                  {formatNumber(row.damaged_stock)}
                </TableCell>

                <TableCell>
                  {formatNumber(row.min_stock_level)}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (reportType === "customers" && customersReport) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
              <TableHeading>Customer</TableHeading>
              <TableHeading>Phone</TableHeading>
              <TableHeading>Email</TableHeading>
              <TableHeading>Purchases</TableHeading>
              <TableHeading>Total Spending</TableHeading>
            </tr>
          </thead>

          <tbody>
            {customersReport.rows.map((row) => (
              <tr
                key={row.customer_id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {row.customer_name}
                  </span>
                </TableCell>

                <TableCell>
                  {row.phone || "—"}
                </TableCell>

                <TableCell>
                  {row.email || "—"}
                </TableCell>

                <TableCell>
                  {formatNumber(row.total_purchases)}
                </TableCell>

                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {formatCurrency(
                      row.total_spending,
                    )}
                  </span>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (reportType === "suppliers" && suppliersReport) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
              <TableHeading>Supplier</TableHeading>
              <TableHeading>Purchases</TableHeading>
              <TableHeading>Total Purchase Amount</TableHeading>
              <TableHeading>Pending Amount</TableHeading>
            </tr>
          </thead>

          <tbody>
            {suppliersReport.rows.map((row) => (
              <tr
                key={row.supplier_id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {row.supplier_name}
                  </span>
                </TableCell>

                <TableCell>
                  {formatNumber(row.total_purchases)}
                </TableCell>

                <TableCell>
                  {formatCurrency(
                    row.total_purchase_amount,
                  )}
                </TableCell>

                <TableCell>
                  <span className="font-semibold text-[#70588C]">
                    {formatCurrency(row.pending_amount)}
                  </span>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (reportType === "purchases" && purchasesReport) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFB]">
              <TableHeading>Supplier</TableHeading>
              <TableHeading>Date</TableHeading>
              <TableHeading>Payment</TableHeading>
              <TableHeading>Purchase Status</TableHeading>
              <TableHeading>Total Cost</TableHeading>
              <TableHeading>Notes</TableHeading>
            </tr>
          </thead>

          <tbody>
            {purchasesReport.rows.map((row) => (
              <tr
                key={row.purchase_id}
                className="border-b border-[#E2E8F0] last:border-0"
              >
                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {row.supplier_name}
                  </span>
                </TableCell>

                <TableCell>
                  {formatDate(row.purchase_date)}
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={row.payment_status}
                  />
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={row.purchase_status}
                  />
                </TableCell>

                <TableCell>
                  <span className="font-semibold text-[#1E293B]">
                    {formatCurrency(row.total_cost)}
                  </span>
                </TableCell>

                <TableCell>
                  {row.notes || "—"}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-4 align-top text-sm text-[#52646A]">
      {children}
    </td>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
        status,
      )}`}
    >
      {formatLabel(status)}
    </span>
  );
}