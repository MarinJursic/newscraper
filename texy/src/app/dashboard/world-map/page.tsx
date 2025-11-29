import ImpactMap from "@/components/ImpactMap";
import MapCard from "@/components/MapCard";
import MapFilters from "@/components/MapFilters";

export default function WorldMapPage() {
  return (
    <div className="ml-8 mx-auto py-8 h-full">
      <MapFilters />
      <ImpactMap />

      <MapCard />
    </div>
  );
}
