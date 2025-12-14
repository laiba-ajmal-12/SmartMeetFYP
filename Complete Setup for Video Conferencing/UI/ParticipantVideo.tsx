import { useEffect, useRef } from "react";

export default function ParticipantVideo({
  producerId,
  stream,
  hasVideo
}: {
  producerId: string | null;
  stream: MediaStream | null;
  hasVideo: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream && hasVideo) {
      // Clear existing srcObject if different
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      const playVideo = () => {
        if (video.paused) {
          video.play().catch(() => {
            // Try again with user interaction simulation
            setTimeout(() => {
              if (video.paused) {
                video.play();
              }
            }, 1000);
          });
        }
      };

      // Try to play immediately
      playVideo();

      // Also try when metadata loads
      video.onloadedmetadata = playVideo;
      video.oncanplay = playVideo;

      // Force play after a short delay
      const playTimeout = setTimeout(playVideo, 500);

      return () => {
        video.onloadedmetadata = null;
        video.oncanplay = null;
        clearTimeout(playTimeout);
      };
    } else {
      // No video or stream
      video.srcObject = null;
    }
  }, [stream, hasVideo]);

  // Add click handler to play video
  const handleClick = () => {
    const video = videoRef.current;
    if (video && video.paused) {
      video.play();
    }
  };

  return (
    <div 
      className="relative w-full h-full"
      onClick={handleClick}
    >
      <video
        id={`video-${producerId}`}
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="absolute inset-0 w-full h-full object-cover bg-black"
        style={{ 
          opacity: hasVideo ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Show placeholder when no video */}
      {(!hasVideo || !stream) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {producerId?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}