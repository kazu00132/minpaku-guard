import DeviceControl from '../DeviceControl';

export default function DeviceControlExample() {
  const mockDevices = [
    {
      id: 1,
      name: "玄関ドア",
      type: "lock" as const,
      roomName: "漁師の家",
      status: "online" as const,
      state: "on" as const
    },
    {
      id: 2,
      name: "ブレーカー",
      type: "breaker" as const,
      roomName: "漁師の家",
      status: "online" as const,
      state: "on" as const
    },
    {
      id: 3,
      name: "玄関ドア",
      type: "lock" as const,
      roomName: "長屋 A",
      status: "online" as const,
      state: "off" as const
    }
  ];

  return <DeviceControl devices={mockDevices} onControl={(id, cmd) => console.log('Device control:', id, cmd)} />;
}
