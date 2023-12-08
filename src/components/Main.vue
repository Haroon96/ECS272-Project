<script setup lang="ts">

import * as d3 from 'd3';
import { dataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { onMounted, watch, ref, defineProps } from 'vue';
import type { Channel } from '@/types/channel';
import type { Corecommendation } from '@/types/corecommendation';


const props = defineProps({
    ideology: String
});

const store = dataStore();
const { channels, corecommendations, state, selectedChannel, threshold, circleScale } = storeToRefs(store);
const hoverChannel = ref<Channel>(channels.value[0]);

// get channel stats
const maxSubscribers = ref();
const maxCount = ref();

const mainId = 'id' + (Math.random() * 100).toFixed(0);
const hoverId = 'id' + (Math.random() * 100).toFixed(0);

function plot() {

    // get svg object
    const svg = d3.select('#' + mainId);
    const hover = d3.select('#' + hoverId);

    // clear existing objects
    svg.selectAll('*').remove();

    // get svg dimensions and margins
    const margin = 36;
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const radius = Math.min(width, height) * 0.4;

    // update stats
    maxSubscribers.value = Math.max(...channels.value.map(x => x.subscriberCount));
    maxCount.value = Math.max(...corecommendations.value[props.ideology].map(x => x.count))

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
        if (circleScale.value == 'log') {
            return Math.log(channel.subscriberCount);
        } else if (circleScale.value == 'normalized') {
            return channel.subscriberCount / maxSubscribers.value * 40;
        } else {
            return 10;
        }
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
        .on('mousemove', function (e, d) {
            hoverChannel.value = d;

            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 1);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 1);

            hover.style('left', (e.clientX + 20) + 'px');
            hover.style('top', (e.clientY + 20) + 'px');
            hover.style('visibility', 'visible');

            d3.selectAll(`.channel-line:not(.${d.id})`).attr('opacity', '0');
        })
        .on('click', function (e, d) {
            state_change(d);
        })
        .on('mouseout', function (e, d) {
            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 0.5);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 0.5);
            hover.style('visibility', 'hidden');
            d3.selectAll(`.channel-line:not(.${d.id})`).attr('opacity', '0.5');
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
        .attr('r', computeRadius)
        // .attr('r', 10)
        .style('opacity', 0.5)
        .style('cursor', 'pointer')
        .attr('index', (d, i) => i + 1)
        .on('mousemove', function (e, d) {
            hoverChannel.value = d;

            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 1);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 1);

            hover.style('left', (e.clientX + 20) + 'px');
            hover.style('top', (e.clientY + 20) + 'px');
            hover.style('visibility', 'visible');

            d3.selectAll(`.channel-line:not(.${d.id})`).attr('opacity', 0);
        })
        .on('click', function (e, d) {
            state_change(d);
        })
        .on('mouseout', function (e, d) {
            const idx = e.target.getAttribute('index');
            svg.selectAll(`.channel-name:nth-child(${idx})`).style('opacity', 0.5);
            svg.selectAll(`.channel-circle:nth-child(${idx})`).style('opacity', 0.5);
            hover.style('visibility', 'hidden');
            d3.selectAll(`.channel-line:not(.${d.id})`).attr('opacity', '0.5');
        });


    const getChannel = (i: string) => channels.value.filter(x => x.id == i)[0];
    const channelIndex = (i: string) => channels.value.map(x => x.id).indexOf(i);

    const getColor = (c1: string, c2: string) => {
        let bias1 = getChannel(c1).bias;
        let bias2 = getChannel(c2).bias;
        if (bias1 < 0 && bias2 < 0) {
            return 'blue';
        }
        if (bias1 > 0 && bias2 > 0) {
            return 'red';
        }
        return 'purple';
    };


    const strokeWidthScale = d3.scaleLinear()
        .domain([0, maxCount.value])
        .range([0.01, 3]);

    // draw lines
    const lines: Corecommendation[] = corecommendations.value[props.ideology].filter(x => x.count > threshold.value);
    svg.append('g')
        .selectAll('line')
        .data(lines)
        .enter()
        .append('line')
        .attr('class', d => `${d.channel1} ${d.channel2} channel-line`)
        .attr('x1', (d, i) => angleX(channelIndex(d.channel1), radius * 0.85))
        .attr('y1', (d, i) => angleY(channelIndex(d.channel1), radius * 0.85))
        .attr('x2', (d, i) => angleX(channelIndex(d.channel2), radius * 0.85))
        .attr('y2', (d, i) => angleY(channelIndex(d.channel2), radius * 0.85))
        .attr('stroke-width', (d, i) => strokeWidthScale(d.count))
        .attr('stroke', (d, i) => getColor(d.channel1, d.channel2));
}

function state_change(channel: Channel) {
    store.switchState('other');
    selectedChannel.value = channel;
}

onMounted(plot);
window.addEventListener('resize', plot);
watch([channels, circleScale, threshold], plot);

</script>

<template>
    <svg :id="mainId" class="main"></svg>
    <div :id="hoverId" class="hover">
        <div>
            <img id="channel_thumbnail"
                :src="hoverChannel?.thumbnail ? 'public/channels/' + hoverChannel.thumbnail + '.png' : ''">
        </div>
        <div>
            <strong>{{ hoverChannel?.name }}</strong><br>
            Bias: {{ hoverChannel?.bias.toFixed(2) }}<br>
            Subscribers: {{ hoverChannel?.subscriberCount.toLocaleString() }}
        </div>
    </div>
    <div class="controls">
        <div>
            <span>Circle radius scale: </span>
            <select v-model="circleScale">
                <option value="log">Log</option>
                <option value="normalized">Normalized</option>
                <option value="fixed">Fixed</option>
            </select>
        </div>
        <div>
            <span>Threshold:</span>
            <input type="range" v-model="threshold" min="100" :max="maxCount">
            <span>{{ threshold }}</span>
        </div>
    </div>
</template>

<style>
svg.main {
    width: 100%;
    height: 90vh;
}

div.hover {
    position: absolute;
    background: white;
    padding: 4px 8px;
    border: solid 1px #666;
    visibility: hidden;
    display: flex;
}

div.hover img {
    width: 100px;
    height: 100px;
    margin-right: 8px;
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
