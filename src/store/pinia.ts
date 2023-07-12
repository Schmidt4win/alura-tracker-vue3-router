import { defineStore } from 'pinia';
import IRamal from '@/interfaces/IRamal';

export const useRamalStore = defineStore('ramal', {
  state: () => ({
    ramais: [] as IRamal[],
  }),
  actions: {
    setRamal(ramais: IRamal[]) {
      this.ramais = ramais;
    },
  },
});
