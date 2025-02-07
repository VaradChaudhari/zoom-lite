const socket = io();
const peer = new Peer();

const videoContainer = document.getElementById("video-container");
const myVideo = document.getElementById("myVideo");
const toggleCameraBtn = document.getElementById("toggleCamera");
const toggleMicBtn = document.getElementById("toggleMic");
const messageInput = document.getElementById("message");
const sendMessageBtn = document.getElementById("sendMessage");
const messagesDiv = document.getElementById("messages");

let myStream;
let peers = {};

// Get User Media (Video & Audio)
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    myStream = stream;
    myVideo.srcObject = stream;

    peer.on("open", id => {
        socket.emit("join-room", id);
    });

    peer.on("call", call => {
        call.answer(stream);
        call.on("stream", userStream => {
            addUserVideo(userStream, call.peer);
        });
    });

    socket.on("user-connected", userId => {
        connectToNewUser(userId, stream);
    });

    socket.on("user-disconnected", userId => {
        if (peers[userId]) peers[userId].remove();
    });
});

// Connect to a new user
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    call.on("stream", userStream => {
        addUserVideo(userStream, userId);
    });
    peers[userId] = call;
}

// Add Video of a New User
function addUserVideo(stream, userId) {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.id = userId;
    videoContainer.appendChild(video);
}

// Toggle Camera
toggleCameraBtn.addEventListener("click", () => {
    const enabled = myStream.getVideoTracks()[0].enabled;
    myStream.getVideoTracks()[0].enabled = !enabled;
    toggleCameraBtn.innerText = enabled ? "Turn On Camera" : "Turn Off Camera";
});

// Toggle Mic
toggleMicBtn.addEventListener("click", () => {
    const enabled = myStream.getAudioTracks()[0].enabled;
    myStream.getAudioTracks()[0].enabled = !enabled;
    toggleMicBtn.innerText = enabled ? "Unmute" : "Mute";
});

// Handle Chat Messages
sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value;
    if (message.trim()) {
        socket.emit("message", message);
        appendMessage("You: " + message);
        messageInput.value = "";
    }
});

socket.on("message", msg => {
    appendMessage("Other: " + msg);
});

function appendMessage(msg) {
    const p = document.createElement("p");
    p.innerText = msg;
    messagesDiv.appendChild(p);
}
