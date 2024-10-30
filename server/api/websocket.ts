import {WebSocketLogger} from "~/utils/WebSocketLogger";

const room = 'LOGGER'
const logger = WebSocketLogger.getInstance();

export default defineWebSocketHandler({
    open(peer) {
        console.info('Opened WS: ' + peer)
        peer.subscribe(room)
        logger.addPeer(peer)
    },
    close(peer) {
        console.info('Closed WS: ' + peer)
        logger.removePeer(peer)
    },
})
