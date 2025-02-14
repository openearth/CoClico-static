<template>
  <v-container class="ma-0 pa-0">
    <v-row>
      <v-col cols="9" class="ma-0 pa-0 pl-2">
        <svg viewBox="0 0 100 3">
          <defs>
            <linearGradient
              :id="`gradient-${datasetId}`"
              x1="0"
              x2="1"
              y1="0"
              y2="0"
            >
              <stop
                v-for="(stop, index) in linearGradient"
                :key="index"
                :offset="stop.offset"
                :style="{
                  'stop-color': stop.color,
                  'stop-opacity': stop.opacity,
                }"
              />
            </linearGradient>
          </defs>
          <rect
            :fill="`url(#gradient-${datasetId})`"
            width="100"
            height="5"
            x="0"
            y="0"
          />
        </svg>
      </v-col>
    </v-row>
    <v-row style="margin-top: 0px">
      <v-col v-if="!editingRange" cols="1" class="ma-0 pa-0">
        <v-btn variant="plain" icon @click="editRange">
          {{ minValue }}
        </v-btn>
      </v-col>
      <v-col v-else cols="4" class="ma-0">
        <v-text-field
          id="range-min"
          v-model="minValue"
          :label="`Min (${unit})`"
          placeholder="Min value"
        />
      </v-col>
      <v-col v-if="!editingRange" cols="1" offset="7" class="pa-0">
        <v-btn @click="editRange" small variant="plain" icon>
          {{ maxValue }}
        </v-btn>
      </v-col>
      <v-col v-else cols="4" offset="1" class="ma-0">
        <v-text-field
          id="range-max"
          v-model="maxValue"
          :label="`Max (${unit})`"
          placeholder="Max value"
        />
      </v-col>
      <v-col cols="3" class="my-auto pa-0 unit-text bodytext-s">
        [{{ unit }}]
      </v-col>
    </v-row>
    <v-row v-if="editingRange" justify="space-between">
      <v-col>
        <v-btn dense @click="cancelEditRange"> Cancel </v-btn>
      </v-col>
      <v-col>
        <v-btn dense @click="resetRange"> Reset </v-btn>
      </v-col>
      <v-col>
        <v-btn dense @click="saveRange"> Save </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import { get, set } from "lodash-es";

export default {
  props: {
    dataset: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      editingRange: false,
      defaultMinValue: "",
      minValue: "", //at the beginning equal to defaultMinValues. Same when reset.
      defaultMaxValue: "",
      maxValue: "",
      unit: "",
      linearGradient: {},
      datasetId: "",
    };
  },
  mounted() {
    this.datasetId = get(this.dataset, "id");
    this.unit = get(this.dataset, "deltares:units");
    this.updateMinMax();
    this.linearGradient = get(this.dataset, "deltares:linearGradient");
  },
  methods: {
    ...mapActions(["reclassifyMapboxLayer"]),
    updateMinMax() {
      const min = get(this.dataset, "deltares:min", "");
      const max = get(this.dataset, "deltares:max", "");
      this.minValue = min.toString();
      this.maxValue = max.toString();
      this.defaultMinValue = min.toString();
      this.defaultMaxValue = max.toString();
    },
    cancelEditRange() {
      this.minValue = this.defaultMinValue;
      this.maxValue = this.defaultMaxValue;
      this.editingRange = false;
    },
    editRange() {
      this.editingRange = true;
    },
    saveRange() {
      this.editingRange = false;
      set(this.dataset, "deltares:min", this.minValue);
      set(this.dataset, "deltares:max", this.maxValue);
      this.reclassifyMapboxLayer(this.dataset);
    },
    resetRange() {
      this.minValue = this.defaultMinValue;
      this.maxValue = this.defaultMaxValue;
    },
  },
};
</script>

<style>
.unit-text {
  text-align: center;
}
</style>
