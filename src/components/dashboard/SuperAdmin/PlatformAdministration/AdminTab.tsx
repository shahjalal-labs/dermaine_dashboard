import { NewAdminModal } from "@/components/modal/NewAdminModal";
import InputField from "@/components/ui/InputField";
import { Pagination } from "@/components/ui/Pagination";
import { useGetAllAdminsQuery, useDeleteAdminMutation } from "@/redux/api/adminApi";
import { IAdmin } from "@/types/flatFormAdministration";
import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Swal from "sweetalert2";
import { toast } from "sonner";

export function AdminTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteAdminFn, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const { data, isLoading: adminsLoading } = useGetAllAdminsQuery({
    page,
    limit: 10,
    search,
  });

  const admins: IAdmin[] = data?.result?.admins || data?.data?.admins || [];

  // Reset page on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  const meta = useMemo(() => {
    const raw = data?.data || data?.result || data;
    const rawMeta = raw?.meta;
    const total = Number(rawMeta?.total ?? raw?.total ?? admins.length);
    const limit = Number(rawMeta?.limit ?? raw?.limit ?? 10);
    const totalPages = Number(
      rawMeta?.totalPages ??
      rawMeta?.totalPage ??
      raw?.totalPages ??
      raw?.totalPage ??
      Math.max(1, Math.ceil(total / (limit || 10)))
    );
    const currentPage = Number(rawMeta?.page ?? raw?.page ?? page);

    return {
      total,
      limit,
      totalPages: Math.max(1, totalPages),
      currentPage,
    };
  }, [data, admins.length, page]);

  const handleDeleteAdmin = async (admin: IAdmin) => {
    const result = await Swal.fire({
      title: "Remove Admin?",
      text: `Are you sure you want to remove ${admin.fullName} (${admin.email})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await deleteAdminFn(admin.id).unwrap();
        toast.success("Admin removed successfully");
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to remove admin");
      }
    }
  };

  return (
    <div className="">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-4xl">
          <InputField
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Admins"
            icon={<Search />}
            className="bg-white"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 bg-primary text-white text-base md:text-lg font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 w-fit"
        >
          <span>+ New Admin</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl p-6 bg-white  shadow-sm border border-[#f1f1f5]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f1f1f5]">
              <th className="pb-4 text-left text-base md:text-lg font-bold text-description uppercase tracking-wider pl-4">
                Admin Name
              </th>
              <th className="pb-4 text-left text-base md:text-lg font-bold text-description uppercase tracking-wider">
                Email Address
              </th>
              <th className="pb-4 text-center text-base md:text-lg font-bold text-description uppercase tracking-wider">
                Status
              </th>
              <th className="pb-4 text-right text-base md:text-lg font-bold text-description uppercase tracking-wider pr-4">
                Action
              </th>
            </tr>
          </thead>
          {admins ? (
            <tbody className="divide-y divide-[#f1f1f5]">
              {admins.map((admin: IAdmin, i: number) => (
                <tr
                  key={admin.id || i}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 pl-4 text-base md:text-lg font-semibold text-title">
                    {admin.fullName}
                  </td>

                  <td className="py-4 text-base md:text-lg text-description">
                    {admin.email}
                  </td>

                  <td className="py-4 text-center">
                    <span
                      className={`text-base md:text-lg font-semibold px-2 py-1 rounded-md ${
                        admin.status === "Active"
                          ? "text-[#16851f] bg-[#e6fcf0]"
                          : "text-[#ff6164] bg-[#fff1f1]"
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        disabled={isDeleting}
                        title="Delete Admin"
                        className="p-1.5 text-red-500 cursor-pointer hover:text-[#ff6164] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={4} className="py-8">
                  <div className="flex justify-center">
                    <AiOutlineLoading3Quarters
                      className="animate-spin"
                      size={20}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      {meta.total > 0 && (
        <div className="mt-6 border-t border-[#f1f1f5] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-description">
            Showing Page <span className="font-semibold text-title">{meta.currentPage}</span> of{" "}
            <span className="font-semibold text-title">{meta.totalPages}</span> ({meta.total} total admins)
          </p>
          <Pagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            className="mt-0"
          />
        </div>
      )}

      <NewAdminModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
