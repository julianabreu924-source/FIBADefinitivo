import { create } from 'zustand'

export const usePartidoStore = create((set) => ({
  partidoActivo: null,
  jugadorSeleccionado: null,
  cuartoActual: 1,
  stats: [],
  setPartidoActivo:       (partido) => set({ partidoActivo: partido }),
  setJugadorSeleccionado: (jugador) => set({ jugadorSeleccionado: jugador }),
  setCuartoActual:        (cuarto)  => set({ cuartoActual: cuarto }),
  setStats:               (stats)   => set({ stats }),
  limpiar: () => set({ partidoActivo: null, jugadorSeleccionado: null, cuartoActual: 1, stats: [] }),
}))
