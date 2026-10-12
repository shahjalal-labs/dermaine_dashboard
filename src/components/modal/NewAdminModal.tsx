import { useState } from "react";
import InputField from "../ui/InputField";
import { CustomModal } from "./CustomModal";
import { useCreateAdminMutation } from "@/redux/api/adminApi";
import { toast } from "sonner";

interface NewAdminModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewAdminModal({ open, onClose }: NewAdminModalProps) {
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [createAdmin, { isLoading }] = useCreateAdminMutation();

  const handleCreate = async () => {
    if (!adminName || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      await createAdmin({ adminName, email }).unwrap();
      toast.success("Admin created successfully. An email has been sent to them.");
      setAdminName("");
      setEmail("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create admin");
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="New Admin"
      maxWidth="lg"
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
        },
        {
          label: isLoading ? "Creating..." : "Create Admin",
          onClick: handleCreate,
          variant: "primary",
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-base md:text-lg font-bold text-title">
            Admin Name <span className="text-red-500">*</span>
          </label>
          <InputField 
            type="text" 
            placeholder="Type admin name" 
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base md:text-lg font-bold text-title">
            Email Address <span className="text-red-500">*</span>
          </label>
          <InputField 
            type="email" 
            placeholder="Type email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
    </CustomModal>
  );
}
