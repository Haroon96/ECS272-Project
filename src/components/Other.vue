<script setup lang="ts">

import * as d3 from 'd3';
import { storeToRefs } from 'pinia';
import { dataStore } from '@/stores/data';
import { watch, ref } from 'vue';
import { Channel } from '@/types/channel';

const store = dataStore();
const { channels, corecommendations } = storeToRefs(store);

const getRandomChannel = () => {
    const idx = Math.floor(Math.random() * channels.value.length);
    return channels.value[idx];
};

const getChannel = (i: string) => channels.value.filter(x => x.id == i)[0];
    

const channel = ref<Channel>();

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

    // get data
    const data1 = corecommendations.value['Left'].filter(x => x.channel1 == channel.value.id);
    const total1 = d3.sum(data1.map(x => x.count));
    const split1 = d3.sum(data1.filter(x => getChannel(x.channel2).bias < 0).map(x => x.count)) / total1 * 100;

    // liberal / conservative breakdown
    svg.append('g')
        .selectAll('cells')
        .data(d3.range(100))
        .enter()
        .append('rect')
        .attr('x', (d, i) => (i * 22) % (22 * 10))
        .attr('y', (d, i) => 200 + Math.floor(i / 10) * 22)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', (d, i) => i < split1 ? 'blue' : 'red');

    // get data
    const data2 = corecommendations.value['Right'].filter(x => x.channel1 == channel.value.id);
    const total2 = d3.sum(data2.map(x => x.count));
    const split2 = d3.sum(data2.filter(x => getChannel(x.channel2).bias < 0).map(x => x.count)) / total2 * 100;

    // liberal / conservative breakdown
    svg.append('g')
        .selectAll('cells')
        .data(d3.range(100))
        .enter()
        .append('rect')
        .attr('x', (d, i) => width - (i * 22) % (22 * 10))
        .attr('y', (d, i) => 200 + Math.floor(i / 10) * 22)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', (d, i) => i < split2 ? 'blue' : 'red');

    svg.append('text')
        .attr('x', 22 * 5)
        .attr('y', 200 + 22 * 11)
        .text('Left')
        .attr('text-anchor', 'middle');
   
        svg.append('text')
        .attr('x', width - 22 * 4)
        .attr('y', 200 + 22 * 11)
        .text('Right')
        .attr('text-anchor', 'middle');
}


watch(channel, plot);
window.addEventListener('resize', plot);
plot();

setTimeout(() => {
    channel.value = getRandomChannel();
}, 1000);

</script>

<template>
    <svg id="other"></svg>
    <div class="controls">
        <select v-model="channel">
            <option :value="channel" v-for="channel in channels">
                {{ channel.name }}
            </option>
        </select>
    </div>
</template>

<style scoped>
svg#other {
    width: 100%;
    height: 90vh;
}

div.controls {
    height: 5vh;
    width: calc(100% - 48px);
    background: #eee;
    display: flex;
    padding: 2vh 24px 2vh 24px;
    align-items: center;
    justify-content: center;
}
</style>