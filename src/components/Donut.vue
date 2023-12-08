<script setup lang="ts">

import * as d3 from 'd3';

import { dataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import type { Channel } from '@/types/channel';

// get store refs
const store = dataStore();
const { channels, corecommendations } = storeToRefs(store);

const getRandomChannel = () => {
    const idx = Math.floor(Math.random() * channels.value.length);
    return channels.value[idx];
};

const channel = ref<Channel>(getRandomChannel());
const ideology = 'Left';

// methods 
function preprocess() {
    if (channel.value == null) {
        return;
    }

    let data = corecommendations.value[ideology].filter(x => x.channel1 == channel.value.id);

    if (!data || data.length == 0) {
        return null;
    }

    let total = 0;
    let counts: Record<string, number> = {self: 0, other: 0};
    for (let row of data) {
        if (row.channel1 == row.channel2) {
            counts['self'] += row.count;
        } else {
            counts['other'] += row.count;
        }
        total += row.count;
    }

    let ratios = [];
    for (let type in counts) {
        ratios.push({ type, ratio: counts[type] / total });
    }

    return ratios;
}

function plot() {

    // get preprocessed data
    const data = preprocess();

    if (data == null) {
        return;
    }

    // get svg object
    const svg = d3.select('#pie');

    // clear old
    svg.selectAll('*').remove();

    // get dimensions
    const margin = 4;
    const width = svg.node().clientWidth - margin;
    const height = svg.node().clientHeight - margin;
    console.log(width, height);
    const radius = Math.max(width, height) / 2;

    // set dimensions
    svg.attr('viewBox', `-${radius * 1.25} -${radius * 1.25} ${(width + margin) * 1.25} ${(height + margin) * 1.25}`);

    // create color scale
    const colorScale = d3.scaleOrdinal()
        .domain(data)
        .range(data.map(x => x.type == 'self' ? 'blue' : 'orange'))

    // create pie
    const pie = d3.pie()
        .value(d => d.ratio);

    // prep data
    const prep_data = pie(data.map(x => x));

    // arc generator
    const arc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius);

    svg.selectAll('g')
        .data(prep_data)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.type));

    // middle text
    svg.append("text")
        .text(channel.value.name)
        .style("font-size", "125%")
        .attr("text-anchor", "middle");
}

watch([channel], plot);
window.addEventListener('resize', plot);

setInterval(() => {
    channel.value = getRandomChannel();
}, 1000);

</script>

<template>
    <svg id="pie"></svg>
</template>

<style scoped>
svg {
    width: 100%;
    height: 100%;
    display: block;
}

</style>