import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export type HeatmapMetric = 'DENSITY' | 'URGENCY' | 'SYNC_STATUS' | 'RISK_SCORE';

export interface HeatmapLayerProps {
  points: Array<[number, number, number]>;
  metric?: HeatmapMetric;
  gradient?: { [key: number]: string };
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
  max?: number;
}

// Enterprise color profiles tuned for contrast & quick comprehension
export const METRIC_GRADIENTS: Record<HeatmapMetric, { [key: number]: string }> = {
  // Density: Blue (Sparse) -> Cyan -> Emerald -> Amber -> Red (High Concentration)
  DENSITY: {
    0.2: '#2563eb',
    0.4: '#06b6d4',
    0.6: '#10b981',
    0.8: '#f59e0b',
    1.0: '#dc2626'
  },
  // Urgency: Soft Amber (Normal) -> Vivid Orange -> High-Alert Crimson Red (Urgent Queue)
  URGENCY: {
    0.2: '#fde68a',
    0.4: '#fbbf24',
    0.65: '#f97316',
    0.85: '#ef4444',
    1.0: '#991b1b'
  },
  // Sync Status: Emerald (Synced) -> Indigo (Local Draft) -> Amber (Pending Sync) -> Crimson (Conflict)
  SYNC_STATUS: {
    0.15: '#10b981',
    0.45: '#6366f1',
    0.75: '#f59e0b',
    1.0: '#dc2626'
  },
  // Risk Score: Sky (Low) -> Yellow -> Orange -> Crimson (Critical Failures)
  RISK_SCORE: {
    0.2: '#38bdf8',
    0.5: '#eab308',
    0.75: '#f97316',
    1.0: '#ef4444'
  }
};

export const METRIC_CONFIGS: Record<HeatmapMetric, {
  label: string;
  shortLabel: string;
  description: string;
  legend: Array<{ label: string; color: string }>;
}> = {
  DENSITY: {
    label: 'Inspection Density',
    shortLabel: 'Density',
    description: 'Volume and spatial clustering of field walkthroughs across operating zones',
    legend: [
      { label: 'Sparse', color: '#2563eb' },
      { label: 'Moderate', color: '#10b981' },
      { label: 'Dense Activity', color: '#dc2626' }
    ]
  },
  URGENCY: {
    label: 'Urgency Priority Level',
    shortLabel: 'Urgency Level',
    description: 'Hotspots of urgent-flagged verifications and SWA escalations requiring priority supervisor response',
    legend: [
      { label: 'Normal Priority', color: '#fde68a' },
      { label: 'High Priority', color: '#f97316' },
      { label: 'Urgent Queue', color: '#991b1b' }
    ]
  },
  SYNC_STATUS: {
    label: 'Data Synchronization State',
    shortLabel: 'Sync Status',
    description: 'Offline data backlog, unsynced field payloads, and merge conflict clusters',
    legend: [
      { label: 'Synced', color: '#10b981' },
      { label: 'Draft', color: '#6366f1' },
      { label: 'Pending Sync', color: '#f59e0b' },
      { label: 'Conflict', color: '#dc2626' }
    ]
  },
  RISK_SCORE: {
    label: 'Non-Conformance & Risk Severity',
    shortLabel: 'Risk Score',
    description: 'Spatial concentration of safety check failures, defects, and missing physical barriers',
    legend: [
      { label: 'Pass / Low Risk', color: '#38bdf8' },
      { label: 'Warning', color: '#eab308' },
      { label: 'Defect / High Risk', color: '#ef4444' }
    ]
  }
};

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ 
  points, 
  metric = 'DENSITY',
  gradient, 
  radius = 28, 
  blur = 18, 
  maxZoom = 17,
  minOpacity = 0.25,
  max = 1.0
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!points || points.length === 0) return;

    const activeGradient = gradient || METRIC_GRADIENTS[metric] || METRIC_GRADIENTS.DENSITY;
    
    // @ts-ignore - leaflet.heat adds L.heatLayer
    const heatLayer = L.heatLayer(points, {
      radius,
      blur,
      maxZoom,
      minOpacity,
      max,
      gradient: activeGradient
    }).addTo(map);

    return () => {
      try {
        map.removeLayer(heatLayer);
      } catch (e) {
        // layer might be already removed by map container
      }
    };
  }, [map, points, metric, gradient, radius, blur, maxZoom, minOpacity, max]);

  return null;
};
