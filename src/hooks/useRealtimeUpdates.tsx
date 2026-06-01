import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { WS_BASE_URL } from "@/lib/constants";
import type { FloorDevice, FloorDeviceWithData } from "@/types/device";
import { useWebSocket } from "./useWebSocket";

interface DecodedData {
  device_timestamp?: number;
  [key: string]: unknown;
}

interface WsUpdateAction {
  action: "update";
  dev_eui: string; // The WS message uses dev_eui (Vega field name)
  floor_id: number;
  device_type: string;
  decoded: DecodedData;
}

type WsOutgoingPayload =
  | { action: "subscribe"; floor_id: number }
  | { action: "unsubscribe"; floor_id: number };

export function useRealtimeUpdates(floorId: number) {
  const queryClient = useQueryClient();

  const { send, wsRef } = useWebSocket<WsUpdateAction, WsOutgoingPayload>(
    `${WS_BASE_URL}/ws`,
    {
      onOpen: () => {
        console.log("WebSocket Connected");
        send({ action: "subscribe", floor_id: floorId });
      },
      onMessage: (data) => {
        if (data.action !== "update") return;

        let deviceId: number | undefined;

        // Update floor devices list cache — match by uid (which equals dev_eui for Vega sensors)
        queryClient.setQueryData<FloorDevice[]>(
          ["floor-devices", floorId],
          (old) => {
            if (!old) return old;
            return old.map((d) => {
              if (d.uid === data.dev_eui) {
                deviceId = d.id;
                return {
                  ...d,
                  ...data.decoded,
                  last_data_ts:
                    typeof data.decoded.device_timestamp === "number"
                      ? data.decoded.device_timestamp // already seconds
                      : d.last_data_ts,
                };
              }
              return d;
            });
          }
        );

        // Update individual device data cache
        if (deviceId) {
          queryClient.setQueryData<FloorDeviceWithData>(
            ["device-data", deviceId],
            (old) => {
              if (!old) return undefined;
              return {
                ...old,
                data: [data.decoded, ...old.data],
              };
            }
          );
        }
      },
    }
  );

  // Manage subscription/unsubscription when floorId changes
  // without tearing down the underlying TCP WebSocket connection.
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      send({ action: "subscribe", floor_id: floorId });
    }

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ action: "unsubscribe", floor_id: floorId });
      }
    };
  }, [floorId, send, wsRef]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
