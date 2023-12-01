import type { Channel } from '@/types/channel';
import { defineStore } from 'pinia';

export const dataStore = defineStore('data', {
  state: () => {
    const corecommendations = {};
    const channels: Array<Channel> = [];
    const state = 'main';
    const selectedChannel: Channel = null;
    return { corecommendations, channels, state, selectedChannel };
  },
  actions: {
    async loadData() {
      const results = await Promise.all([
        fetch('./data/corecommendations.json').then(x => x.json()), 
        fetch('./data/channels.json').then(x => x.json())
      ]);

      this.corecommendations = results[0];
      this.channels = results[1];
    },
    switchState(state) {
      this.state = state;
    }  
  }
});
