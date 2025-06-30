
const roomInput = document.getElementById('joinBtn');
const roomInput1 = document.getElementById('joinBtn1');
roomInput.addEventListener('click', (event) => {
 const roomId = "Room1";
 myRoom(roomId);
});      
roomInput1.addEventListener('click', (event) => {
 const roomId = "Room2";
  myRoom(roomId);
});    


function myRoom(roomid){

const roomId = roomid;

const role = 'admin'; // Important to track on server
const webSocket = new WebSocket("https://webrtc-server-w5k1.onrender.com/");

let peerConnection;

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const remoteVideo = document.getElementById('remoteVideo');

webSocket.onopen = () => {
  console.log("✅ Admin WebSocket connected");
  webSocket.send(JSON.stringify({ type: 'join', roomId, role }));
};

webSocket.onmessage = async (event) => {
  const { type, payload } = JSON.parse(event.data);

  switch (type) {
    case 'both-joined':
      console.log("✅ Both peers are in the room. Starting connection...");
      startConnection();
      break;

    case 'answer':
      console.log("📥 Received answer");
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
      }
      break;

    case 'candidate':
      console.log("📥 Received ICE candidate");
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(payload));
      }
      break;

    case 'start-offer':
      console.log("🔁 Re-initiating offer (user rejoined)");
      startConnection();
      break;

    case 'peer-disconnected':
      console.log("Client disconnected");

      if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
      }

      setTimeout(() => {
        console.log("check one");
        startConnection();
      }, 500);
      break;

    default:
      console.warn("⚠️ Unknown message type:", type);
  }
};

function startConnection() {
  console.log("check it been called");
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  peerConnection = new RTCPeerConnection(config);

  // Admin only receives media
  peerConnection.addTransceiver('video', { direction: 'recvonly' });
  peerConnection.addTransceiver('audio', { direction: 'recvonly' });

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      webSocket.send(JSON.stringify({
        type: 'candidate',
        roomId,
        payload: e.candidate,
        role
      }));
    }
  };

  peerConnection.ontrack = (e) => {
    console.log("📺 Receiving media stream from user");
    remoteVideo.srcObject = e.streams[0];
  };

  // Admin creates the offer since user is the producer
  peerConnection.createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer))
    .then(() => {
      webSocket.send(JSON.stringify({
        type: 'offer',
        roomId,
        payload: peerConnection.localDescription,
        role
      }));
    });
}
}



