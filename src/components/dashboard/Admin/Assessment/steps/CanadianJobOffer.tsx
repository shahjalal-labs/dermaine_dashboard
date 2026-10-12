import InputField from "@/components/ui/InputField";
import { Calendar, ChevronDown } from "lucide-react";

export default function CanadianJobOffer() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8">
        Canadian Job Offer
      </h2>

      <div className="flex flex-col gap-8">
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Do you have a Canadian job offer?
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

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            What type of job is this?
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
              <option value="14404" selected>
                14404 - 911 Dispatcher
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Will this job be paid?
          </label>
          <div className="flex gap-4">
            <button className="flex-1 max-w-[120px] h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              Non-paid
            </button>
            <button className="flex-1 max-w-[120px] h-11 rounded-lg bg-primary text-white font-semibold">
              Paid
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Hours per week
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="8" selected>
                  8
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Where will you be working?
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
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Is this job LMIA exempt?
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

        <div className="relative">
          <InputField
            label="When does the job start?"
            type="text"
            placeholder="2026-01-05"
          />
          <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Does this job offer have an end date?
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

        <div className="relative">
          <InputField
            label="When will the job contract end?"
            type="text"
            placeholder="2028-01-05"
          />
          <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
