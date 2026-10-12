import InputField from "@/components/ui/InputField";
import { Calendar, ChevronDown, Search, X } from "lucide-react";

export default function PersonalProfile() {
  return (
    <div className="pt-8">
      <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f24] mb-8 ">
        Personal Profile
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* First Name */}
        <InputField label="First Name" type="text" placeholder="First Name" />

        {/* Last Name */}
        <InputField label="Last Name" type="text" placeholder="Last Name" />

        {/* Email Address */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="Email Address"
        />

        {/* Telephone Number */}
        <InputField
          label="Telephone Number"
          type="tel"
          placeholder="Telephone Number"
        />

        {/* Date of Birth */}
        <div className="relative">
          <InputField
            label="Date of Birth"
            type="text"
            placeholder="DD/MM/YYYY"
          />
          <Calendar className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            Gender
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-[#fdfdfd] text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
              <option value="" disabled selected>
                Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        {/* Marital Status - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            Marital Status
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-[#fdfdfd] text-base md:text-lg text-[#5b616e] focus:outline-none focus:border-primary">
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        {/* Current Country of Residence */}
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            Current Country of Residence
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-[#fdfdfd] text-base md:text-lg text-[#a0a0b0] focus:outline-none focus:border-primary">
              <option value="" disabled selected>
                Current Country of Residence
              </option>
              <option value="ca">Canada</option>
              <option value="us">United States</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        {/* In which country do you currently live? */}
        <div className="relative ">
          <InputField
            label="In which country do you currently live?"
            type="text"
            placeholder="In which country do you currently live?"
          />
          <Search className="absolute right-4 top-[65%] -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none text-base " />
        </div>

        {/* Has multiple citizenship */}
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            Has multiple citizenship
          </label>
          <div className="relative">
            <select className="w-full h-12 px-4 appearance-none rounded-xl border border-[#e9e9ef] bg-[#fdfdfd] text-lg md:text-xl text-[#5b616e] focus:outline-none focus:border-primary">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0b0] pointer-events-none" />
          </div>
        </div>

        {/* All citizenships */}
        <div>
          <label className="block text-lg md:text-xl font-semibold text-title mb-2">
            All citizenships
          </label>
          <div className="relative flex items-center w-full h-12 px-2 rounded-xl border border-[#e9e9ef] bg-[#fdfdfd] focus-within:border-primary">
            <div className="flex gap-2 items-center flex-1 overflow-x-auto">
              <div className="flex items-center gap-1 px-3 py-1 bg-[#8bd993] text-white rounded-md text-base font-semibold whitespace-nowrap">
                American
                <button className="hover:opacity-80">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-[#8bd993] text-white rounded-md text-base font-semibold whitespace-nowrap">
                Italy
                <button className="hover:opacity-80">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <input
                type="text"
                className="flex-1 min-w-[50px] bg-transparent text-base md:text-lg focus:outline-none text-[#5b616e]"
              />
            </div>
            <Search className="w-4 h-4 text-[#a0a0b0] mx-2 shrink-0 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
