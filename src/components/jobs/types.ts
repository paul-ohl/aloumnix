export interface SerializedJob {
  id: string;
  name: string;
  details: string;
  createdAt: string;
  additional_info?: Record<string, string>;
  school: {
    id: string;
    name: string;
  } | null;
}
