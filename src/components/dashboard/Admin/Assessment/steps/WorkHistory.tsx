import InputField from "@/components/ui/InputField";
import { Calendar, ChevronDown } from "lucide-react";

export default function WorkHistory() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-title mb-8 caros">
        Your Work History
      </h2>

      <div className="flex flex-col gap-8">
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Have you have any work experience?
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
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#5b616e] focus:outline-none focus:border-primary">
              <option value="41320" selected>
                41320- Academic Counsellor
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Payment Structure
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

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="stillEmployed"
            className="w-5 h-5 accent-primary border-[#e9e9ef] rounded cursor-pointer"
            checked
          />
          <label
            htmlFor="stillEmployed"
            className="text-base md:text-lg font-semibold text-[#1f1f24] cursor-pointer"
          >
            I am still employed
          </label>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            Hours Per Week
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
            Which country is this job in?
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
              <option value="Singapore" selected>
                Singapore
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div className="relative">
          <InputField
            label="When did the job start?"
            type="text"
            placeholder="2022-01-05"
          />
          <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Is this your current job?
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
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Do you have more work experience to add?
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
