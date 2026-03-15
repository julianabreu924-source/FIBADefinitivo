class FIBASocket {
  constructor() {
    this.ws = null
    this.listeners = []
    this.currentPartidoId = null
    this._reconnectTimer = null
  }

  conectar(partidoId) {
    // Evitar reconexión duplicada al mismo partido
    if (this.currentPartidoId === partidoId && this.ws && this.ws.readyState === WebSocket.OPEN) return

    this.desconectar()
    this.currentPartidoId = partidoId
    this._connect(partidoId)
  }

  _connect(partidoId) {
    this.ws = new WebSocket(`ws://127.0.0.1:8000/ws/${partidoId}`)
    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        this.listeners.forEach(fn => fn(data))
      } catch { }
    }
    this.ws.onclose = () => {
      if (this.currentPartidoId === partidoId) {
        this._reconnectTimer = setTimeout(() => this._connect(partidoId), 3000)
      }
    }
    this.ws.onerror = () => { }
  }

  onUpdate(fn) {
    // Evitar registrar el mismo listener dos veces
    if (!this.listeners.includes(fn)) {
      this.listeners.push(fn)
    }
  }

  removeListener(fn) {
    this.listeners = this.listeners.filter(l => l !== fn)
  }

  clearListeners() {
    this.listeners = []
  }

  desconectar() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;

      // Solo cerrar si está abierto o conectando
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        try {
          this.ws.close();
        } catch (e) {
          console.warn("Error asincrónico al cerrar socket:", e);
        }
      }
      this.ws = null;
    }
    this.currentPartidoId = null;
  }
}

export const fibaSocket = new FIBASocket()
