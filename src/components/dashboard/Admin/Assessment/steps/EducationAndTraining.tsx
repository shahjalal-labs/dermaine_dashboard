import InputField from "@/components/ui/InputField";
import { Calendar, ChevronDown } from "lucide-react";

export default function EducationAndTraining() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8 caros">
        Your Education and Training
      </h2>

      <div className="flex flex-col gap-8">
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Have you completed any post secondary education?
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
            What type of qualification is this?
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#5b616e] focus:outline-none focus:border-primary">
              <option value="Two-years program" selected>
                Two-years program
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            In which country was this qualification?
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#5b616e] focus:outline-none focus:border-primary">
              <option value="Singapore" selected>
                Singapore
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Is this a full-time program?
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
            label="When did the program start?"
            type="text"
            placeholder="1996-01-05"
          />
          <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Is this program still in progress?
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
            label="When is the program expected to finish?"
            type="text"
            placeholder="1996-01-05"
          />
          <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
