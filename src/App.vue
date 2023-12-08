<script setup lang="ts">

import Main from '@/components/Main.vue';
import { dataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import Other from '@/components/Other.vue';
import Donut from './components/Donut.vue';

const store = dataStore();
store.loadData();

const { state } = storeToRefs(store);

watch(state, function (newVal, oldVal) {
    // get state elements
    const newElem = document.getElementsByClassName(`state-${newVal}`)[0];
    const oldElem = document.getElementsByClassName(`state-${oldVal}`)[0];

    // fade out current active state
    newElem.classList.add('active-state');
    oldElem.classList.add('fade-out');

    setTimeout(() => {
        oldElem.classList.remove('active-state');
        oldElem.classList.remove('fade-out');
    }, 1000);
});

</script>

<template>
    <div class="section-container">

        <div class="intro section flex flex-center">
            <div class="bg"></div>
            <h1>YouTube Recommendations can be polarizing!</h1>
        </div>

        <div class="state state-main active-state section flex flex-center flex-equal">
            <div>
                <Main ideology="Left"></Main>
            </div>
            <p>Liberal users are often recommended videos within their ideology.</p>
        </div>

        <div class="state state-main active-state section flex flex-center flex-equal">
            <p>While conservative users are also recommended videos within their ideology, cross-cutting recommendations are also prevalent indicated by the purples.</p>
            <div>
                <Main ideology="Right"></Main>
            </div>
        </div>

        <div class="state state-main active-state section flex flex-center flex-equal">
            <div class="max-height">
                <Donut></Donut>
            </div>
            <div>
                asd
                <!-- <Other></Other> -->
            </div>
        </div>

    </div>
</template>

<style scoped>
@keyframes fadeOut {
    from {
        opacity: 1;
        transform: scale(1);
        visibility: visible;
    }

    to {
        opacity: 0;
        transform: scale(2);
        visibility: hidden;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(2);
        visibility: hidden;
    }

    to {
        opacity: 1;
        transform: scale(1);
        visibility: visible;
    }
}

.state:not(.active-state) {
    visibility: hidden;
}

.state.fade-out {
    animation: fadeOut 1s !important;
    animation-fill-mode: forwards !important;
}

.state.active-state {
    animation: fadeIn 1s;
}

.section {
    width: 100%;
    height: 100vh;
    background: white;
    scroll-snap-align: start;
    position: relative;
}

.flex {
    display: flex;
}

.flex-center {
    align-items: center;
    justify-content: center;
}

.flex-equal > * {
    width: 50%;
}

.section.intro {
    z-index: 100;
    position: relative;
}

.section>h1 {
    font-size: 4em;
    text-align: center;
    margin: 0;
}

.section  > p {
    font-size: 2em;
    text-align: center;
    padding: 8px;
}

.section.intro .bg {
    height: 100vh;
    width: 100%;
    background: url(/public/intro-bg.jpg);
    background-size: cover;
    opacity: 0.1;
    position: absolute;
    top: 0;
    left: 0;

}
.section-container {
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
}
.max-height {
    height: 100vh;
}
</style>
