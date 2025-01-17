import getCatalog from "@/lib/request/get-catalog";
import { getLayerType, getResourceLayers } from "@/lib/layers";
import { getCollections } from "@/lib/catalog";

export default {
  namespaced: true,
  state: {
    themes: [],
    datasets: [],
    activeTheme: null,
    activeDatasets: [],
    mapboxSources: [],
    mapboxLayers: [], //wmsLayers state have the format that is needed to add the layers on the map
    seaLevelRiseData: {},
    clickableDatasetsIds: [], // Not all layers are clickable. Only the ones in user stories.
    // perhaps we can provide that from the catalog.
  },
  getters: {
    themes(state) {
      return state.themes;
    },
    activeTheme(state) {
      return state.activeTheme;
    },
    datasetsInActiveTheme(state) {
      if (!state.activeTheme) {
        return state.datasets;
      }
      return state.datasets.filter((dataset) =>
        dataset?.keywords?.includes(state.activeTheme)
      );
    },
    activeDatasets(state) {
      return state.activeDatasets;
    },
    activeDatasetIds(state) {
      return state.activeDatasets.map(({ id }) => id);
    },
    mapboxLayers(state) {
      return state.mapboxLayers;
    },
    mapboxSources(state) {
      return state.mapboxSources;
    },
    seaLevelRiseData(state) {
      return state.seaLevelRiseData;
    },
    activeClickableDataset(state) {
      return state.activeDatasets.find((dataset) =>
        state.clickableDatasetsIds.includes(dataset.id)
      );
    },
  },
  mutations: {
    ADD_THEME(state, themeObject) {
      state.themes = [...state.themes, themeObject];
    },
    //Add or remove number of selected datasets of the theme.
    UPDATE_NUMBER_OF_ACTIVE_DATASETS_ON_THEME(state, { name, count }) {
      state.themes = state.themes.map((themeObject) => {
        if (themeObject.name === name) {
          return { ...themeObject, count: count };
        } else {
          return themeObject;
        }
      });
    },
    ADD_DATASET(state, dataset) {
      state.datasets = [...state.datasets, dataset];
    },
    SET_ACTIVE_THEME(state, theme) {
      state.activeTheme = theme;
    },
    ADD_ACTIVE_DATASET(state, dataset) {
      state.activeDatasets = [dataset, ...state.activeDatasets];
      const activeClickableDataset = state.activeDatasets.find(({ id }) =>
        state.clickableDatasetsIds.includes(id)
      );
      if (activeClickableDataset) {
        state.activeClickableDataset = activeClickableDataset;
      }
    },
    REMOVE_ACTIVE_DATASET(state, id) {
      state.activeDatasets = state.activeDatasets.filter(
        (activeDataset) => activeDataset.id !== id
      );
      // Set clickableDataset
      if (state.activeDatasets.length === 0) {
        state.activeClickableDataset = null;
      } else {
        if (state.clickableDatasetsIds.includes(state.activeDatasets[0].id)) {
          state.activeClickableDataset = state.activeDatasets[0];
        }
      }
    },
    ADD_MAPBOX_LAYER(state, mapboxLayer) {
      state.mapboxLayers = [...state.mapboxLayers, mapboxLayer];
    },
    ADD_CLICKABLE_LAYER(state, layer) {
      const id = layer.id.replace("_geoserver_link", "");
      state.clickableDatasetsIds = [...state.clickableDatasetsIds, id];
    },
    REMOVE_MAPBOX_LAYER(state, id) {
      state.mapboxLayers = state.mapboxLayers.filter(
        (mapboxLayer) => mapboxLayer.id !== id
      );
    },
    ADD_MAPBOX_SOURCE(state, mapboxSource) {
      state.mapboxSources = [...state.mapboxSources, mapboxSource];
    },
    REMOVE_MAPBOX_SOURCE(state, id) {
      state.mapboxSources = state.mapboxSources.filter(
        (mapboxSource) => mapboxSource.id !== id
      );
    },
    SET_SEA_LEVEL_RISE_DATA(state, data) {
      state.seaLevelRiseData = data;
    },
  },
  actions: {
    addMapboxLayer({ commit }, mapboxLayer) {
      commit("ADD_MAPBOX_LAYER", mapboxLayer);
    },
    removeMapboxLayer({ commit }, id) {
      commit("REMOVE_MAPBOX_LAYER", id);
    },
    addMapboxSource({ commit }, mapboxSource) {
      commit("ADD_MAPBOX_SOURCE", mapboxSource);
    },
    removeMapboxSource({ commit }, id) {
      commit("REMOVE_MAPBOX_SOURCE", id);
    },
    async loadDatasets({ commit }) {
      const catalog = await getCatalog(process.env.VUE_APP_CATALOG_URL);
      catalog?.summaries?.keywords.forEach((keyword) =>
        commit("ADD_THEME", { name: keyword, count: 0 })
      );
      const collections = await getCollections(catalog);
      collections.forEach((collection) => commit("ADD_DATASET", collection));
    },
    setActiveTheme({ commit }, theme) {
      commit("SET_ACTIVE_THEME", theme);
    },
    updateThemeObject({ commit, getters }) {
      const countActiveDatasets = getters.datasetsInActiveTheme.filter(
        (dataset) => dataset.active === true
      ).length;
      commit("UPDATE_NUMBER_OF_ACTIVE_DATASETS_ON_THEME", {
        name: getters.activeTheme,
        count: countActiveDatasets,
      });
    },
    async loadDatasetOnMap({ commit }, dataset) {
      const layers = await getResourceLayers(dataset);
      await Promise.all(
        layers.map((layer) => {
          const layerType = getLayerType(layer);
          if (layerType === "clickable") {
            commit("ADD_CLICKABLE_LAYER", layer);
          }
          commit("ADD_MAPBOX_LAYER", layer);
        })
      );
    },
    //Used when new selections have been made
    reloadDatasetOnMap({ commit, dispatch }, dataset) {
      commit("REMOVE_MAPBOX_LAYER", dataset.id);
      dispatch("loadDatasetOnMap", dataset);
    },
    updateActiveDatasetsArray({ state, commit, dispatch }, dataset) {
      const datasetExist = state.activeDatasets.some(
        (activeDataset) => activeDataset.id === dataset.id
      );
      if (datasetExist) {
        commit("REMOVE_ACTIVE_DATASET", dataset.id);
        commit("REMOVE_MAPBOX_LAYER", `${dataset.id}_visual`);
        commit("REMOVE_MAPBOX_LAYER", `${dataset.id}_mapbox`);
        commit("REMOVE_MAPBOX_LAYER", `${dataset.id}`);
        // if transparent layer remove also this one
        if (!dataset?.assets?.["geoserver_link"]) return;
        commit("REMOVE_MAPBOX_LAYER", "lau_nuts_cfhp");
        commit("REMOVE_MAPBOX_LAYER", "cfhp_focused");
      } else {
        commit("ADD_ACTIVE_DATASET", dataset);
        dispatch("loadDatasetOnMap", dataset);
      }
    },
    setSeaLevelRiseData({ commit }, graph) {
      commit("SET_SEA_LEVEL_RISE_DATA", graph);
    },
  },
};
