class RealtimeService {
  private socket: WebSocket | null = null

  constructor(url: string) {
    this.socket = new WebSocket(url)
    this.socket.onopen = this.handleOpen
    this.socket.onmessage = this.handleMessage
    this.socket.onclose = this.handleClose
    this.socket.onerror = this.handleError
  }

  private handleOpen = (event: Event) => {
    console.log('Realtime connection opened', event)
  }

  private handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    console.log('Realtime message received:', data)
  }

  private handleClose = (event: CloseEvent) => {
    console.log('Realtime connection closed', event)
  }

  private handleError = (event: Event) => {
    console.error('Realtime error', event)
  }

  public sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    }
  }
}

export default RealtimeService
