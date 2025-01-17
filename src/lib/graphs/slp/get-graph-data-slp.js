import createSeriesStructureSlp from "./create-series-structure-slp";
import getFeatureInfo from "@/lib/geoserver_utils/get-feature-info";

export default async function (dataset, lng, lat) {
  const seaLevelRiseData = createSeriesStructureSlp(dataset);
  const promises = [];

  seaLevelRiseData.scenarios.forEach((scenario) => {
    ["msl_h", "msl_m", "msl_l"].forEach((mslType) => {
      const layerNames = scenario[mslType].layer_names;

      const promise = getFeatureInfo({
        layers: layerNames,
        url: "https://coclico.avi.deltares.nl/geoserver/slp/wms",
        lng,
        lat,
      })
        .then((data) => {
          scenario[mslType].values = data;
        })
        .catch((error) => {
          console.error(`Error fetching data for ${mslType}:`, error);
        });

      promises.push(promise);
    });
  });

  try {
    await Promise.all(promises);
    return seaLevelRiseData;
  } catch (error) {
    console.error(error);
  }
}
