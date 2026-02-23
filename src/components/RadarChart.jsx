import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { CATEGORIES, scoreHex } from "../data/scoring";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const COLORS = [
  { border: "rgba(34,211,238,1)", bg: "rgba(34,211,238,0.2)" },
  { border: "rgba(251,146,60,1)", bg: "rgba(251,146,60,0.2)" },
  { border: "rgba(168,85,247,1)", bg: "rgba(168,85,247,0.2)" },
];

export default function RadarChart({ chemicals }) {
  const data = {
    labels: CATEGORIES.map((c) => c.label.replace("Human Toxicity ", "").replace("(", "\n(").replace("Physical Hazards (fire/explosion)", "Physical\nHazards")),
    datasets: chemicals.map((chem, i) => ({
      label: chem.name,
      data: CATEGORIES.map((c) => chem.scores[c.key]),
      borderColor: COLORS[i % COLORS.length].border,
      backgroundColor: COLORS[i % COLORS.length].bg,
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: COLORS[i % COLORS.length].border,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: chemicals.length > 1,
        labels: { color: "#9fb3c8", font: { size: 11 } },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: "#627d98",
          backdropColor: "transparent",
          font: { size: 10 },
        },
        pointLabels: {
          color: "#9fb3c8",
          font: { size: 10 },
        },
        grid: { color: "rgba(98,125,152,0.3)" },
        angleLines: { color: "rgba(98,125,152,0.2)" },
      },
    },
  };

  return (
    <div className="w-full max-w-[320px]">
      <Radar data={data} options={options} />
    </div>
  );
}
