export interface SerializedEvent {
  id: string;
  name: string;
  location: string;
  datetime: string;
  details: string;
  createdAt: string;
  participantCount: number;
  isParticipating: boolean;
  school: {
    id: string;
    name: string;
  } | null;
}
