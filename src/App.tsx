import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import "./App.css";
import { FloorPlanCanvas } from "./features/floor-plan/components/FloorPlanCanvas";
import { mockDevices } from "./features/devices/mocks/devices";
import type { Device } from "./features/devices/types";
import { mockFloorPlans } from "./features/floor-plan/mocks/floorPlans";
import type { FloorPlanTransform } from "./features/floor-plan/types";

function App() {
  const [selectedFloorId, setSelectedFloorId] = useState(
    mockFloorPlans[0]?.id ?? ""
  );
  const [transformsByFloorId, setTransformsByFloorId] = useState<
    Record<string, FloorPlanTransform>
  >(() =>
    Object.fromEntries(
      mockFloorPlans.map((floorPlan) => [
        floorPlan.id,
        floorPlan.initialTransform,
      ])
    )
  );
  const [devicesById, setDevicesById] = useState<Record<string, Device>>(() =>
    Object.fromEntries(mockDevices.map((device) => [device.id, device]))
  );

  const selectedFloorPlan = useMemo(
    () => mockFloorPlans.find((floorPlan) => floorPlan.id === selectedFloorId),
    [selectedFloorId]
  );

  const floorDevices = useMemo(
    () =>
      Object.values(devicesById).filter(
        (device) => device.floorPlanId === selectedFloorPlan?.id
      ),
    [devicesById, selectedFloorPlan?.id]
  );

  if (mockFloorPlans.length === 0) {
    return (
      <main className="app">
        <section className="panel empty-state">
          <h1>Monitoring Dashboard</h1>
          <p>No floor plans are configured yet.</p>
        </section>
      </main>
    );
  }

  if (!selectedFloorPlan) {
    return (
      <main className="app">
        <section className="panel empty-state">
          <h1>Monitoring Dashboard</h1>
          <p>Selected floor plan was not found.</p>
        </section>
      </main>
    );
  }

  const selectedTransform =
    transformsByFloorId[selectedFloorPlan.id] ??
    selectedFloorPlan.initialTransform;

  const handleTransformChange = (nextTransform: FloorPlanTransform) => {
    setTransformsByFloorId((currentTransforms) => ({
      ...currentTransforms,
      [selectedFloorPlan.id]: nextTransform,
    }));
  };

  const handleDeviceDrop = (deviceId: string, x: number, y: number) => {
    setDevicesById((currentDevices) => {
      const device = currentDevices[deviceId];

      if (!device || device.floorPlanId !== selectedFloorPlan.id) {
        return currentDevices;
      }

      return {
        ...currentDevices,
        [deviceId]: {
          ...device,
          x,
          y,
        },
      };
    });
  };

  const handleDeviceMove = (deviceId: string, x: number, y: number) => {
    setDevicesById((currentDevices) => {
      const device = currentDevices[deviceId];

      if (!device || device.floorPlanId !== selectedFloorPlan.id) {
        return currentDevices;
      }

      return {
        ...currentDevices,
        [deviceId]: {
          ...device,
          x,
          y,
        },
      };
    });
  };

  const handleSidebarDragStart = (
    event: DragEvent<HTMLLIElement>,
    deviceId: string
  ) => {
    event.dataTransfer.setData("application/device-id", deviceId);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <main className="app">
      <header className="panel toolbar">
        <div>
          <h1>Monitoring Dashboard</h1>
        </div>
        <label className="floor-select" htmlFor="floor-selector">
          Floor
          <select
            id="floor-selector"
            value={selectedFloorPlan.id}
            onChange={(event) => setSelectedFloorId(event.target.value)}
          >
            {mockFloorPlans.map((floorPlan) => (
              <option key={floorPlan.id} value={floorPlan.id}>
                {floorPlan.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="content-grid">
        <aside className="panel sidebar">
          <h2>Devices</h2>
          <p className="sidebar-help">
            Drag a device and drop it on the floor plan.
          </p>
          <ul className="device-list">
            {floorDevices.map((device) => (
              <li
                key={device.id}
                className="device-item"
                draggable
                onDragStart={(event) =>
                  handleSidebarDragStart(event, device.id)
                }
              >
                <div>
                  <strong>{device.name}</strong>
                  <p>{device.type}</p>
                </div>
                <span>
                  {typeof device.x === "number" ? "Placed" : "Unplaced"}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="panel canvas-panel">
          <FloorPlanCanvas
            floorPlan={selectedFloorPlan}
            transform={selectedTransform}
            devices={floorDevices}
            onTransformChange={handleTransformChange}
            onDeviceDrop={handleDeviceDrop}
            onDeviceMove={handleDeviceMove}
          />
        </section>
      </section>
    </main>
  );
}

export default App;
