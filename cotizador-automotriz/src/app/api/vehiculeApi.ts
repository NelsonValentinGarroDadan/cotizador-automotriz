import { api } from "./api";
import { PaginatedResponse } from "../types";
import { VehiculeVersion, VehiculeVersionPayload } from "../types/vehiculos";



export interface GetVehiculeParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  brandId?: number;
  lineId?: number;
  modelId?: number;
  companyId?: string;
}

export interface GetVehiculeBrandParams {
  limit?: number;
  search?: string;
  companyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetVehiculeLineParams {
  limit?: number;
  search?: string;
  brandId?: number;
  companyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetVehiculeModelParams {
  limit?: number;
  search?: string;
  brandId?: number;
  lineId?: number;
  companyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}


export const vehiculeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllVehiculeVersions: builder.query<
      PaginatedResponse<VehiculeVersion>,
      GetVehiculeParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
        if (params?.sortOrder)
          searchParams.append("sortOrder", params.sortOrder);
        if (params?.search) searchParams.append("search", params.search);
        if (params?.brandId)
          searchParams.append("brandId", params.brandId.toString());
        if (params?.lineId)
          searchParams.append("lineId", params.lineId.toString());
        if (params?.modelId)
          searchParams.append("modelId", params.modelId.toString());
        if (params?.companyId)
          searchParams.append("companyId", params.companyId);

        return {
          url: `/vehicules/versions?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ idversion }) => ({
                type: "Vehicule" as const,
                id: idversion,
              })),
              { type: "Vehicule", id: "LIST" },
            ]
          : [{ type: "Vehicule", id: "LIST" }],
    }),

    getVehiculeBrands: builder.query<
      PaginatedResponse<VehiculeVersion>,
      GetVehiculeBrandParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.limit) {
          searchParams.append("limit", params.limit.toString());
        }
        if (params?.search) {
          searchParams.append("search", params.search);
        }
        if (params?.companyId) {
          searchParams.append("companyId", params.companyId);
        }
        if (params?.sortBy) {
          searchParams.append("sortBy", params.sortBy);
        }
        if (params?.sortOrder) {
          searchParams.append("sortOrder", params.sortOrder);
        }
        return {
          url: `/vehicules/brands?${searchParams.toString()}`,
          method: "GET",
        };
      },
    }),

    getVehiculeLines: builder.query<
      PaginatedResponse<VehiculeVersion>,
      GetVehiculeLineParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.limit) {
          searchParams.append("limit", params.limit.toString());
        }
        if (params?.search) {
          searchParams.append("search", params.search);
        }
        if (params?.brandId) {
          searchParams.append("brandId", params.brandId.toString());
        }
        if (params?.companyId) {
          searchParams.append("companyId", params.companyId);
        }

        return {
          url: `/vehicules/lines?${searchParams.toString()}`,
          method: "GET",
        };
      },
    }),
 

    getVehiculeVersionById: builder.query<VehiculeVersion, { idversion: number }>({
      query: ({ idversion }) => ({
        url: `/vehicules/versions/${idversion}`,
        method: "GET",
      }),
      providesTags: (result, error, { idversion }) => [
        { type: "Vehicule", id: idversion },
      ],
    }),

    createVehiculeVersion: builder.mutation<
      VehiculeVersion,
      VehiculeVersionPayload
    >({
      query: (body) => ({
        url: "/vehicules/versions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Vehicule", id: "LIST" }],
    }),

    updateVehiculeVersion: builder.mutation<
      VehiculeVersion,
      { idversion: number; data: VehiculeVersionPayload }
    >({
      query: ({ idversion, data }) => ({
        url: `/vehicules/versions/${idversion}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { idversion }) => [
        { type: "Vehicule", id: idversion },
        { type: "Vehicule", id: "LIST" },
      ],
    }),

    deleteVehiculeVersion: builder.mutation<void, { idversion: number }>({
      query: ({ idversion }) => ({
        url: `/vehicules/versions/${idversion}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { idversion }) => [
        { type: "Vehicule", id: idversion },
        { type: "Vehicule", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllVehiculeVersionsQuery,
  useGetVehiculeBrandsQuery,
  useGetVehiculeLinesQuery, 
  useGetVehiculeVersionByIdQuery,
  useCreateVehiculeVersionMutation,
  useUpdateVehiculeVersionMutation,
  useDeleteVehiculeVersionMutation,
} = vehiculeApi;

