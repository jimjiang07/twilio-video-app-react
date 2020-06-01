import { useState, useCallback, useRef } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { LogLevels, Track } from 'twilio-video';

interface MediaStreamTrackPublishOptions {
  name?: string;
  priority: Track.Priority;
  logLevel: LogLevels;
}

export default function useClipShareToggle() {
  const { room, onError } = useVideoContext();
  const [isSharing] = useState(false);
  const stopClipShareRef = useRef<() => void>(null!);

  const shareScreen = useCallback(() => {
    const clip: HTMLMediaElement | null = document.querySelector('video#recorded_clip');
    let stream;

    if (clip && clip.captureStream) {
      stream = clip.captureStream();

      const tracks = stream.getTracks();

      console.log(stream.getTracks());

      // All video tracks are published with 'low' priority. This works because the video
      // track that is displayed in the 'MainParticipant' component will have it's priority
      // set to 'high' via track.setPriority()
      room.localParticipant.publishTracks(tracks).catch(onError);

      console.log(room.localParticipant);
    }
  }, [room, onError]);

  const toggleClipShare = useCallback(() => {
    !isSharing ? shareScreen() : stopClipShareRef.current();
  }, [isSharing, shareScreen, stopClipShareRef]);

  return [isSharing, toggleClipShare] as const;
}
