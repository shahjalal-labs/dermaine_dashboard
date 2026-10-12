import InputField from "@/components/ui/InputField";
import { Calendar, ChevronDown } from "lucide-react";

export default function Dependents() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8 ">
        Your Dependents
      </h2>

      <div className="flex flex-col gap-8">
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Do you have any children or dependents under the age of 22?
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
          <div className="relative">
            <InputField
              label="When were they born?"
              type="text"
              placeholder="2006-01-05"
            />
            <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Which country are they citizen of?
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="Canada" selected>
                  Canada
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              In which country do they currently live?
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="Algeria" selected>
                  Algeria
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Residency Status
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
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Do you have more dependants to add?
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
