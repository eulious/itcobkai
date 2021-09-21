const master = {
    signalingClient: null,
    peerConnectionByClientId: {},
    dataChannelByClientId: {},
    localStream: null,
    remoteStreams: [],
    peerConnectionStatsInterval: null,
};

function dummyNoise(ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0081;
    osc.connect(gain)
    osc.start()
    return gain
}

const streams = {
    ctx: new (window.AudioContext || window.webkitAudioContext),
    osc: null,
    medias: {},
    dests: {},
    gains: {},
    raw: {}
}

streams.osc = dummyNoise(streams.ctx)

export default async function startMaster(keys, whenOpen, onRemoteDataMessage) {
    const kinesisVideoClient = new AWS.KinesisVideo({
        region: keys.AWS_REGION,
        accessKeyId: keys.AWS_ACCESS_KEY_ID,
        secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
        sessionToken: null,
        endpoint: null,
        correctClockSkew: true,
    });

    const describeSignalingChannelResponse = await kinesisVideoClient
        .describeSignalingChannel({ ChannelName: keys.AWS_CH_NAME })
        .promise();
    const channelARN = describeSignalingChannelResponse.ChannelInfo.ChannelARN;
    console.log('[MASTER] Channel ARN: ', channelARN);

    const getSignalingChannelEndpointResponse = await kinesisVideoClient
        .getSignalingChannelEndpoint({
            ChannelARN: channelARN,
            SingleMasterChannelEndpointConfiguration: {
                Protocols: ['WSS', 'HTTPS'],
                Role: KVSWebRTC.Role.MASTER,
            },
        })
        .promise();
    const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
        endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
        return endpoints;
    }, {});
    console.log('[MASTER] Endpoints: ', endpointsByProtocol);

    master.signalingClient = new KVSWebRTC.SignalingClient({
        channelARN,
        channelEndpoint: endpointsByProtocol.WSS,
        role: KVSWebRTC.Role.MASTER,
        region: keys.AWS_REGION,
        credentials: {
            accessKeyId: keys.AWS_ACCESS_KEY_ID,
            secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
            sessionToken: null,
        },
        systemClockOffset: kinesisVideoClient.config.systemClockOffset,
    });

    const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
        region: keys.AWS_REGION,
        accessKeyId: keys.AWS_ACCESS_KEY_ID,
        secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
        sessionToken: null,
        endpoint: endpointsByProtocol.HTTPS,
        correctClockSkew: true,
    });
    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
        .getIceServerConfig({ ChannelARN: channelARN })
        .promise();
    const iceServers = [];
    iceServers.push({ urls: `stun:stun.kinesisvideo.${keys.AWS_REGION}.amazonaws.com:443` });
    getIceServerConfigResponse.IceServerList.forEach(iceServer =>
        iceServers.push({
            urls: iceServer.Uris,
            username: iceServer.Username,
            credential: iceServer.Password,
        }),
    );
    console.log('[MASTER] ICE servers: ', iceServers);

    // try {
    //     master.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //     localView.srcObject = master.localStream;
    // } catch (e) {
    //     console.error('[MASTER] Could not find webcam');
    // }

    master.signalingClient.on('open', async () => {
        console.log('[MASTER] Connected to signaling service');
    });

    master.signalingClient.on('sdpOffer', async (offer, remoteClientId) => {
        console.log('[MASTER] Received SDP offer from client: ' + remoteClientId);
        if (Object.keys(streams.medias).indexOf(remoteClientId) >= 0) {
            console.log("exists")
            return;
        }

        const peerConnection = new RTCPeerConnection({
            iceServers,
            iceTransportPolicy: 'all',
        });
        master.peerConnectionByClientId[remoteClientId] = peerConnection;

        master.dataChannelByClientId[remoteClientId] = peerConnection.createDataChannel('kvsDataChannel');
        peerConnection.ondatachannel = event => {
            event.channel.onmessage = (e) => onRemoteDataMessage(e, remoteClientId);
            master.dataChannelByClientId[remoteClientId].send(JSON.stringify(whenOpen(remoteClientId)))
        };
        master.dataChannelByClientId[remoteClientId].ondatachannel = (e) => console.log("[[[open datachanell]]]", remoteClientId)

        peerConnection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate) {
                console.log('[MASTER] Generated and Sending ICE candidate to client: ' + remoteClientId);
                master.signalingClient.sendIceCandidate(candidate, remoteClientId);
            } else {
                console.log('[MASTER] All ICE candidates have been generated for client: ' + remoteClientId);
            }
        });

        peerConnection.addEventListener('track', event => {
            console.log('[MASTER] Received remote track from client: ' + remoteClientId);
            // if (remoteView.srcObject) return;
            // remoteView.srcObject = event.streams[0];
            const clientId = remoteClientId
            streams.gains[clientId] = {}
            streams.medias[clientId] = streams.ctx.createMediaStreamSource(event.streams[0]);
            streams.raw[clientId] = document.createElement("audio")
            streams.raw[clientId].srcObject = event.streams[0];

            streams.raw[clientId].muted = true;
            streams.raw[clientId].controls = true;
            streams.raw[clientId].autoplay = true;
            // $(".master__audio_box")[0].appendChild(streams.raw[clientId])

            streams.dests[clientId] = streams.ctx.createMediaStreamDestination()
            streams.osc.connect(streams.dests[clientId])
            const [track] = streams.dests[clientId].stream.getAudioTracks();
            master.peerConnectionByClientId[clientId].addTrack(track, streams.dests[clientId].stream)
        });

        // if (master.localStream) {
        //     master.localStream.getTracks().forEach(track => peerConnection.addTrack(track, master.localStream));
        // }
        await peerConnection.setRemoteDescription(offer);

        console.log('[MASTER] Creating SDP answer for client: ' + remoteClientId);
        await peerConnection.setLocalDescription(
            await peerConnection.createAnswer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            }),
        );

        console.log('[MASTER] Sending SDP answer to client: ' + remoteClientId);
        master.signalingClient.sendSdpAnswer(peerConnection.localDescription, remoteClientId);
        console.log('[MASTER] Generating ICE candidates for client: ' + remoteClientId);
    });

    master.signalingClient.on('iceCandidate', async (candidate, remoteClientId) => {
        console.log('[MASTER] Received ICE candidate from client: ' + remoteClientId);
        const peerConnection = master.peerConnectionByClientId[remoteClientId];
        peerConnection.addIceCandidate(candidate);
    });

    console.log('[MASTER] Starting master connection');
    master.signalingClient.open();
    return { master: master, streams: streams }
}
