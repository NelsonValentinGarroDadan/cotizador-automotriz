// app/planes/page.tsx
"use client";
import { useEffect, useMemo } from "react";
import { CustomTable } from "@/app/components/ui/customTable";
import { createTableStore } from "@/app/store/useTableStore";
import planColumns from "./components/tableConfig";
import { useGetAllPlansQuery, planApi } from "@/app/api/planApi";
import { useGetAllCompaniesQuery } from "@/app/api/companyApi";
import { getPlanFilters } from "./components/filterConfig";
import WindowFormButton from "@/app/components/windowFormButton";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { useAuthStore } from "@/app/store/useAuthStore";
import { Role } from "@/app/types";

export default function Page() {
  const { user, hydrated } = useAuthStore();
  const dispatch = useDispatch();
  const usePlansTableStore = useMemo(() => createTableStore("plans"), []);
  const { filters, pagination, sort } = usePlansTableStore();

  // Obtener compañías para el filtro
  const { data: companiesData } = useGetAllCompaniesQuery({
    page: 1,
    limit: 1000,
  });

  const { data, refetch, isLoading, isFetching } = useGetAllPlansQuery(
    {
      ...pagination,
      ...sort,
      ...filters,
      includeInactive: true,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        if (event.data?.created || event.data?.updated || event.data?.deleted) {
          dispatch(
            planApi.util.invalidateTags([{ type: "Plan", id: "LIST" }])
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch]);

  const handleFilter = () => {
    refetch();
  };

  const handlePageChange = () => {
    refetch();
  };

  // Crear filtros y columnas dinámicos según cantidad de compañías
  const planFiltersWithCompanies = useMemo(() => {
    const companies = companiesData?.data || [];
    const showCompanyFilter = companies.length > 1;
    return getPlanFilters(
      companies.map((c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      })),
      showCompanyFilter
    );
  }, [companiesData]);

  if (!hydrated) {
    return (
      <section className="w-full px-5 min-h-screen flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  const companies = companiesData?.data || [];
  const showCompaniesColumn = companies.length > 1;

  const columns = planColumns({
    onCreated: refetch,
    role: user.role,
    showCompaniesColumn,
  });

  return (
    <section className="w-full border-l border-gray px-5 min-h-screen">
      <CustomTable
        store={usePlansTableStore}
        columns={columns}
        data={data?.data || []}
        filters={planFiltersWithCompanies}
        pagination={{
          currentPage: data?.page || 1,
          totalItems: data?.total || 0,
          totalPages: data?.totalPages || 1,
        }}
        loading={isLoading || isFetching}
        onFilter={handleFilter}
        onPageChange={handlePageChange}
        title="Gestión de Planes"
        description="Podrás ver, crear y editar los diferentes planes de tus compañías."
        buttons={
          (user.role == Role.ADMIN || user.role == Role.SUPER_ADMIN) && (
            <WindowFormButton
              formUrl="/planes/create"
              buttonText={
                <p className="flex gap-3">
                  <Plus className="text-white h-6 w-6" />
                  Crear Plan
                </p>
              }
              onCreated={refetch}
              width={900}
            />
          )
        }
      />
    </section>
  );
}

