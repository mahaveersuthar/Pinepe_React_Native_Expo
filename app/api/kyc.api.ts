import { apiClient } from "./api.client";

export const getKycStatusApi = async (options: {
  domain: string;
  latitude: string;
  longitude: string;
  token: string;
}) => {
  return apiClient({
    endpoint: "/kyc/status",
    method: "GET",
    headers: {
      domain: options.domain,
      latitude: options.latitude,
      longitude: options.longitude,
      Authorization: `Bearer ${options.token}`,
    },
  });
};