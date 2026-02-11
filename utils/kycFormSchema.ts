import { z } from "zod";

const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const addressSchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  permanent_address: z.string().min(1, "Permanent address is required"),
  pincode: z
    .string()
    .length(6, "Pincode must be 6 digits")
    .regex(/^[0-9]{6}$/, "Invalid pincode"),
});

export const kycFormSchema = z
  .object({
    // Identity
    first_name: z.string().min(1, "First name required"),
    last_name: z.string().min(1, "Last name required"),
    email: z.string().email("Invalid email"),
    mobile: z.string().length(10, "10 digits required"),
    dob: z.string().min(1, "DOB required"),
    pan_no: z.string().regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN"
    ),
    aadhar_no: z.string().length(12, "12 digits required"),

    // Address
    address: addressSchema,

    // Business
    business_name: z.string().min(1, "Business name required"),
    business_type: z.string().min(1, "Business type required"),
    is_GST_registered: z.enum(["Yes", "No"]),

    // Optional here, validated conditionally
    GST_number: z.string().optional(),

    // Documents
    aadhar_front: z.any().refine((f) => f?.uri, "Aadhaar front required"),
    aadhar_back: z.any().refine((f) => f?.uri, "Aadhaar back required"),
    pan_card: z.any().refine((f) => f?.uri, "PAN card required"),
    passport_size_photo: z.any().refine(
      (f) => f?.uri,
      "Passport photo required"
    ),
  })
  .superRefine((data, ctx) => {
    if (data.is_GST_registered === "Yes") {
      if (!data.GST_number || data.GST_number.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["GST_number"],
          message: "GST number is required",
        });
      } else if (!GST_REGEX.test(data.GST_number)) {
        ctx.addIssue({
          code: "custom",
          path: ["GST_number"],
          message: "Invalid GST number format",
        });
      }
    }
  });

export type KYCApplicationFormData = z.infer<typeof kycFormSchema>;
