import { useMemo, useState } from "react";
import "./App.css";
import { FloorPlanCanvas } from "./features/floor-plan/components/FloorPlanCanvas";
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

  const selectedFloorPlan = useMemo(
    () => mockFloorPlans.find((floorPlan) => floorPlan.id === selectedFloorId),
    [selectedFloorId]
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

      <section className="panel canvas-panel">
        <FloorPlanCanvas
          floorPlan={selectedFloorPlan}
          transform={selectedTransform}
          onTransformChange={handleTransformChange}
        />
      </section>
    </main>
  );
}

export default App;
