import InputField from "@/components/ui/InputField";
import { Calendar, ChevronDown } from "lucide-react";

export default function CanadianRelatives() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8 ">
        Your Canadian Relatives and Connections
      </h2>

      <div className="flex flex-col gap-8">
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Do you have any family or friends in Canada?
          </label>
          <div className="flex gap-4">
            <button className="flex-1 max-w-[120px] h-11 rounded-lg bg-primary text-white font-semibold">
              Yes
            </button>
            <button className="flex-1 max-w-[120px] h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              No
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Who is the Canadian connection?
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="" disabled selected>
                  Relationship
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <InputField
              label="When were they born?"
              type="text"
              placeholder="1983-01-05"
            />
            <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              What is their residency status in Canada?
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="Citizen" selected>
                  Citizen
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Province
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="Alberta" selected>
                  Alberta
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div className="relative md:col-span-2">
            <InputField
              label="Residency Start Date"
              type="text"
              placeholder="1989-01-05"
            />
            <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Do you have more connections in Canada to add?
          </label>
          <div className="flex gap-4">
            <button className="flex-1 max-w-[120px] h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              Yes
            </button>
            <button className="flex-1 max-w-[120px] h-11 rounded-lg bg-primary text-white font-semibold">
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
