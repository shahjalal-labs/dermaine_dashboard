"use client";

import { Check, ShieldCheck, Building2, UserCheck, Users, Headphones, Eye } from "lucide-react";

interface RoleCard {
  title: string;
  scope: string;
  badgeColor: string;
  description: string;
  icon: any;
  bullets: string[];
}

const ROLES: RoleCard[] = [
  {
    title: "Super Admin",
    scope: "Platform-wide",
    badgeColor: "bg-red-100 text-red-600",
    description: "Full access to all organizations, billing, countries, scoring models, and platform infrastructure.",
    icon: ShieldCheck,
    bullets: [
      "Manage all organizations",
      "Create/suspend organizations",
      "Manage subscription plans",
      "Manage countries & scoring engines",
      "View platform revenue",
      "Access all audit logs",
      "Manage all users",
      "Feature flag control",
    ],
  },
  {
    title: "Organization Owner",
    scope: "Organization-wide",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description: "Full access within their own organization. Cannot access other organizations or platform-level settings.",
    icon: Building2,
    bullets: [
      "Manage org users & roles",
      "View all org assessments & reports",
      "Manage org billing",
      "Configure org branding",
      "Access org analytics",
      "Export org data",
      "Manage org settings",
    ],
  },
  {
    title: "Manager",
    scope: "Organization-wide",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "Can manage team members and view all data within their organization. Cannot change billing or branding.",
    icon: UserCheck,
    bullets: [
      "View all applicants & reports",
      "Manage consultant assignments",
      "View org analytics",
      "Approve/reject assessments",
      "Manage consultations",
    ],
  },
  {
    title: "Consultant",
    scope: "Assigned clients only",
    badgeColor: "bg-purple-100 text-purple-700",
    description: "Can access applicants assigned to them. Cannot view other consultants' clients.",
    icon: Users,
    bullets: [
      "View assigned applicants",
      "Create & complete assessments",
      "Generate reports",
      "Manage consultations",
      "View own analytics",
    ],
  },
  {
    title: "Staff",
    scope: "Limited access",
    badgeColor: "bg-amber-100 text-amber-700",
    description: "Support role with limited data access. Can assist with admin tasks but cannot generate or approve reports.",
    icon: Headphones,
    bullets: [
      "View applicant list",
      "Update applicant status",
      "Manage consultations",
      "View basic reports",
    ],
  },
  {
    title: "Read Only",
    scope: "View only",
    badgeColor: "bg-gray-100 text-gray-700",
    description: "Can view data but cannot create, edit, or delete any records.",
    icon: Eye,
    bullets: [
      "View applicants",
      "View assessments",
      "View reports",
      "View analytics",
    ],
  },
];

interface MatrixRow {
  feature: string;
  superAdmin: boolean;
  orgOwner: boolean;
  manager: boolean;
  consultant: boolean;
  staff: boolean;
  readOnly: boolean;
}

const MATRIX_DATA: MatrixRow[] = [
  { feature: "Platform Administration", superAdmin: true, orgOwner: false, manager: false, consultant: false, staff: false, readOnly: false },
  { feature: "Manage Organizations", superAdmin: true, orgOwner: false, manager: false, consultant: false, staff: false, readOnly: false },
  { feature: "Subscription Plans", superAdmin: true, orgOwner: false, manager: false, consultant: false, staff: false, readOnly: false },
  { feature: "Country Management", superAdmin: true, orgOwner: false, manager: false, consultant: false, staff: false, readOnly: false },
  { feature: "Org Billing & Settings", superAdmin: true, orgOwner: true, manager: false, consultant: false, staff: false, readOnly: false },
  { feature: "Manage Org Users", superAdmin: true, orgOwner: true, manager: true, consultant: false, staff: false, readOnly: false },
  { feature: "View All Org Data", superAdmin: true, orgOwner: true, manager: true, consultant: false, staff: false, readOnly: false },
  { feature: "Generate Reports", superAdmin: true, orgOwner: true, manager: true, consultant: true, staff: false, readOnly: false },
  { feature: "View Reports", superAdmin: true, orgOwner: true, manager: true, consultant: true, staff: true, readOnly: true },
  { feature: "Manage Consultations", superAdmin: true, orgOwner: true, manager: true, consultant: true, staff: true, readOnly: false },
  { feature: "Export Data", superAdmin: true, orgOwner: true, manager: false, consultant: false, staff: false, readOnly: false },
  { feature: "Platform Audit Logs", superAdmin: true, orgOwner: false, manager: false, consultant: false, staff: false, readOnly: false },
];

export function RolesPermissionsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-title mb-1">Role & Permission management</h3>
        <p className="text-sm md:text-base text-description">
          Platform role definitions, access scopes, and feature permission matrix. Roles are assigned per organization member.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROLES.map((role, idx) => {
          const Icon = role.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-[#f1f1f5] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-title">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-title text-base">{role.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${role.badgeColor}`}>
                      {role.scope}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-description mb-4 leading-relaxed">{role.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <ul className="space-y-2">
                  {role.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-2 text-xs md:text-sm text-title">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#f1f1f5] shadow-sm p-6 overflow-x-auto">
        <h4 className="text-base font-bold text-title mb-4">Feature Permission Matrix</h4>
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-description uppercase tracking-wider">
              <th className="pb-3 text-left">Feature</th>
              <th className="pb-3 text-center">Super Admin</th>
              <th className="pb-3 text-center">Organization Owner</th>
              <th className="pb-3 text-center">Manager</th>
              <th className="pb-3 text-center">Consultant</th>
              <th className="pb-3 text-center">Staff</th>
              <th className="pb-3 text-center">Read Only</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {MATRIX_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="py-3.5 font-medium text-title">{row.feature}</td>
                <td className="py-3.5 text-center">
                  {row.superAdmin ? <Check className="w-5 h-5 text-[#16851f] mx-auto stroke-[2.5]" /> : <span className="text-gray-300">--</span>}
                </td>
                <td className="py-3.5 text-center">
                  {row.orgOwner ? <Check className="w-5 h-5 text-[#16851f] mx-auto stroke-[2.5]" /> : <span className="text-gray-300">--</span>}
                </td>
                <td className="py-3.5 text-center">
                  {row.manager ? <Check className="w-5 h-5 text-[#16851f] mx-auto stroke-[2.5]" /> : <span className="text-gray-300">--</span>}
                </td>
                <td className="py-3.5 text-center">
                  {row.consultant ? <Check className="w-5 h-5 text-[#16851f] mx-auto stroke-[2.5]" /> : <span className="text-gray-300">--</span>}
                </td>
                <td className="py-3.5 text-center">
                  {row.staff ? <Check className="w-5 h-5 text-[#16851f] mx-auto stroke-[2.5]" /> : <span className="text-gray-300">--</span>}
                </td>
                <td className="py-3.5 text-center">
                  {row.readOnly ? <Check className="w-5 h-5 text-[#16851f] mx-auto stroke-[2.5]" /> : <span className="text-gray-300">--</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
