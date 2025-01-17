import { get, has } from "lodash-es";
import getDataFromRaster from "@/lib/graphs/get-data-from-raster";
import getDataFromZarr from "@/lib/graphs/get-data-from-zarr";
import getDataFromMapbox from "@/lib/graphs/get-data-from-mapbox";

export const graphTypes = {
  FLOOD_EXTEND: "flood-extend-graph",
  LINE_CHART: "line-chart-zarr",
  SEA_LEVEL_RISE: "sea-level-rise",
};

const getGraphType = (id) => {
  const graphType = {
    cfhp: graphTypes.FLOOD_EXTEND,
    eesl: graphTypes.LINE_CHART,
    sc: graphTypes.LINE_CHART,
    slp: graphTypes.SEA_LEVEL_RISE,
    ssl: graphTypes.LINE_CHART,
    cba: graphTypes.FLOOD_EXTEND,
  }[id];
  return graphType || graphTypes.LINE_CHART;
};

export default {
  namespaced: true,
  state: {
    graphData: null,
  },
  getters: {
    graphData(state) {
      return state.graphData;
    },
  },
  mutations: {
    ADD_GRAPH_DATA(state, data) {
      state.graphData = data;
    },
    EMPTY_GRAPH_DATA(state) {
      state.graphData = null;
    },
  },
  actions: {
    emptyGraphData({ commit }) {
      commit("EMPTY_GRAPH_DATA");
    },

    async getGraphData({ rootGetters, commit }, { lng, lat, features }) {
      //TODO: after demo refactor the if statements
      const currentGraphDataset = rootGetters["map/activeClickableDataset"];
      const mapboxLayers = rootGetters["map/mapboxLayers"];
      const coords = { lat, lng };
      if (!currentGraphDataset) {
        return;
      }
      const datasetId = currentGraphDataset.id;
      const graphType = getGraphType(datasetId);
      if (currentGraphDataset?.assets?.geoserver_link) {
        const mapboxLayer = mapboxLayers.find(
          (layer) => layer.id === `${currentGraphDataset.id}_visual`
        );
        const graphData = getDataFromMapbox(mapboxLayer, features.properties);
        commit("ADD_GRAPH_DATA", {
          ...graphData,
          datasetId,
          graphType,
          coords,
        });
      } else {
        const layerType = has(currentGraphDataset, "cube:dimensions")
          ? "vector"
          : "raster";

        if (layerType === "raster") {
          try {
            const graphData = await getDataFromRaster(
              currentGraphDataset,
              lng,
              lat
            );
            commit("ADD_GRAPH_DATA", {
              ...graphData,
              datasetId,
              graphType,
              coords,
            });
          } catch (error) {
            console.error("Error getting raster data:", error);
          }
        } else {
          const type = get(currentGraphDataset, "assets.data.roles").includes(
            "zarr-root"
          )
            ? "zarr"
            : "mapbox";

          if (type === "zarr") {
            try {
              const graphData = await getDataFromZarr(
                currentGraphDataset,
                features
              );
              commit("ADD_GRAPH_DATA", {
                ...graphData,
                datasetId,
                graphType,
                coords,
              });
            } catch (error) {
              console.error("Error getting zarr data:", error);
            }
          } else {
            console.error("Mapbox data not implemented yet");
          }
        }
      }
    },
  },
};
