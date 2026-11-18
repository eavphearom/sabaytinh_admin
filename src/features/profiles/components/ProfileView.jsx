
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  Eye,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import Button from "../../../components/ui/Button";

function createFormValues(profile) {
  return {
    username: profile.username ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    profile: null,
  };
}

export default function ProfileView({
  profile,
  onSave,
  isUpdating = false,
}) {
  const [form, setForm] = useState(() => createFormValues(profile));
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [failedImageUrl, setFailedImageUrl] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);

  // Preview is generated only when a new photo is selected.
  useEffect(() => {
    if (!(form.profile instanceof File)) return;

    const objectUrl = URL.createObjectURL(form.profile);

    setSelectedImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.profile]);

  const displayName = profile.username || "-";
  const displayEmail = profile.email || "-";
  const role = profile.role || "-";

  const status =
    profile.is_active === true
      ? "Active"
      : profile.is_active === false
        ? "Inactive"
        : "Unknown";

  const createdDate = formatDate(profile.created_at);

  const memberSince = formatDate(profile.created_at, {
    month: "short",
    year: "numeric",
  });

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const imageUrl = selectedImageUrl || profile.profile;
  const imageError = failedImageUrl === imageUrl;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setSaveError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Profile image must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setForm((previous) => ({
      ...previous,
      profile: file,
    }));

    setFailedImageUrl(null);
    setSaveError("");
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setForm(createFormValues(profile));
    setSelectedImageUrl(null);
    setFailedImageUrl(null);
    setSaveError("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaveError("");
    setSuccessMessage("");

    if (!form.username.trim()) {
      setSaveError("Username is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setSaveError("Please enter a valid email.");
      return;
    }

    try {
      await onSave(form);

      setForm((previous) => ({
        ...previous,
        profile: null,
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setSaveError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile."
      );
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-[#64748B]">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-semibold text-[#03152B]">
            My Profile
          </span>
        </div>

        <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Profile Header */}
      <section className="rounded-lg border border-[#D7DFEA] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#FFF7ED] text-2xl font-bold text-[#F97316] ring-4 ring-[#F1F5F9]">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={`${displayName} profile`}
                    className="h-full w-full object-cover"
                    onError={() => setFailedImageUrl(imageUrl)}
                  />
                ) : (
                  initials
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#D7DFEA] bg-white text-[#03152B] shadow-sm transition hover:bg-[#F7F9FC] disabled:opacity-50"
                aria-label="Change profile photo"
              >
                <Camera size={15} />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#03152B]">
                {displayName}
              </h2>

              <p className="text-sm text-[#64748B]">
                {displayEmail}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-[#FFF7ED] px-2 py-1 text-xs font-semibold text-[#F97316]">
                  {role}
                </span>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
              Member Since
            </p>
            <p className="mt-1 text-sm font-semibold text-[#03152B]">
              {memberSince}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-[#D7DFEA] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-[#F97316]"
              />

              <h2 className="text-lg font-bold text-[#03152B]">
                Account Information
              </h2>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3">
                <dt className="text-[#64748B]">Role</dt>
                <dd className="font-semibold text-[#03152B]">
                  {role}
                </dd>
              </div>

              <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3">
                <dt className="text-[#64748B]">Status</dt>
                <dd
                  className={`font-semibold ${
                    status === "Active"
                      ? "text-[#15803D]"
                      : "text-[#64748B]"
                  }`}
                >
                  {status}
                </dd>
              </div>

              <div className="flex items-center justify-between border-b border-[#EEF2F7] pb-3">
                <dt className="text-[#64748B]">
                  Created Date
                </dt>
                <dd className="font-semibold text-[#03152B]">
                  {createdDate}
                </dd>
              </div>

              {/* <div className="flex items-center justify-between">
                <dt className="text-[#64748B]">Last Login</dt>
                <dd className="font-semibold text-[#03152B]">Aug 25, 2026</dd>
              </div> */}
            </dl>
          </section>

          {/* <section className="rounded-lg bg-[#1E2B3F] p-5 text-white shadow-sm">
            <p className="text-sm font-semibold">Security Score</p>
            <p className="mt-1 text-xs text-[#8FA2BD]">
              Your account has strong protection enabled.
            </p>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 w-[86%] rounded-full bg-[#F97316]" />
            </div>
          </section> */}
        </aside>

        <div className="space-y-5">
          <section className="rounded-lg border border-[#D7DFEA] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-[#EEF2F7] pb-4">
              <User
                size={18}
                className="text-[#F97316]"
              />
              <h2 className="text-lg font-bold text-[#03152B]">
                Personal Information
              </h2>
            </div>

            <form onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  icon={Phone}
                  placeholder="Enter phone number"
                />

                <Field
                  label="Email Address"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  icon={Mail}
                  type="email"
                  className="sm:col-span-2"
                  required
                />
              </div>

              {saveError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                  {saveError}
                </p>
              )}

              {successMessage && (
                <p
                  role="status"
                  className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                  {successMessage}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-[#EEF2F7] pt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#03152B] transition hover:bg-[#F1F5F9] disabled:opacity-50"
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  loading={isUpdating}
                  className="gap-2 bg-[#F97316] hover:bg-[#EA580C]"
                >
                  <CalendarDays size={15} />
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          {/* <section className="rounded-lg border border-[#D7DFEA] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b border-[#EEF2F7] pb-4">
              <LockKeyhole size={18} className="text-red-500" />
              <h2 className="text-lg font-bold text-[#03152B]">Security</h2>
            </div>

            <h3 className="mb-4 text-sm font-bold text-[#03152B]">
              Change Password
            </h3>

            <div className="space-y-4">
              <PasswordField label="Current Password" value="••••••••" />
              <div className="grid gap-4 sm:grid-cols-2">
                <PasswordField label="New Password" value="" />
                <PasswordField label="Confirm Password" value="" />
              </div>
            </div>
          </section> */}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold ${
        status === "Active"
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#F1F5F9] text-[#64748B]"
      }`}
    >
      {status}
    </span>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  className = "",
  placeholder = "",
  type = "text",
  required = false,
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-[#03152B]">
        {label}
      </span>

      <span className="relative block">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`h-10 w-full rounded-lg border border-[#D7DFEA] bg-[#F7F9FC] px-3 text-sm text-[#03152B] outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/10 ${
            Icon ? "pl-9" : ""
          }`}
        />
      </span>
    </label>
  );
}

function PasswordField({ label, value }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#03152B]">
        {label}
      </span>
      <span className="relative block">
        <input
          type="password"
          value={value}
          readOnly
          placeholder="Enter password"
          className="h-10 w-full rounded-lg border border-[#D7DFEA] bg-[#F7F9FC] px-3 pr-9 text-sm text-[#03152B] outline-none transition placeholder:text-[#8A98AA] focus:border-[#F97316] focus:bg-white focus:ring-2 focus:ring-[#F97316]/10"
        />
        <Eye
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
        />
      </span>
    </label>
  );
}

function formatDate(value, options = {
  month: "short",
  day: "numeric",
  year: "numeric",
}) {
  if (!value) return "-";

  const datePart = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) return "-";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}
