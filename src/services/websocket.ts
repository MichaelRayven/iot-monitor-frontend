import { QueryClient } from "@tanstack/react-query";
import type { FloorDevice, FloorDeviceWithData } from "@/types/device";

// Action formats from the server
type WsUpdateAction = {
  action: "update";
  dev_eui: string;
  floor_id: string; // the server sends floor_id as a string in the update
  device_type: string;
  decoded: { [key: string]: unknown };
};

export function setupWebSocket(
  floorId: number,
  queryClient: QueryClient
): () => void {
  const ws = new WebSocket("ws://localhost:8000/ws");

  ws.onopen = () => {
    ws.send(JSON.stringify({ action: "subscribe", floor_id: floorId }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WsUpdateAction;
      if (data.action === "update") {
        // Find the device ID based on dev_eui to update the individual device data cache
        const floorDevices = queryClient.getQueryData<FloorDevice[]>([
          "floor-devices",
          floorId,
        ]);

        let deviceId: number | undefined;

        if (floorDevices) {
          const device = floorDevices.find((d) => d.dev_eui === data.dev_eui);
          if (device) {
            deviceId = device.id;

            // Also augment the floor-devices item with the latest decoded data
            // so we can use it for alarms on the map
            queryClient.setQueryData<FloorDevice[]>(
              ["floor-devices", floorId],
              (old) => {
                if (!old) return old;
                return old.map((d) => {
                  if (d.dev_eui === data.dev_eui) {
                    return {
                      ...d,
                      ...data.decoded, // Merge decoded properties into the floor device
                      // Keep the latest timestamp from the packet if available
                      last_data_ts:
                        typeof data.decoded.device_timestamp === "number"
                          ? data.decoded.device_timestamp * 1000
                          : d.last_data_ts,
                    };
                  }
                  return d;
                });
              }
            );
          }
        }

        // Update the individual device-data query
        if (deviceId) {
          queryClient.setQueryData<FloorDeviceWithData>(
            ["device-data", deviceId],
            (old) => {
              if (!old) {
                // If we don't have the base structure, we might not be able to fully recreate it,
                // but usually the query is already populated or we wait for fetch.
                return undefined;
              }
              // We append the new decoded data to the list of data items.
              // For a true real-time app we might replace it or prepend it.
              // The user specified: "An incoming update should change the device data list, merge it into query cache."
              return {
                ...old,
                data: [data.decoded, ...old.data],
              };
            }
          );
        }
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message", error);
    }
  };

  // Cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "unsubscribe", floor_id: floorId }));
      ws.close();
    } else {
      // In case the socket was still connecting, close it when opened or immediately
      ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ action: "unsubscribe", floor_id: floorId }));
        ws.close();
      });
      ws.close();
    }
  };
}
