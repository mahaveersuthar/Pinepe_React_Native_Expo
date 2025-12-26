import { apiClient } from "./api.client";

type GetServicesOptions = {
  domain: string;
  latitude: string;
  longitude: string;
  token: string;
  status?: "active" | "inactive";
  perPage?: number;
};

export const getServicesApi = async (options: GetServicesOptions) => {
  const {
    domain,
    latitude,
    longitude,
    token,
    status = "active",
    perPage = 50,
  } = options;

  return apiClient({
    endpoint: `/services?status=${status}&per_page=${perPage}`,
    method: "GET",
    headers: {
      domain,
      latitude,
      longitude,
      Authorization: `Bearer ${token}`,
    },
  });
};
