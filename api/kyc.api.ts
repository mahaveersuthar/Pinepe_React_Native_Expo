import { apiClient } from "./api.client";

export const getKycStatusApi = async (options: {
  
  latitude: string;
  longitude: string;
  token: string;
}) => {
  return apiClient({
    endpoint: "/kyc/status",
    method: "GET",
    headers: {
      
      latitude: options.latitude,
      longitude: options.longitude,
      Authorization: `Bearer ${options.token}`,
    },
  });
};

export const submitKYCForm = async (options: {
  data: any;
  latitude: string;
  longitude: string;
  token: string;
}) => {
  const { data } = options;
  const formData = new FormData();

  /* ---------- REQUIRED FILES ---------- */
  formData.append("passport_size_photo", data.passport_size_photo);
  formData.append("aadhar_front_image", data.aadhar_front);
  formData.append("aadhar_back_image", data.aadhar_back);
  formData.append("pancard_image", data.pan_card);

  /* ---------- REQUIRED TEXT ---------- */
  formData.append("first_name", data.first_name);
  formData.append("last_name", data.last_name);
  formData.append("email", data.email);
  formData.append("phone", data.mobile);
  formData.append("gst", data.is_GST_registered);
  formData.append("aadhar_number", data.aadhar_no.replace(/\D/g, ""));
  formData.append("pancard_number", data.pan_no.toUpperCase());

  /* ---------- OPTIONAL TEXT ---------- */
  formData.append("business_name", data.business_name || "");
  formData.append("date_of_birth", data.dob || "");
  formData.append("business_type", data.business_type || "");

  formData.append(
    "permanent_address",
    data.address?.permanent_address || ""
  );
  formData.append("city", data.address?.city || "");
  formData.append("state", data.address?.state || "");
  formData.append("pin_code", data.address?.pincode || "");

  if (data.is_GST_registered === "Yes") {
    formData.append("gst_number", data.GST_number || "");
  }

  /* ---------- LOCATION (SAFE EVEN IF BACKEND IGNORES) ---------- */
  formData.append("latitude", options.latitude);
  formData.append("longitude", options.longitude);

  return apiClient({
    endpoint: "/kyc/submit",
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
