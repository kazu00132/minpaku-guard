import GuestTimeline from '../GuestTimeline';

export default function GuestTimelineExample() {
  const mockEvents = [
    {
      id: 1,
      timestamp: "2025-10-20T15:30:00",
      eventType: "enter" as const,
      peopleCount: 4
    },
    {
      id: 2,
      timestamp: "2025-10-20T18:15:00",
      eventType: "enter" as const,
      peopleCount: 6
    },
    {
      id: 3,
      timestamp: "2025-10-20T22:00:00",
      eventType: "leave" as const,
      peopleCount: 2
    }
  ];

  return <GuestTimeline events={mockEvents} />;
}
