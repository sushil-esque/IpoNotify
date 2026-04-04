import { updateSubscription } from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_OPTIONS = [
  { value: "general_public", label: "General Public" },
  { value: "foreign_employment", label: "Foreign Employment" },
  { value: "reserved", label: "Reserved" },
  { value: "all", label: "All IPOs" },
  { value: "none", label: "Mute All Alerts" },
];

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(
    user?.subscribedCategory || ""
  );


  const updateMutation = useMutation({
    mutationFn: (name: string) => updateSubscription(name),
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      // Invalidate the me query to refresh user state
      queryClient.invalidateQueries({ queryKey: ["me"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Subscription update failed:", error);
      toast.error("Failed to update subscription. Please try again.");
    },
  });

  const handleSave = () => {
    if (!selectedCategory) {
      toast.error("Please select a valid category");
      return;
    }
    updateMutation.mutate(selectedCategory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-[#1a1a2e] dark:border-white/10 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Subscription Preferences</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Choose which category of IPOs you want to receive email alerts for.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full dark:border-white/20 dark:bg-white/5">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#1a1a2e] dark:border-white/10 dark:text-gray-100">
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/10"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !selectedCategory}
            className="bg-[#5177f6] hover:bg-[#3d5fd4] text-white transition-all w-full sm:w-auto"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
