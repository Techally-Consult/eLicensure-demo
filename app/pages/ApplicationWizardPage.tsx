import { useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { LicenseType } from "~/types/application";
import type { ApplicantInfo, FacilityInfo, ServiceItem } from "~/types/application";
import type { Facility } from "~/types/facility";
import { useFacilities } from "~/hooks/useFacilities";
import { submitApplication } from "~/data/mockApi";
import { applicationsQueryKey } from "~/hooks/useApplications";

const STEPS = [
  "License type",
  "Applicant",
  "Facility",
  "Services & capacity",
  "Staffing",
  "Infrastructure",
  "Type-specific",
  "Review & submit",
] as const;

const SERVICE_OPTIONS = ["OPD", "Lab", "Pharmacy", "Maternity", "Surgery", "Imaging"];

type WizardState = {
  licenseType: LicenseType | null;
  applicant: Partial<ApplicantInfo> & { authLetterRef?: string };
  facilityId: string;
  facilityNew: Partial<FacilityInfo>;
  services: { name: string; level?: string; bedCapacity?: number }[];
  totalBeds: string;
  staffingHead: { name: string; qualification: string; licenseNumber: string };
  staffRows: { name: string; cadre: string; license: string }[];
  infrastructureDescription: string;
  typeSpecific: {
    new?: { startDate?: string; constructionStatus?: string; readyForInspection?: boolean };
    renewal?: { licenseNumber?: string; issueDate?: string; expiryDate?: string; changes?: string; lastInspection?: string; inspectionSummary?: string };
    additional?: { currentServices?: string; newServices?: { name: string; category: string; beds: string; summary: string }[]; justification?: string; impact?: string };
  };
};

const initialWizardState: WizardState = {
  licenseType: null,
  applicant: {},
  facilityId: "",
  facilityNew: {},
  services: [],
  totalBeds: "",
  staffingHead: { name: "", qualification: "", licenseNumber: "" },
  staffRows: [],
  infrastructureDescription: "",
  typeSpecific: {},
};

export function ApplicationWizardPage() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const { data: facilities } = useFacilities();
  const queryClient = useQueryClient();

  const update = useCallback(<K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const selectedFacility: Facility | null =
    facilities?.find((f) => f.id === state.facilityId) ?? null;
  const facilityName =
    state.licenseType === "NEW"
      ? state.facilityNew.name ?? ""
      : selectedFacility?.name ?? "";

  const canNext =
    step === 0 ? state.licenseType != null :
    step === 1 ? Boolean(state.applicant.name?.trim()) :
    step === 2 ? (state.licenseType === "NEW" ? Boolean(state.facilityNew.name?.trim()) : Boolean(state.facilityId)) :
    true;

  const handleNext = () => {
    if (step < 7 && (step !== 0 || state.licenseType) && (step !== 1 || state.applicant.name?.trim()) && (step !== 2 || (state.licenseType === "NEW" ? state.facilityNew.name : state.facilityId))) {
      setStep((s) => Math.min(s + 1, 7));
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const payload = {
      licenseType: state.licenseType!,
      facilityName: facilityName || "Unnamed facility",
      status: "Submitted" as const,
      applicant: state.applicant.name ? { name: state.applicant.name, idType: state.applicant.idType, idNumber: state.applicant.idNumber, phone: state.applicant.phone, email: state.applicant.email, role: state.applicant.role } : undefined,
      facility: state.licenseType === "NEW"
        ? (state.facilityNew.name ? { name: state.facilityNew.name, type: state.facilityNew.type, ownershipType: state.facilityNew.ownershipType, region: state.facilityNew.region, woreda: state.facilityNew.woreda } : undefined)
        : (selectedFacility ? { name: selectedFacility.name, type: selectedFacility.type, licenseNumber: selectedFacility.licenseNumber } : undefined),
      services: state.services.length > 0 ? state.services.map((s) => ({ name: s.name, level: s.level, bedCapacity: s.bedCapacity })) : undefined,
    };
    const created = submitApplication(payload);
    queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    setSubmitted({ id: created.id });
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Application submitted
        </h1>
        <p className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          Your application has been submitted (mock). Application ID: <strong>{submitted.id}</strong>
        </p>
        <div className="flex gap-3">
          <Link
            to="/applications"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View all applications
          </Link>
          <Link
            to="/applications/$id"
            params={{ id: submitted.id }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View this application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        New Application
      </h1>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded px-2 py-1 text-xs font-medium ${i === step ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" : i < step ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        {/* Step 0 – License type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Select License Type
            </h2>
            <div className="space-y-2">
              {(["NEW", "RENEWAL", "ADDITIONAL_SERVICE"] as const).map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="licenseType"
                    checked={state.licenseType === type}
                    onChange={() => update("licenseType", type)}
                    className="h-4 w-4"
                  />
                  <span className="text-gray-900 dark:text-white">
                    {type === "NEW" && "New facility license"}
                    {type === "RENEWAL" && "License renewal"}
                    {type === "ADDITIONAL_SERVICE" && "Additional service license"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 – Applicant */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Applicant Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                <input
                  type="text"
                  value={state.applicant.name ?? ""}
                  onChange={(e) => update("applicant", { ...state.applicant, name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ID type</label>
                <input
                  type="text"
                  value={state.applicant.idType ?? ""}
                  onChange={(e) => update("applicant", { ...state.applicant, idType: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ID number</label>
                <input
                  type="text"
                  value={state.applicant.idNumber ?? ""}
                  onChange={(e) => update("applicant", { ...state.applicant, idNumber: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  value={state.applicant.phone ?? ""}
                  onChange={(e) => update("applicant", { ...state.applicant, phone: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={state.applicant.email ?? ""}
                  onChange={(e) => update("applicant", { ...state.applicant, email: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={state.applicant.role ?? ""}
                  onChange={(e) => update("applicant", { ...state.applicant, role: (e.target.value || undefined) as "owner" | "representative" | undefined })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select</option>
                  <option value="owner">Owner</option>
                  <option value="representative">Representative</option>
                </select>
              </div>
              {state.applicant.role === "representative" && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Authorization letter reference</label>
                  <input
                    type="text"
                    value={state.applicant.authLetterRef ?? ""}
                    onChange={(e) => update("applicant", { ...state.applicant, authLetterRef: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 – Facility */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Facility Information
            </h2>
            {state.licenseType === "NEW" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Facility name *</label>
                  <input
                    type="text"
                    value={state.facilityNew.name ?? ""}
                    onChange={(e) => update("facilityNew", { ...state.facilityNew, name: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <input
                    type="text"
                    value={state.facilityNew.type ?? ""}
                    onChange={(e) => update("facilityNew", { ...state.facilityNew, type: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ownership type</label>
                  <input
                    type="text"
                    value={state.facilityNew.ownershipType ?? ""}
                    onChange={(e) => update("facilityNew", { ...state.facilityNew, ownershipType: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                  <input
                    type="text"
                    value={state.facilityNew.region ?? ""}
                    onChange={(e) => update("facilityNew", { ...state.facilityNew, region: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Woreda</label>
                  <input
                    type="text"
                    value={state.facilityNew.woreda ?? ""}
                    onChange={(e) => update("facilityNew", { ...state.facilityNew, woreda: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Select existing facility *</label>
                <select
                  value={state.facilityId}
                  onChange={(e) => update("facilityId", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select facility</option>
                  {facilities?.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                  ))}
                </select>
                {selectedFacility && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedFacility.name}, {selectedFacility.type}, License: {selectedFacility.licenseNumber}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3 – Services & capacity */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Services & Capacity
            </h2>
            <div className="space-y-2">
              {SERVICE_OPTIONS.map((name) => {
                const entry = state.services.find((s) => s.name === name);
                const checked = Boolean(entry);
                return (
                  <div key={name} className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            update("services", [...state.services, { name }]);
                          } else {
                            update("services", state.services.filter((s) => s.name !== name));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span>{name}</span>
                    </label>
                    {checked && (
                      <>
                        <input
                          type="text"
                          placeholder="Level"
                          value={entry?.level ?? ""}
                          onChange={(e) => {
                            const next = state.services.map((s) =>
                              s.name === name ? { ...s, level: e.target.value } : s
                            );
                            update("services", next);
                          }}
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <input
                          type="number"
                          placeholder="Beds"
                          value={entry?.bedCapacity ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            const next = state.services.map((s) =>
                              s.name === name ? { ...s, bedCapacity: v ? Number(v) : undefined } : s
                            );
                            update("services", next);
                          }}
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Total bed capacity</label>
              <input
                type="text"
                value={state.totalBeds}
                onChange={(e) => update("totalBeds", e.target.value)}
                placeholder="Auto or enter number"
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 4 – Staffing */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Staffing
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Facility head – Name</label>
                <input
                  type="text"
                  value={state.staffingHead.name}
                  onChange={(e) => update("staffingHead", { ...state.staffingHead, name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Qualification</label>
                <input
                  type="text"
                  value={state.staffingHead.qualification}
                  onChange={(e) => update("staffingHead", { ...state.staffingHead, qualification: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">License number</label>
                <input
                  type="text"
                  value={state.staffingHead.licenseNumber}
                  onChange={(e) => update("staffingHead", { ...state.staffingHead, licenseNumber: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Staff</span>
                <button
                  type="button"
                  onClick={() => update("staffRows", [...state.staffRows, { name: "", cadre: "", license: "" }])}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Add row
                </button>
              </div>
              <div className="space-y-2">
                {state.staffRows.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => {
                        const next = [...state.staffRows];
                        next[i] = { ...next[i], name: e.target.value };
                        update("staffRows", next);
                      }}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Cadre"
                      value={row.cadre}
                      onChange={(e) => {
                        const next = [...state.staffRows];
                        next[i] = { ...next[i], cadre: e.target.value };
                        update("staffRows", next);
                      }}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="License"
                      value={row.license}
                      onChange={(e) => {
                        const next = [...state.staffRows];
                        next[i] = { ...next[i], license: e.target.value };
                        update("staffRows", next);
                      }}
                      className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 – Infrastructure */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Infrastructure
            </h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Layout description</label>
              <textarea
                value={state.infrastructureDescription}
                onChange={(e) => update("infrastructureDescription", e.target.value)}
                rows={4}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Floor plan</label>
              <div className="rounded border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                Upload floor plan (placeholder – no real upload)
              </div>
            </div>
          </div>
        )}

        {/* Step 6 – Type-specific */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Type-specific information
            </h2>
            {state.licenseType === "NEW" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Intended start date</label>
                  <input
                    type="date"
                    value={state.typeSpecific.new?.startDate ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, new: { ...(state.typeSpecific.new ?? {}), startDate: e.target.value, constructionStatus: state.typeSpecific.new?.constructionStatus ?? "", readyForInspection: state.typeSpecific.new?.readyForInspection ?? false } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Construction status</label>
                  <input
                    type="text"
                    value={state.typeSpecific.new?.constructionStatus ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, new: { ...(state.typeSpecific.new ?? {}), constructionStatus: e.target.value, startDate: state.typeSpecific.new?.startDate ?? "", readyForInspection: state.typeSpecific.new?.readyForInspection ?? false } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={state.typeSpecific.new?.readyForInspection ?? false}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, new: { ...(state.typeSpecific.new ?? {}), readyForInspection: e.target.checked, startDate: state.typeSpecific.new?.startDate ?? "", constructionStatus: state.typeSpecific.new?.constructionStatus ?? "" } })}
                    className="h-4 w-4"
                  />
                  <span>Ready for inspection</span>
                </label>
              </div>
            )}
            {state.licenseType === "RENEWAL" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Existing license number</label>
                  <input
                    type="text"
                    value={state.typeSpecific.renewal?.licenseNumber ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, renewal: { ...(state.typeSpecific.renewal ?? {}), licenseNumber: e.target.value } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Issue date</label>
                  <input
                    type="date"
                    value={state.typeSpecific.renewal?.issueDate ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, renewal: { ...(state.typeSpecific.renewal ?? {}), issueDate: e.target.value } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry date</label>
                  <input
                    type="date"
                    value={state.typeSpecific.renewal?.expiryDate ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, renewal: { ...(state.typeSpecific.renewal ?? {}), expiryDate: e.target.value } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Changes since last license</label>
                  <textarea
                    value={state.typeSpecific.renewal?.changes ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, renewal: { ...(state.typeSpecific.renewal ?? {}), changes: e.target.value } })}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Last inspection date</label>
                  <input
                    type="date"
                    value={state.typeSpecific.renewal?.lastInspection ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, renewal: { ...(state.typeSpecific.renewal ?? {}), lastInspection: e.target.value } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Inspection summary</label>
                  <input
                    type="text"
                    value={state.typeSpecific.renewal?.inspectionSummary ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, renewal: { ...(state.typeSpecific.renewal ?? {}), inspectionSummary: e.target.value } })}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
            {state.licenseType === "ADDITIONAL_SERVICE" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Current services (read-only)</label>
                  <input
                    type="text"
                    value={state.typeSpecific.additional?.currentServices ?? (selectedFacility?.services.join(", ") ?? "")}
                    readOnly
                    className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">New services</label>
                  {(state.typeSpecific.additional?.newServices ?? []).map((svc, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={svc.name}
                        onChange={(e) => {
                          const next = [...(state.typeSpecific.additional?.newServices ?? [])];
                          next[i] = { ...next[i], name: e.target.value };
                          update("typeSpecific", { ...state.typeSpecific, additional: { ...(state.typeSpecific.additional ?? {}), newServices: next } });
                        }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={svc.category}
                        onChange={(e) => {
                          const next = [...(state.typeSpecific.additional?.newServices ?? [])];
                          next[i] = { ...next[i], category: e.target.value };
                          update("typeSpecific", { ...state.typeSpecific, additional: { ...(state.typeSpecific.additional ?? {}), newServices: next } });
                        }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Beds"
                        value={svc.beds}
                        onChange={(e) => {
                          const next = [...(state.typeSpecific.additional?.newServices ?? [])];
                          next[i] = { ...next[i], beds: e.target.value };
                          update("typeSpecific", { ...state.typeSpecific, additional: { ...(state.typeSpecific.additional ?? {}), newServices: next } });
                        }}
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Staff/equipment"
                        value={svc.summary}
                        onChange={(e) => {
                          const next = [...(state.typeSpecific.additional?.newServices ?? [])];
                          next[i] = { ...next[i], summary: e.target.value };
                          update("typeSpecific", { ...state.typeSpecific, additional: { ...(state.typeSpecific.additional ?? {}), newServices: next } });
                        }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const prev = state.typeSpecific.additional?.newServices ?? [];
                      update("typeSpecific", {
                        ...state.typeSpecific,
                        additional: {
                          ...(state.typeSpecific.additional ?? {}),
                          newServices: [...prev, { name: "", category: "", beds: "", summary: "" }],
                          currentServices: selectedFacility?.services.join(", ") ?? "",
                          justification: state.typeSpecific.additional?.justification ?? "",
                          impact: state.typeSpecific.additional?.impact ?? "",
                        },
                      });
                    }}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Add new service row
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Justification</label>
                  <textarea
                    value={state.typeSpecific.additional?.justification ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, additional: { ...(state.typeSpecific.additional ?? {}), justification: e.target.value } })}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Impact on current services</label>
                  <textarea
                    value={state.typeSpecific.additional?.impact ?? ""}
                    onChange={(e) => update("typeSpecific", { ...state.typeSpecific, additional: { ...(state.typeSpecific.additional ?? {}), impact: e.target.value } })}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}
            {state.licenseType && state.licenseType !== "NEW" && state.licenseType !== "RENEWAL" && state.licenseType !== "ADDITIONAL_SERVICE" && (
              <p className="text-sm text-gray-500">No type-specific fields.</p>
            )}
          </div>
        )}

        {/* Step 7 – Review & submit */}
        {step === 7 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Review & Submit
            </h2>
            <div className="space-y-3 text-sm">
              <section>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">License type</h3>
                <p className="text-gray-600 dark:text-gray-400">{state.licenseType?.replace("_", " ")}</p>
              </section>
              <section>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Applicant</h3>
                <p className="text-gray-600 dark:text-gray-400">{state.applicant.name || "—"} {state.applicant.email && `(${state.applicant.email})`}</p>
              </section>
              <section>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Facility</h3>
                <p className="text-gray-600 dark:text-gray-400">{facilityName || "—"}</p>
              </section>
              <section>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Services</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {state.services.length ? state.services.map((s) => `${s.name}${s.level ? ` (${s.level})` : ""}${s.bedCapacity ? `, ${s.bedCapacity} beds` : ""}`).join("; ") : "—"}
                </p>
              </section>
              <section>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Staffing</h3>
                <p className="text-gray-600 dark:text-gray-400">Head: {state.staffingHead.name || "—"}; {state.staffRows.length} staff row(s)</p>
              </section>
              <section>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Infrastructure</h3>
                <p className="text-gray-600 dark:text-gray-400">{state.infrastructureDescription || "—"}</p>
              </section>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Back
          </button>
          {step < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Submit application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
