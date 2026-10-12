import { ChevronDown } from "lucide-react";

export default function PersonalNetWorth() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8 ">
        Your Personal Net Worth
      </h2>

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Currency
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="cad" selected>
                  CAD - Canada Dollar
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-lg md:text-xl font-semibold text-title mb-2">
              Net Worth Range
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                <option value="" disabled selected>
                  Select range
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            Annual Household Income Range
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
              <option value="" disabled selected>
                Select range
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            What funds will you have to support yourself in Canada?
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
              <option value="" disabled selected>
                Select range
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Would you like to add a spouse to your application?
          </label>
          <div className="flex gap-4">
            <button className="flex-1 max-w-[120px] h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              Yes
            </button>
            <button className="flex-1 max-w-[120px] h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
