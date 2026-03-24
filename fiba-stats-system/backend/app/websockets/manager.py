from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()

# Conexiones activas por partido_id
conexiones: Dict[int, List[WebSocket]] = {}

async def broadcast_update(partido_id: int, data: dict):
    if partido_id in conexiones:
        for ws in conexiones[partido_id]:
            try:
                await ws.send_text(json.dumps(data))
            except:
                pass

@router.websocket("/ws/{partido_id}")
async def websocket_endpoint(websocket: WebSocket, partido_id: int):
    await websocket.accept()
    if partido_id not in conexiones:
        conexiones[partido_id] = []
    conexiones[partido_id].append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        conexiones[partido_id].remove(websocket)
