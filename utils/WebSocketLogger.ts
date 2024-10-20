import {type Peer} from 'crossws'
import {WebsocketLog} from "~/src/types/types";
import {currentDate} from "./DataGenerator";

export class WebSocketLogger {
    private static instance: WebSocketLogger;
    private peers: Peer[] = [];

    private constructor() {
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    addPeer(peer: Peer) {
        this.peers.push(peer);
    }

    removePeer(peer: Peer) {
        this.peers.splice(this.peers.indexOf(peer), 1)
    }

    emptyPeers(): void {
        this.peers = [];
    }

    sendLog(log: WebsocketLog) {
        if (!['progress', 'reset'].includes(log.type)) {
            if (log.message) {
                log.message = `[${currentDate()}] ` + log.message;
            }
        }
        for (let peer of this.peers) {
            peer.send(log)
        }
    }
}