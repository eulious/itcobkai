const viewer = {};

export default async function startViewer(keys, localView, remoteView, clientId, onRemoteDataMessage) {
    viewer.localView = localView;
    viewer.remoteView = remoteView;

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
    console.log('[VIEWER] Channel ARN: ', channelARN);

    const getSignalingChannelEndpointResponse = await kinesisVideoClient
        .getSignalingChannelEndpoint({
            ChannelARN: channelARN,
            SingleMasterChannelEndpointConfiguration: {
                Protocols: ['WSS', 'HTTPS'],
                Role: KVSWebRTC.Role.VIEWER,
            },
        })
        .promise();
    const endpointsByProtocol = getSignalingChannelEndpointResponse.ResourceEndpointList.reduce((endpoints, endpoint) => {
        endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
        return endpoints;
    }, {});
    console.log('[VIEWER] Endpoints: ', endpointsByProtocol);

    const kinesisVideoSignalingChannelsClient = new AWS.KinesisVideoSignalingChannels({
        region: keys.AWS_REGION,
        accessKeyId: keys.AWS_ACCESS_KEY_ID,
        secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
        sessionToken: null,
        endpoint: endpointsByProtocol.HTTPS,
        correctClockSkew: true,
    });

    const getIceServerConfigResponse = await kinesisVideoSignalingChannelsClient
        .getIceServerConfig({
            ChannelARN: channelARN,
        })
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
    console.log('[VIEWER] ICE servers: ', iceServers);

    viewer.signalingClient = new KVSWebRTC.SignalingClient({
        channelARN,
        channelEndpoint: endpointsByProtocol.WSS,
        clientId: clientId,
        role: KVSWebRTC.Role.VIEWER,
        region: keys.AWS_REGION,
        credentials: {
            accessKeyId: keys.AWS_ACCESS_KEY_ID,
            secretAccessKey: keys.AWS_SECRET_ACCESS_KEY,
            sessionToken: null,
        },
        systemClockOffset: kinesisVideoClient.config.systemClockOffset,
    });

    viewer.peerConnection = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: 'all',
    });
    viewer.dataChannel = viewer.peerConnection.createDataChannel('kvsDataChannel');
    viewer.peerConnection.ondatachannel = event => {
        event.channel.onmessage = onRemoteDataMessage;
    };

    viewer.signalingClient.on('open', async () => {
        console.log('[VIEWER] Connected to signaling service');
        try {
            viewer.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            viewer.localStream.getTracks().forEach(track => { viewer.peerConnection.addTrack(track, viewer.localStream); console.log("gettrack") });
            localView.srcObject = viewer.localStream;
        } catch (e) {
            console.error('[VIEWER] Could not find webcam', e);
            return;
        }

        console.log('[VIEWER] Creating SDP offer');
        await viewer.peerConnection.setLocalDescription(
            await viewer.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            }),
        );

        console.log('[VIEWER] Sending SDP offer');
        viewer.signalingClient.sendSdpOffer(viewer.peerConnection.localDescription);
        console.log('[VIEWER] Generating ICE candidates');
    });

    viewer.signalingClient.on('sdpAnswer', async answer => {
        console.log('[VIEWER] Received SDP answer');
        await viewer.peerConnection.setRemoteDescription(answer);
    });

    viewer.signalingClient.on('iceCandidate', candidate => {
        console.log('[VIEWER] Received ICE candidate');
        viewer.peerConnection.addIceCandidate(candidate);
    });

    viewer.peerConnection.addEventListener('icecandidate', ({ candidate }) => {
        if (candidate) {
            console.log('[VIEWER] Generated and Sending ICE candidate');
            viewer.signalingClient.sendIceCandidate(candidate);
        } else {
            console.log('[VIEWER] All ICE candidates have been generated');
        }
    });

    viewer.peerConnection.addEventListener('track', event => {
        console.log('[VIEWER] Received remote track');
        if (remoteView.srcObject) return;
        viewer.remoteStream = event.streams[0];
        remoteView.srcObject = viewer.remoteStream;
    });

    console.log('[VIEWER] Starting viewer connection');
    viewer.signalingClient.open();
    return viewer
}