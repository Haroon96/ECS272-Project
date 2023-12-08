<script setup lang="ts">

import * as d3 from 'd3';
import { storeToRefs } from 'pinia';
import { dataStore } from '@/stores/data';
import { watch } from 'vue';

const store = dataStore();
const { state, selectedChannel } = storeToRefs(store);

function back() {
    store.switchState('main');
}

function plot() {
    const svg = d3.select('#other');

    // check if svg loaded
    if (!svg.node()) {
        return;
    }

    // clear existing
    svg.selectAll('*').remove();

    // get svg dimensions and margins
    const margin = 24;
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    // adjust svg view
    svg.attr('viewBox', `${-margin} ${-margin} ${width + margin * 2} ${height + margin * 2}`)

    // liberal / conservative breakdown
    svg.append('g')
        .selectAll('cells')
        .data(d3.range(100))
        .enter()
        .append('rect')
        .attr('x', (d, i) => width - margin - (i * 22) % (22 * 10))
        .attr('y', (d, i) => height - margin - Math.floor(i / 10) * 22)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', (d, i) => i < 50 ? 'blue' : 'red');

    svg.append('text').text(`0,0`).attr('x', 0).attr('y', 0);//.
    svg.append('text').text(`${width},${height}`).attr('x', width).attr('y', height).attr('text-anchor', 'end');
}


watch(selectedChannel, plot);
window.addEventListener('resize', plot);


</script>

<template>
    <svg id="other"></svg>
    <button @click="back">Back</button>
</template>

<style scoped>
svg#other {
    width: 100%;
    height: 100vh;
}
</style>