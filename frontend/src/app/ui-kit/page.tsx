"use client";

import { Bell, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import { MainLayout, PageHeader } from "@/components/layout";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DialogClose,
  EmptyState,
  ErrorState,
  Input,
  Label,
  Modal,
  Pagination,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";

export default function UiKitPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader
          title="Shared UI Kit"
          description="Reusable controls and layout patterns for every Inventra module."
          breadcrumbs={[{ label: "UI Kit" }]}
          actions={
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Open modal
            </Button>
          }
        />

        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Actions and status</CardTitle>
              <CardDescription>Consistent buttons, badges, toggles, and feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Active</Badge>
                <Badge variant="success">Paid</Badge>
                <Badge variant="warning">Low stock</Badge>
                <Badge variant="destructive">Overdue</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2">
                  <Switch id="alerts" defaultChecked />
                  <Label htmlFor="alerts">Alerts</Label>
                </div>
                <Toggle variant="outline" aria-label="Toggle notifications">
                  <Bell className="size-4" />
                  Notifications
                </Toggle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Refresh data">
                      <RefreshCw className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>
              </div>
              <Alert variant="success">
                <AlertTitle>Foundation ready</AlertTitle>
                <AlertDescription>Shared components are available for every module.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form controls</CardTitle>
              <CardDescription>Accessible inputs with visible focus and disabled states.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product name</Label>
                <Input id="product-name" placeholder="Wireless mouse" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue="electronics">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="office">Office supplies</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add product notes..." />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="track-stock" defaultChecked />
                <Label htmlFor="track-stock">Track inventory</Label>
              </div>
              <RadioGroup defaultValue="active" className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="active" value="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="draft" value="draft" />
                  <Label htmlFor="draft">Draft</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Content states</CardTitle>
            <CardDescription>Standard loading, empty, error, tab, and pagination patterns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="loading">
              <TabsList>
                <TabsTrigger value="loading">Loading</TabsTrigger>
                <TabsTrigger value="empty">Empty</TabsTrigger>
                <TabsTrigger value="error">Error</TabsTrigger>
              </TabsList>
              <TabsContent value="loading" className="space-y-3 rounded-xl border p-5">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Spinner /> Loading inventory data
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-4/5" />
              </TabsContent>
              <TabsContent value="empty">
                <EmptyState title="No products yet" description="Add your first product to start tracking inventory." action={<Button>Add product</Button>} />
              </TabsContent>
              <TabsContent value="error">
                <ErrorState action={<Button variant="outline">Try again</Button>} />
              </TabsContent>
            </Tabs>
            <Pagination page={page} totalPages={8} onPageChange={setPage} />
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={() => toast.success("UI system is working", { description: "Interactive feedback is available globally." })}
        >
          Test toast
        </Button>

        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Create product"
          description="This modal can be reused by product, customer, supplier, and purchase forms."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={() => setModalOpen(false)}>Save product</Button>
            </>
          }
        >
          <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
            <Avatar>
              <AvatarFallback>WM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Wireless Mouse</p>
              <p className="text-xs text-muted-foreground">Example reusable modal content</p>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
