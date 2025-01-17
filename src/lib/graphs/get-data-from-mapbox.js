import { getLayerName } from "@/lib/layers";

export default function (layer, properties) {
  const layerName = getLayerName(layer);
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => key.includes(layerName))
  );
}
