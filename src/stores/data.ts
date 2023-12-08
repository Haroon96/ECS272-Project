import type { Channel } from '@/types/channel';
import type { Corecommendation } from '@/types/corecommendation';
import { defineStore } from 'pinia';

export const dataStore = defineStore('data', {
  state: () => {
    const corecommendations: Record<string, Corecommendation[]> = {'Left': [], 'Right': []};
    const channels: Channel[] = [];
    const state = 'main';
    const selectedChannel: Channel = null;
    const circleScale: string = 'log';
    const threshold: number = 100;

    return { corecommendations, channels, state, selectedChannel, circleScale, threshold };
  },
  actions: {
    async loadData() {
      const results = await Promise.all([
        fetch('./data/corecommendations-left.json').then(x => x.json()), 
        fetch('./data/corecommendations-right.json').then(x => x.json()), 
        fetch('./data/channels.json').then(x => x.json())
      ]);

      this.corecommendations['Left'] = results[0];
      this.corecommendations['Right'] = results[1];
      this.channels = results[2];
    },
    switchState(state: string) {
      this.state = state;
    }  
  }
});
