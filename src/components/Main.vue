<script setup lang="ts">

import * as d3 from 'd3';
import { dataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { onMounted, watch } from 'vue';
import type { Channel } from '@/types/channel';

const store = dataStore();
const { channels, corecommendations, state, selectedChannel } = storeToRefs(store);


function plot() {
    // get svg object
    const svg = d3.select('#main');

    // clear existing objects
    svg.selectAll('*').remove();

    // get svg dimensions and margins
    const margin = 24;
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const radius = Math.min(width, height) * 0.4;

    // get channel stats
    const maxSubscribers = Math.max(...channels.value.map(x => x.subscriberCount));

    // adjust svg view
    svg.attr('viewBox', `${-margin} ${-margin} ${width + margin * 2} ${height + margin * 2}`)

    function angleX(i, r) {
        return width / 2 + Math.cos(computeAngle(i)) * r;
    }
    
    function angleY(i, r) {
        return height / 2 - Math.sin(computeAngle(i)) * r;
    }

    function computeAngle(i) {
        return (Math.PI / 2) + (2 * Math.PI * i / channels.value.length);
    }

    function computeRadius(channel: Channel) {
        return 20 * channel.subscriberCount / maxSubscribers;
    }

    const textAngle = d3.scaleLinear()
        .domain([0, channels.value.length])
        .range([90, -270]);

    // append channel names
    svg.append('g')
        .selectAll('text')
        .data(channels.value)
        .enter()
        .append('text')
        .attr('class', 'channel-name')
        .text((d: Channel) => d.name)
        .attr('x', (d, i) => angleX(i, radius))
        .attr('y', (d, i) => angleY(i, radius))
        .attr('index', (d, i) => i + 1)
        .attr('text-anchor', (d, i) => 'end')
        .attr('fill', (d, i) => d.bias < 0 ? 'blue' : 'red')
        .style('transform', (d, i) => `rotate(${textAngle(i)}deg)`)
        // .style('transform', (d, i) => i > 50 ? `rotate(${-textAngle(i)}deg)` : `rotate(${textAngle(i)}deg)`)
        // .style('dominant-baseline', 'middle')
        .style('transform-origin', (d, i) => 'right')
        .style('transform-box', 'fill-box')
        .style('opacity', 0.5)
        .style('cursor', 'pointer')
        .style('font-size', '0.75em')
        .on('mousemove', function(e, d) {
            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 1);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 1);
        })
        .on('click', function (e, d) {
            // g.attr('class', 'fade-out');
            state_change(d);
        })
        .on('mouseout', function(e, d) {
            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 0.5);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 0.5);
        });

    // append circles
    svg.append('g')
        .selectAll('circle')
        .data(channels.value)
        .enter()
        .append('circle')
        .attr('class', 'channel-circle')
        .attr('cx', (d, i) => angleX(i, radius * 0.93))
        .attr('cy', (d, i) => angleY(i, radius * 0.93))
        .attr('fill', (d, i) => d.bias < 0 ? 'blue' : 'red')
        // .attr('r', computeRadius)
        .attr('r', 10)
        .style('opacity', 0.5)
        .style('cursor', 'pointer')
        .attr('index', (d, i) => i + 1)
        .on('mousemove', function(e, d) {
            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 1);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 1);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).attr('r', 20);
        })
        .on('click', function (e, d) {
            // g.attr('class', 'fade-out');
            state_change(d);
        })
        .on('mouseout', function(e, d) {
            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 0.5);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 0.5);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).attr('r', 10);
        });

    svg.append('text').text(`0,0`).attr('x', 0).attr('y', 0);//.
    svg.append('text').text(`${width},${height}`).attr('x', width).attr('y', height).attr('text-anchor', 'end');
}

function state_change(channel: Channel) {
    store.switchState('other');
    selectedChannel.value = channel;
}


onMounted(plot);
window.addEventListener('resize', plot);
watch(channels, plot);

</script>

<template>
    <svg id="main"></svg>
</template>

<style>
svg#main {
    width: 100%;
    height: 100vh;
}

</style>
