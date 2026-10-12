import { ChevronDown } from "lucide-react";

export default function LanguageSkills() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8 ">
        Your Language Skills
      </h2>

      <div className="flex flex-col gap-8">
        {/* English Test */}
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Have you taken an English Language test?
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
            Which English language test have you taken?
          </label>
          <div className="flex flex-wrap gap-4">
            <button className="flex-1  h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              ILTS
            </button>
            <button className="flex-1 h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              CELPIP
            </button>
            <button className="flex-1    h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              PTE
            </button>
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Enter your IELTS score
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {["Writing", "Reading", "Speaking", "Listening"].map((skill) => (
              <div key={skill}>
                <label className="block text-base md:text-lg font-semibold text-title mb-2">
                  {skill}
                </label>
                <div className="relative">
                  <select className="w-full h-11 px-4 appearance-none rounded-lg border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                    <option value="" disabled selected>
                      Select level
                    </option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* French Test */}
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Have you taken an French Language test?
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
            Which French language test have you taken?
          </label>
          <div className="flex flex-wrap gap-4">
            <button className="flex-1  h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              TCF
            </button>
            <button className="flex-1  h-11 rounded-lg border border-[#e9e9ef] text-[#a0a0b0] font-semibold hover:border-primary/50 transition-colors">
              TEF
            </button>
          </div>
        </div>

        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-4">
            Enter your TCF score
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {["Writing", "Reading", "Speaking", "Listening"].map((skill) => (
              <div key={skill}>
                <label className="block text-base md:text-lg font-semibold text-title mb-2">
                  {skill}
                </label>
                <div className="relative">
                  <select className="w-full h-11 px-4 appearance-none rounded-lg border border-[#e9e9ef] bg-transparent text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
                    <option value="" disabled selected>
                      Select level
                    </option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
