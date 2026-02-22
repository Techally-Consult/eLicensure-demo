import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { LicenseType } from "~/types/application";
import type { ApplicantInfo, FacilityInfo, ServiceItem } from "~/types/application";
import type { Application } from "~/types/application";
import type { Facility } from "~/types/facility";
import { useFacilities } from "~/hooks/useFacilities";
import { useApplication } from "~/hooks/useApplication";
import { applicationQueryKey } from "~/hooks/useApplication";
import { submitApplication, updateApplication } from "~/data/mockApi";
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

function applicationToWizardState(app: Application, facilities: Facility[] | undefined): WizardState {
  const facilityId = app.facilityId ?? (app.facility?.licenseNumber
    ? facilities?.find((f) => f.licenseNumber === app.facility?.licenseNumber)?.id ?? ""
    : "");
  return {
    licenseType: app.licenseType,
    applicant: app.applicant
      ? {
          name: app.applicant.name,
          idType: app.applicant.idType,
          idNumber: app.applicant.idNumber,
          phone: app.applicant.phone,
          email: app.applicant.email,
          role: app.applicant.role,
          authLetterRef: app.applicant.authLetterRef,
        }
      : {},
    facilityId,
    facilityNew: app.licenseType === "NEW" && app.facility
      ? {
          name: app.facility.name,
          type: app.facility.type,
          ownershipType: app.facility.ownershipType,
          region: app.facility.region,
          woreda: app.facility.woreda,
        }
      : {},
    services: (app.services ?? []).map((s) => ({ name: s.name, level: s.level, bedCapacity: s.bedCapacity })),
    totalBeds: app.totalBeds ?? "",
    staffingHead: app.staffingHead ?? { name: "", qualification: "", licenseNumber: "" },
    staffRows: (app.staffRows ?? []).map((r) => ({ name: r.name, cadre: r.cadre, license: r.license })),
    infrastructureDescription: app.infrastructureDescription ?? "",
    typeSpecific: app.typeSpecific ?? {},
  };
}

export function ApplicationWizardPage() {
  const { id } = useParams({ strict: false });
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);
  const initializedForId = useRef<string | null>(null);
  const { data: facilities } = useFacilities();
  const { data: application, isLoading: applicationLoading } = useApplication(id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (id && application && facilities !== undefined && initializedForId.current !== id) {
      setState(applicationToWizardState(application, facilities));
      initializedForId.current = id;
    }
    if (!id) initializedForId.current = null;
  }, [id, application, facilities]);

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
    const facilityNameVal = facilityName || "Unnamed facility";
    const fullPayload = {
      licenseType: state.licenseType!,
      facilityName: facilityNameVal,
      applicant: state.applicant.name ? { name: state.applicant.name, idType: state.applicant.idType, idNumber: state.applicant.idNumber, phone: state.applicant.phone, email: state.applicant.email, role: state.applicant.role, authLetterRef: state.applicant.authLetterRef } : undefined,
      facility: state.licenseType === "NEW"
        ? (state.facilityNew.name ? { name: state.facilityNew.name, type: state.facilityNew.type, ownershipType: state.facilityNew.ownershipType, region: state.facilityNew.region, woreda: state.facilityNew.woreda } : undefined)
        : (selectedFacility ? { name: selectedFacility.name, type: selectedFacility.type, licenseNumber: selectedFacility.licenseNumber } : undefined),
      facilityId: state.licenseType !== "NEW" ? state.facilityId || undefined : undefined,
      services: state.services.length > 0 ? state.services.map((s) => ({ name: s.name, level: s.level, bedCapacity: s.bedCapacity })) : undefined,
      totalBeds: state.totalBeds || undefined,
      staffingHead: state.staffingHead.name ? state.staffingHead : undefined,
      staffRows: state.staffRows.length > 0 ? state.staffRows : undefined,
      infrastructureDescription: state.infrastructureDescription || undefined,
      typeSpecific: Object.keys(state.typeSpecific).length > 0 ? state.typeSpecific : undefined,
    };
    if (id) {
      updateApplication(id, fullPayload);
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      queryClient.invalidateQueries({ queryKey: applicationQueryKey(id) });
      setSubmitted({ id });
    } else {
      const created = submitApplication({ ...fullPayload, status: "Submitted" });
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
      setSubmitted({ id: created.id });
    }
  };

  if (submitted) {
    const wasEdit = Boolean(id);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {wasEdit ? "Application saved" : "Application submitted"}
        </h1>
        <p className="rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          {wasEdit
            ? "Your changes have been saved (mock)."
            : "Your application has been submitted (mock). Application ID: "}
          {!wasEdit && <strong>{submitted.id}</strong>}
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/applications">View all applications</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/applications/$id" params={{ id: submitted.id }}>
              View this application
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (id && applicationLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Edit application</h1>
        <p className="text-muted-foreground">Loading application…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">
        {id ? `Edit application ${id}` : "New Application"}
      </h1>
      <Tabs
        value={String(step)}
        onValueChange={(v) => setStep(Number(v))}
        className="w-full"
      >
        <TabsList className="mb-4 flex h-auto w-full flex-wrap gap-1 bg-muted p-1">
          {STEPS.map((label, i) => (
            <TabsTrigger
              key={label}
              value={String(i)}
              className="flex-1 min-w-0 shrink basis-20 text-xs data-[state=active]:bg-background"
            >
              {i + 1}. {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Card>
          <TabsContent value="0" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Select License Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={state.licenseType ?? ""}
                onValueChange={(v) => update("licenseType", v as LicenseType)}
                className="grid gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NEW" id="license-new" />
                  <Label htmlFor="license-new" className="cursor-pointer font-normal">
                    New facility license
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="RENEWAL" id="license-renewal" />
                  <Label htmlFor="license-renewal" className="cursor-pointer font-normal">
                    License renewal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADDITIONAL_SERVICE" id="license-additional" />
                  <Label htmlFor="license-additional" className="cursor-pointer font-normal">
                    Additional service license
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </TabsContent>

          <TabsContent value="1" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="2" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Facility Information</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="3" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Services & Capacity</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="4" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Staffing</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="5" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Infrastructure</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="6" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Type-specific information</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
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
            </CardContent>
          </TabsContent>
          <TabsContent value="7" className="mt-0">
            <CardHeader>
              <CardTitle className="text-base">Review & Submit</CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-6">
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
            </CardContent>
          </TabsContent>
        <div className="mt-6 flex justify-between border-t border-border px-6 pb-6 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < 7 ? (
            <Button type="button" onClick={handleNext} disabled={!canNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              {id ? "Save changes" : "Submit application"}
            </Button>
          )}
        </div>
        </Card>
      </Tabs>
    </div>
  );
}
