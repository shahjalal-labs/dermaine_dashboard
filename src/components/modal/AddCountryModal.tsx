"use client";

import { useEffect, useState } from "react";
import { CustomModal } from "./CustomModal";
import InputField from "../ui/InputField";
import { toast } from "sonner";
import { useCreateProgramMutation } from "@/redux/api/programApi";

interface AddCountryModalProps {
  open: boolean;
  onClose: () => void;
  country?: any;
  onSave?: (country: any, originalCode?: string) => void;
}

export function AddCountryModal({
  open,
  onClose,
  country,
  onSave,
}: AddCountryModalProps) {
  const [countryName, setCountryName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [status, setStatus] = useState("Coming soon");
  const [scoringEngine, setScoringEngine] = useState("Skilled Migrant Category Points");
  const [scoringEngineLevel, setScoringEngineLevel] = useState("General Skilled Migration");
  const [currency, setCurrency] = useState("CAD");
  const [flagEmoji, setFlagEmoji] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  const [createProgram, { isLoading }] = useCreateProgramMutation();

  useEffect(() => {
    if (country) {
      setCountryName(country.name || "");
      setIsoCode(country.code || "");
      setStatus(country.status || "Coming soon");
      setScoringEngine(country.scoringEngine || "Skilled Migrant Category Points");
      setScoringEngineLevel(country.level || "General Skilled Migration");
      setCurrency(country.currency || "CAD");
      setFlagEmoji(country.flag || "");
      setWebsite(country.website || "");
      setNotes(country.note || country.notes || "");
    } else {
      setCountryName("");
      setIsoCode("");
      setStatus("Coming soon");
      setScoringEngine("Skilled Migrant Category Points");
      setScoringEngineLevel("General Skilled Migration");
      setCurrency("CAD");
      setFlagEmoji("");
      setWebsite("");
      setNotes("");
    }
  }, [country, open]);

  const handleSave = async () => {
    if (!countryName.trim()) {
      toast.error("Country name is required");
      return;
    }
    if (!isoCode.trim()) {
      toast.error("ISO code is required");
      return;
    }

    const payload = {
      name: countryName,
      code: isoCode.toUpperCase(),
      status,
      scoringEngine,
      currency: currency.toUpperCase(),
      note: notes || "Architecture prepared. Not yet activated",
      level: scoringEngineLevel,
      flag: flagEmoji,
      website,
    };

    try {
      try {
        await createProgram({
          name: `${countryName} Immigration Framework`,
          country: countryName,
          category: "Economic",
          province: "Federal",
          status: status === "Active" ? "ACTIVE" : "DRAFT",
          description: `${scoringEngineLevel} with ${scoringEngine} scoring engine. ${notes}`,
        }).unwrap();
      } catch (e) {
        // Backend program mutation is optional for country metadata
      }

      if (onSave) {
        onSave(payload, country?.code);
      }

      toast.success(country ? "Country updated successfully!" : "Country added successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save country settings");
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={country ? "Edit Country" : "Add Country"}
      maxWidth="2xl"
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
        },
        {
          label: isLoading ? "Saving..." : country ? "Update Country" : "Save Country",
          onClick: handleSave,
          variant: "primary",
        },
      ]}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Country Name</label>
            <InputField
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="e.g. Australia"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">ISO code (2 letters)</label>
            <InputField
              value={isoCode}
              onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
              placeholder="AU"
              maxLength={2}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-[#e9e9ef] bg-white text-title text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Coming soon">Coming soon</option>
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Scoring Engine</label>
            <select
              value={scoringEngine}
              onChange={(e) => setScoringEngine(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-[#e9e9ef] bg-white text-title text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Skilled Migrant Category Points">Skilled Migrant Category Points</option>
              <option value="Express Entry CRS">Express Entry CRS</option>
              <option value="Points-Based System (PBS)">Points-Based System (PBS)</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-title">Scoring Engine Level</label>
            <InputField
              value={scoringEngineLevel}
              onChange={(e) => setScoringEngineLevel(e.target.value)}
              placeholder="General Skilled Migration"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-title">Currency</label>
            <InputField
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="AUD, CAD, USD"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-title">Flag Emoji / Code</label>
          <InputField
            value={flagEmoji}
            onChange={(e) => setFlagEmoji(e.target.value)}
            placeholder="AU"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-title">Official Immigration Website</label>
          <InputField
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-title">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type Note"
            rows={2}
            className="w-full p-3 rounded-lg border border-[#e9e9ef] bg-white text-title text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </CustomModal>
  );
}
