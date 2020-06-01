import { useState, useCallback, useRef } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { LogLevels, Track, TrackPublication } from 'twilio-video';

interface MediaStreamTrackPublishOptions {
  name?: string;
  priority: Track.Priority;
  logLevel: LogLevels;
}

export default function useClipShareToggle() {
  const { room, onError } = useVideoContext();
  const [isSharing, setIsSharing] = useState(false);
  const stopClipShareRef = useRef<Array<() => void>>([]);

  const stopAll = () => {
    console.log(stopClipShareRef.current);
    stopClipShareRef.current.forEach((fn: () => void) => {
      console.log('calling fn');
      fn();
    });
    stopClipShareRef.current = [];
    setIsSharing(false);
  };

  const stopShare = useCallback(
    (track: MediaStreamTrack, trackPublication: TrackPublication) => {
      console.log('unpublishing track', track.label, track.kind);
      room.localParticipant.unpublishTrack(track);
      // TODO: remove this if the SDK is updated to emit this event
      room.localParticipant.emit('trackUnpublished', trackPublication);
      track.stop();
    },
    [room.localParticipant]
  );

  const shareClip = useCallback(() => {
    const clip: HTMLMediaElement | null = document.querySelector('video#recorded_clip');
    let stream;

    if (clip && clip.captureStream) {
      stream = clip.captureStream();

      const tracks = stream.getTracks();
      tracks.forEach(track => {
        room.localParticipant
          .publishTrack(track, {
            name: `clip-${track.kind}`,
          } as MediaStreamTrackPublishOptions)
          .then(trackPublication => {
            stopClipShareRef.current.push(stopShare.bind(null, track, trackPublication));

            console.log(stopClipShareRef.current.length);

            track.onended = stopAll;
            setIsSharing(true);
          })
          .catch(onError);
      });
    }
  }, [room, onError, stopShare]);

  const toggleClipShare = useCallback(() => {
    !isSharing ? shareClip() : stopAll();
  }, [isSharing, shareClip]);

  return [isSharing, toggleClipShare] as const;
}
