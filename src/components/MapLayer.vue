<template>
  <MapboxLayer
    :id="layer.id"
    :options="layer"
    @mb-click="onLayerClicked"
    @mb-mouseenter="onMouseenter"
    @mb-mouseleave="onMouseleave"
  >
  </MapboxLayer>
</template>
<script setup>
import { MapboxLayer, useMap } from "@studiometa/vue-mapbox-gl";
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  layer: {
    type: Object,
    default: () => {},
  },
});
const emit = defineEmits(["click"]);
let mapRef = ref();

onMounted(() => {
  mapRef.value = useMap();
});

onBeforeUnmount(() => {
  mapRef.value.map.removeLayer(props.layer.id);
});

const onLayerClicked = (e) => emit("click", e.features[0]);
const onMouseenter = () => {
  mapRef.value.map.getCanvas().style.cursor = "pointer";
};
const onMouseleave = () => {
  mapRef.value.map.getCanvas().style.cursor = "";
};
</script>
