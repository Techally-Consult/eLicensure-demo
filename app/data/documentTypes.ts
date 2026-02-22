/** Predefined document types applicants can "upload" (mock). One document per type per application. */
export interface DocumentTypeDef {
  id: string;
  name: string;
  description: string;
}

export const DOCUMENT_TYPES: DocumentTypeDef[] = [
  {
    id: "payment-receipt",
    name: "Payment Receipt for Evaluation",
    description: "Payment for service fee",
  },
  {
    id: "qualifications",
    name: "Qualifications of Quality Assurance Supervisor Head",
    description: "Professional license of Quality Assurance Supervisor Head",
  },
  {
    id: "employment-agreement",
    name: "Employment Agreement of Quality Assurance Supervisor Head",
    description: "Employment Agreement letter of the Quality Assurance Supervisor Head",
  },
  {
    id: "experience-letter",
    name: "Experience Letter of Quality Assurance Supervisor Head",
    description: "Experience letter of the Quality Assurance Supervisor Head",
  },
  {
    id: "facility-floor-plan",
    name: "Facility Floor Plan",
    description: "Floor plan and layout of the facility",
  },
];
