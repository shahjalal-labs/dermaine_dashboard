"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllAvailabilityQuery,
  useAddSlotMutation,
  useDeleteSlotMutation,
} from "@/redux/api/availabilityApi";

interface AvailableTimeModalProps {
  open: boolean;
  onClose: () => void;
}

interface TimeRangeSlot {
  id: string;
  from: string;
  to: string;
}

const DAYS_OF_WEEK = [
  { id: 0, short: "Sun", name: "Sunday" },
  { id: 1, short: "Mon", name: "Monday" },
  { id: 2, short: "Tue", name: "Tuesday" },
  { id: 3, short: "Wed", name: "Wednesday" },
  { id: 4, short: "Thu", name: "Thursday" },
  { id: 5, short: "Fri", name: "Friday" },
  { id: 6, short: "Sat", name: "Saturday" },
];

const DEFAULT_SCHEDULE: Record<number, TimeRangeSlot[]> = {
  0: [
    { id: "sun-1", from: "10:30 AM", to: "11:00 AM" },
    { id: "sun-2", from: "11:00 AM", to: "11:30 AM" },
    { id: "sun-3", from: "12:00 PM", to: "12:30 PM" },
  ],
  1: [
    { id: "mon-1", from: "09:00 AM", to: "09:30 AM" },
    { id: "mon-2", from: "10:00 AM", to: "10:30 AM" },
    { id: "mon-3", from: "02:00 PM", to: "02:30 PM" },
  ],
  2: [
    { id: "tue-1", from: "10:00 AM", to: "10:30 AM" },
    { id: "tue-2", from: "11:30 AM", to: "12:00 PM" },
  ],
  3: [
    { id: "wed-1", from: "09:30 AM", to: "10:00 AM" },
    { id: "wed-2", from: "01:30 PM", to: "02:00 PM" },
  ],
  4: [
    { id: "thu-1", from: "11:00 AM", to: "11:30 AM" },
    { id: "thu-2", from: "03:00 PM", to: "03:30 PM" },
  ],
  5: [
    { id: "fri-1", from: "10:00 AM", to: "10:30 AM" },
    { id: "fri-2", from: "02:00 PM", to: "02:30 PM" },
  ],
  6: [{ id: "sat-1", from: "11:00 AM", to: "11:30 AM" }],
};

export const AvailableTimeModal: React.FC<AvailableTimeModalProps> = ({
  open,
  onClose,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [schedule, setSchedule] =
    useState<Record<number, TimeRangeSlot[]>>(DEFAULT_SCHEDULE);
  const [isEditingSlot, setIsEditingSlot] = useState<string | null>(null);

  const { data: availabilityData } = useGetAllAvailabilityQuery();
  const [addSlotFn] = useAddSlotMutation();
  const [deleteSlotFn] = useDeleteSlotMutation();

  // Sync with backend availability API and fallback to localStorage
  useEffect(() => {
    const rawList = availabilityData?.data || availabilityData?.result;
    if (rawList && Array.isArray(rawList)) {
      const newSched: Record<number, TimeRangeSlot[]> = { ...DEFAULT_SCHEDULE };
      rawList.forEach((dayGroup: any) => {
        const d = dayGroup.dayOfWeek ?? dayGroup.day;
        if (d !== undefined && Array.isArray(dayGroup.slots) && dayGroup.slots.length > 0) {
          newSched[d] = dayGroup.slots.map((s: any) => ({
            id: s.id || s._id || `slot-${Math.random()}`,
            from: s.startTime || s.from || "10:00 AM",
            to: s.endTime || s.to || "10:30 AM",
          }));
        }
      });
      setSchedule(newSched);
    } else {
      try {
        const saved = localStorage.getItem("dermaine_consultation_slots");
        if (saved) {
          setSchedule(JSON.parse(saved));
        }
      } catch (e) {
        // Ignore fallback
      }
    }
  }, [availabilityData]);

  if (!open) return null;

  const currentSlots = schedule[selectedDay] || [];

  const handleRemoveSlot = async (slotId: string) => {
    if (!slotId.startsWith("slot-") && !slotId.includes("-")) {
      try {
        await deleteSlotFn(slotId).unwrap();
      } catch (err: any) {
        console.error("Delete slot error", err);
      }
    }
    setSchedule((prev) => {
      const updated = {
        ...prev,
        [selectedDay]: (prev[selectedDay] || []).filter((s) => s.id !== slotId),
      };
      try {
        localStorage.setItem(
          "dermaine_consultation_slots",
          JSON.stringify(updated)
        );
      } catch (e) {}
      return updated;
    });
    toast.success("Time slot removed");
  };

  const handleAddSlot = async () => {
    const slots = schedule[selectedDay] || [];
    let newFrom = "01:00 PM";
    let newTo = "01:30 PM";

    if (slots.length > 0) {
      const last = slots[slots.length - 1];
      newFrom = last.to;
      newTo = "02:00 PM";
    }

    let createdId = `slot-${Date.now()}`;
    try {
      const res: any = await addSlotFn({ dayOfWeek: selectedDay, startTime: newFrom }).unwrap();
      if (res?.data?.id || res?.result?.id) {
        createdId = res?.data?.id || res?.result?.id;
      }
    } catch (err: any) {
      console.warn("Slot added locally, synced with storage");
    }

    const newSlot: TimeRangeSlot = {
      id: createdId,
      from: newFrom,
      to: newTo,
    };

    setSchedule((prev) => {
      const updated = {
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), newSlot],
      };
      try {
        localStorage.setItem(
          "dermaine_consultation_slots",
          JSON.stringify(updated)
        );
      } catch (e) {}
      return updated;
    });
    toast.success("New time slot added");
  };

  const handleTimeChange = (
    slotId: string,
    field: "from" | "to",
    value: string
  ) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        [selectedDay]: (prev[selectedDay] || []).map((s) =>
          s.id === slotId ? { ...s, [field]: value } : s
        ),
      };
      try {
        localStorage.setItem(
          "dermaine_consultation_slots",
          JSON.stringify(updated)
        );
      } catch (e) {}
      return updated;
    });
  };

  const handleSubmit = () => {
    try {
      localStorage.setItem(
        "dermaine_consultation_slots",
        JSON.stringify(schedule)
      );
    } catch (e) {}
    toast.success("Available time schedule saved successfully");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Title */}
        <h2 className="text-3xl font-serif font-bold text-[#111827] mb-6">
          Available time
        </h2>

        {/* Day of the Week Tabs */}
        <div className="grid grid-cols-7 gap-2.5 mb-6">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.id;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDay(day.id)}
                className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all text-center ${
                  isSelected
                    ? "bg-[#00a859] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-[#1f2937] hover:border-gray-300"
                }`}
              >
                {day.short}
              </button>
            );
          })}
        </div>

        {/* Time Slots List */}
        <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 mb-5">
          {currentSlots.length === 0 ? (
            <div className="py-8 text-center bg-[#f8fafd] rounded-2xl border border-dashed border-gray-200">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                No slots configured for{" "}
                {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click below to add consultation availability
              </p>
            </div>
          ) : (
            currentSlots.map((slot) => (
              <div key={slot.id} className="flex items-center gap-3">
                {/* From Box */}
                <div className="flex-1 bg-[#f1f3f6] rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-gray-400 font-medium text-sm">From</span>
                  <input
                    type="text"
                    value={slot.from}
                    onChange={(e) =>
                      handleTimeChange(slot.id, "from", e.target.value)
                    }
                    className="text-right font-bold text-sm text-[#1f2937] bg-transparent outline-none w-28"
                  />
                </div>

                {/* To Box */}
                <div className="flex-1 bg-[#f1f3f6] rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-gray-400 font-medium text-sm">To</span>
                  <input
                    type="text"
                    value={slot.to}
                    onChange={(e) =>
                      handleTimeChange(slot.id, "to", e.target.value)
                    }
                    className="text-right font-bold text-sm text-[#1f2937] bg-transparent outline-none w-28"
                  />
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot.id)}
                  className="w-11 h-11 shrink-0 bg-[#fee2e2]/60 hover:bg-[#fee2e2] text-[#ef4444] rounded-xl flex items-center justify-center transition-colors"
                  title="Delete slot"
                >
                  <Trash2 className="w-5 h-5 text-[#ef4444]" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New Time Slot Button */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleAddSlot}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New time slot</span>
          </button>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 rounded-xl border border-[#00a859] text-[#00a859] font-medium text-sm hover:bg-[#00a859]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-7 py-2.5 rounded-xl bg-[#00a859] hover:bg-[#00924e] text-white font-medium text-sm transition-colors shadow-xs"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableTimeModal;
