import { Text } from "@/components/features/content/ContentProvider";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Calculator as CalcIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estimateHeating, type Insulation } from "@/lib/utils/heating";

export function Calculator() {
  const navigate = useNavigate();
  const [area, setArea] = useState(120);
  const [insulation, setInsulation] = useState<Insulation>("medium");
  const [people, setPeople] = useState(3);
  const power = estimateHeating(area, insulation, people);
  return (
    <div className="calc-panel">
      <h3 className="flex items-center gap-2">
        <CalcIcon size={20} className="text-primary" />
        <Text id="Calculator.text.2">{"Kazánkalkulátor"}</Text>
      </h3>
      <div className="field mt-6">
        <label htmlFor="area">
          <Text id="Calculator.text.3">{"Fűtött alapterület"}</Text>
          <strong>{area} m²</strong>
        </label>
        <input
          id="area"
          type="range"
          min="30"
          max="400"
          step="5"
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
        />
        <div className="range-labels">
          <span>
            <Text id="Calculator.text.4">{"30 m²"}</Text>
          </span>
          <span>
            <Text id="Calculator.text.5">{"400 m²"}</Text>
          </span>
        </div>
      </div>
      <div className="field">
        <label>
          <Text id="Calculator.text.6">{"Szigetelés minősége"}</Text>
        </label>
        <div className="segmented" role="group" aria-label="Szigetelés minősége">
          {(
            [
              { value: "weak", label: "Gyenge" },
              { value: "medium", label: "Közepes" },
              { value: "good", label: "Jó" },
            ] as const
          ).map((x) => (
            <Button
              key={x.value}
              variant={insulation === x.value ? "default" : "outline"}
              aria-pressed={insulation === x.value}
              onClick={() => setInsulation(x.value)}
            >
              {x.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="people">
          <Text id="Calculator.text.7">{"Melegvíz-igény"}</Text>
          <strong>{people} fő</strong>
        </label>
        <input
          id="people"
          type="range"
          min="0"
          max="8"
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
        />
      </div>
      <div className="calc-result" aria-live="polite">
        <div>
          <span>
            <Text id="Calculator.text.8">{"Ajánlott teljesítmény"}</Text>
          </span>
          <p className="m-0 mt-1 text-xs font-semibold">
            <Text id="Calculator.text.9">{"Az Ön otthonának becsült hőigénye"}</Text>
          </p>
        </div>
        <strong>
          {power}{" "}
          <small>
            <Text id="Calculator.text.10">{"kW"}</Text>
          </small>
        </strong>
      </div>
      <Button
        className="w-full h-11 text-xs"
        onClick={() =>
          navigate({ to: "/arajanlat", search: { targy: `Kazánajánlat: ${area} m², ${power} kW` } })
        }
      >
        <Text id="Calculator.text.11">{"Személyre szabott ajánlatot kérek"}</Text>
        <ArrowRight />
      </Button>
      <p className="calc-disclaimer">
        <Text id="Calculator.text.12">
          {
            "Tájékoztató becslés 2,7 m belmagassággal és 10% tartalékkal. Nem helyettesíti a helyszíni hőtechnikai felmérést."
          }
        </Text>
      </p>
    </div>
  );
}
