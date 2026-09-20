"use client";

interface NotificationFiltersProps {
  selectedType: string;
  selectedStatus: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function NotificationFilters({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#D7E0E3] bg-white p-4 shadow-sm md:flex-row">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-[#44555B]">
          Notification Type
        </label>

        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full rounded-lg border border-[#D7E0E3] bg-white px-3 py-2 text-sm text-[#44555B] outline-none focus:border-[#0F4C5C]"
        >
          <option value="ALL">All Types</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="MULTIPLE_LOW_STOCK">
            Multiple Low Stock
          </option>
          <option value="NEW_SALE">New Sale</option>
          <option value="PURCHASE_RECEIVED">
            Purchase Received
          </option>
        </select>
      </div>

      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-[#44555B]">
          Status
        </label>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full rounded-lg border border-[#D7E0E3] bg-white px-3 py-2 text-sm text-[#44555B] outline-none focus:border-[#0F4C5C]"
        >
          <option value="ALL">All Notifications</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>
      </div>
    </div>
  );
}