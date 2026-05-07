"use client";

import { Batch } from '@/contexts/batches-context';
import { DashboardMap, type MapPosition } from './map';

/**
 * ShipmentMap Wrapper
 * Now uses the premium MapLibre engine (from DashboardMap) 
 * but maintains the same API for backward compatibility.
 */
export function ShipmentMap({ batch, height = "400px" }: { batch: Batch; height?: string }) {
  // Map batch history to MapPositions
  const positions: MapPosition[] = (batch.history || [])
    .filter(h => h.latitude && h.longitude)
    .map(h => ({
      lat: h.latitude!,
      lng: h.longitude!,
      location: h.location,
      status: h.status,
      timestamp: h.timestamp,
      batchId: batch.id,
      drugName: batch.name
    }));

  return (
    <DashboardMap 
      positions={positions} 
      height={height}
      showRoute={true}
    />
  );
}
