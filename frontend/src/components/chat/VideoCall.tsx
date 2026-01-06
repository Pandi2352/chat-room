import  { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export default function VideoCall() {
    const { 
        callData, callAccepted, setCallData, setCallAccepted, 
        emitAnswerCall, emitEndCall, emitIceCandidate, emitCallUser, socket 
    } = useChatStore();
    
    const user = useAuthStore(s => s.user);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callEnded, setCallEnded] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<RTCPeerConnection | null>(null);

    // Sync remote stream to video element when it mounts
    useEffect(() => {
        if (userVideo.current && remoteStream) {
            userVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream, callAccepted]);

    // Bootstrap local stream
    useEffect(() => {
        if (!callData && !callAccepted) return; // Only start if active
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch(err => {
                console.error("Failed to get local stream", err);
                endCall();
            });

        return () => {
            // Cleanup provided by general cleanup effect
        };
    }, [callData, callAccepted]);


    const iceCandidatesQueue = useRef<any[]>([]);

    // Handle Call Logic (Signaling Listeners)
    useEffect(() => {
        if (!socket) return;
        
        const handleIceCandidateIncoming = (candidate: any) => {
            if (connectionRef.current && connectionRef.current.remoteDescription) {
                connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(e => console.error("Error adding ice candidate", e));
            } else {
                iceCandidatesQueue.current.push(candidate);
            }
        };
        
        const handleCallAccepted = (signal: any) => {
             setCallAccepted(true);
             const peer = connectionRef.current;
             if (peer) {
                 peer.setRemoteDescription(new RTCSessionDescription(signal))
                    .then(() => {
                        iceCandidatesQueue.current.forEach(c => {
                            peer.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error(e));
                        });
                        iceCandidatesQueue.current = [];
                    })
                    .catch(e => console.error("Error setting remote description", e));
             }
        };

        socket.on('ice_candidate', handleIceCandidateIncoming);
        socket.on('call_accepted', handleCallAccepted);

        return () => {
            socket.off('ice_candidate', handleIceCandidateIncoming);
            socket.off('call_accepted', handleCallAccepted);
        };
    }, [socket, setCallAccepted]);


    // Caller Logic
    useEffect(() => {
        const cData = callData as any;
        if (!stream || !cData || cData.isReceivingCall || !cData.userToCall || connectionRef.current || !user) return;

        const peer = new RTCPeerConnection(ICE_SERVERS);
        connectionRef.current = peer;

        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
             if (event.candidate) {
                 emitIceCandidate({ to: cData.userToCall, candidate: event.candidate });
             }
        };

        peer.ontrack = (event) => {
             console.log("Track received (Caller)", event.streams[0]);
             setRemoteStream(event.streams[0]);
        };

        peer.createOffer()
            .then(offer => {
                peer.setLocalDescription(offer);
                emitCallUser({ 
                    userToCall: cData.userToCall, 
                    signalData: offer, 
                    from: user._id, 
                    name: user.displayName 
                });
            });

    }, [stream, callData, user]);


    // INCOMING CALL: Answer
    const answerCall = () => {
        if (!stream) {
            console.error("Stream not ready yet");
            return; 
        }

        setCallAccepted(true);
        const peer = new RTCPeerConnection(ICE_SERVERS);
        connectionRef.current = peer;

        // Add Tracks
        stream.getTracks().forEach(track => {
            peer.addTrack(track, stream);
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                emitIceCandidate({ to: callData?.from, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            console.log("Track received (Receiver)", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        // Chain the negotiation
        peer.setRemoteDescription(new RTCSessionDescription(callData?.signal))
            .then(() => {
                iceCandidatesQueue.current.forEach(c => {
                    peer.addIceCandidate(new RTCIceCandidate(c)).catch(e => console.error(e));
                });
                iceCandidatesQueue.current = [];
                return peer.createAnswer();
            })
            .then(answer => {
                peer.setLocalDescription(answer);
                emitAnswerCall({ signal: answer, to: callData?.from });
            })
            .catch(err => console.error("Answer call failed", err));
    };
    
    // Cleanup
    useEffect(() => {
        if (!callData && !callAccepted) {
            connectionRef.current?.close();
            connectionRef.current = null;
            stream?.getTracks().forEach(track => track.stop());
            setStream(null);
            setRemoteStream(null);
        }
    }, [callData, callAccepted]);

    const endCall = () => {
        setCallEnded(true);
        connectionRef.current?.close();
        connectionRef.current = null;
        if(callData?.from) emitEndCall({ to: callData.from });
        
        setCallData(null);
        setCallAccepted(false);
        setRemoteStream(null);
        
        stream?.getTracks().forEach(track => track.stop());
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    };
    
    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !isVideoOn;
            setIsVideoOn(!isVideoOn);
        }
    };

    if (!callData) return null; // No active call state

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl aspect-video relative flex flex-col">
                
                {/* Main Video (Remote) */}
                <div className="flex-1 bg-black relative flex items-center justify-center">
                    {callAccepted && !callEnded ? (
                         <video ref={userVideo} playsInline autoPlay className="w-full h-full object-cover" />
                    ) : (
                         <div className="flex flex-col items-center gap-4 animate-pulse">
                             <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
                                 {callData.name?.[0]}
                             </div>
                             <p className="text-white text-xl font-medium">
                                 {callAccepted ? 'Connecting...' : `${callData.name} is calling...`}
                             </p>
                         </div>
                    )}
                </div>

                {/* Local Video (PiP) */}
                {stream && (
                    <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
                        <video ref={myVideo} playsInline autoPlay muted className="w-full h-full object-cover mirror" />
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                    {!callAccepted ? (
                        <div className="flex gap-8">
                             <button onClick={endCall} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110">
                                 <PhoneOff size={32} />
                             </button>
                             <button onClick={answerCall} disabled={!stream} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce transition-transform hover:scale-110 ${!stream ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                                 <Phone size={32} />
                             </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 p-4 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700">
                             <button onClick={toggleMic} className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
                                 {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                             </button>
                             <button onClick={endCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg">
                                 <PhoneOff size={24} />
                             </button>
                             <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
                                 {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                             </button>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                .mirror { transform: scaleX(-1); }
            `}</style>
        </div>
    );
}
