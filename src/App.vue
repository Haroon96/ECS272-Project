<script setup lang="ts">

import Main from '@/components/Main.vue';
import { dataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import Other from '@/components/Other.vue';

const store = dataStore();
store.loadData();

const { state } = storeToRefs(store);

watch(state, function(newVal, oldVal) {
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
    <div class="state state-main active-state">
        <Main></Main>
    </div>
    <div class="state state-other">
        <Other></Other>
    </div>
</template>

<style scoped>


@keyframes fadeOut {
    from {opacity: 1; transform: scale(1); visibility: visible;}
    to {opacity: 0; transform: scale(2); visibility: hidden;}
}

@keyframes fadeIn {
    from {opacity: 0; transform: scale(2); visibility: hidden;}
    to {opacity: 1; transform: scale(1); visibility: visible;}
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

.state {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
}


</style>
