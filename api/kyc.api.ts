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
  const formData = new FormData();

  console.log("Submitting KYC with data:", options.data);

  /* ---------- FILES ---------- */
  formData.append("passport_size_photo", options.data.passport_size_photo);
  formData.append("aadhar_front_image", options.data.aadhar_front);
  formData.append("aadhar_back_image", options.data.aadhar_back);
  formData.append("pancard_image", options.data.pan_card);

  /* ---------- TEXT FIELDS ---------- */
  formData.append("first_name", options.data.first_name);
  formData.append("last_name", options.data.last_name);
  formData.append("email", options.data.email);
  formData.append("phone", options.data.mobile);
  formData.append("date_of_birth", options.data.dob);
  formData.append("aadhar_number", options.data.aadhar_no);
  formData.append("pancard_number", options.data.pan_no);

  formData.append("business_name", options.data.business_name);
  formData.append("business_type", options.data.business_type);
  formData.append("gst", options.data.is_GST_registered);

  if (options.data.is_GST_registered === "Yes") {
    formData.append("gst_number", options.data.GST_number);
  }

  formData.append(
    "permanent_address",
    options.data.address.permanent_address
  );
  formData.append("state", options.data.address.state);
  formData.append("city", options.data.address.city);
  formData.append("pin_code", options.data.address.pincode);

  return apiClient({
    endpoint: "/kyc/submit",
    method: "POST",
    body: formData,
    headers: {
      latitude: options.latitude,
      longitude: options.longitude,
      Authorization: `Bearer ${options.token}`,
      
    },
  });
};
