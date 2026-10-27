import React from 'react';

/**
 * 10-Attribute SCA Cupping Radar Chart rendered in SVG
 * Attributes:
 * Fragrance, Flavor, Aftertaste, Acidity, Body, Balance, Uniformity, Clean Cup, Sweetness, Overall
 */
export default function CuppingRadar({ scores = {}, size = 260 }) {
  const attributes = [
    { key: 'fragrance', label: 'Fragrance', max: 10 },
    { key: 'flavor', label: 'Flavor', max: 10 },
    { key: 'aftertaste', label: 'Aftertaste', max: 10 },
    { key: 'acidity', label: 'Acidity', max: 10 },
    { key: 'body', label: 'Body', max: 10 },
    { key: 'balance', label: 'Balance', max: 10 },
    { key: 'cleanCup', label: 'Clean Cup', max: 10 },
    { key: 'sweetness', label: 'Sweetness', max: 10 },
    { key: 'uniformity', label: 'Uniformity', max: 10 },
    { key: 'overall', label: 'Overall', max: 10 },
  ];

  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = attributes.length;

  // Generate web rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Calculate coordinates for attribute points
  const points = attributes.map((attr, index) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const value = scores[attr.key] !== undefined ? scores[attr.key] : 8.0;
    // Scale 0 to 10
    const normalized = Math.min(Math.max(value / 10, 0), 1);
    const r = radius * normalized;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle, label: attr.label, val: value };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background Rings */}
        {rings.map((ringFactor, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius * ringFactor}
            fill="none"
            stroke="rgba(242, 169, 0, 0.12)"
            strokeDasharray={i === rings.length - 1 ? 'none' : '3,3'}
            strokeWidth="1"
          />
        ))}

        {/* Axis Spokes */}
        {attributes.map((_, index) => {
          const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
          const xEnd = center + radius * Math.cos(angle);
          const yEnd = center + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={xEnd}
              y2={yEnd}
              stroke="rgba(204, 111, 0, 0.25)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={polygonPath}
          fill="rgba(242, 169, 0, 0.28)"
          stroke="#F2A900"
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out"
        />

        {/* Data Vertices */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#F9E6A8"
            stroke="#CC6F00"
            strokeWidth="1.5"
          />
        ))}

        {/* Attribute Labels */}
        {points.map((p, idx) => {
          const labelDist = radius + 20;
          const lx = center + labelDist * Math.cos(p.angle);
          const ly = center + labelDist * Math.sin(p.angle) + 4;
          return (
            <text
              key={`label-${idx}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              className="fill-amber-200 text-[10px] font-semibold tracking-wider uppercase"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
