export interface SerializedJob {
  id: string;
  name: string;
  type?: string;
  contactEmail: string;
  details: string;
  createdAt: string;
  additional_info?: Record<string, string>;
  school: {
    id: string;
    name: string;
    location: string;
  } | null;
}
