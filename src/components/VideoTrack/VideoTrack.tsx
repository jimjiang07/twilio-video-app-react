import React, { useRef, useEffect } from 'react';
import { IVideoTrack } from '../../types';
import { makeStyles } from '@material-ui/core/styles';
import { Track } from 'twilio-video';

const useStyles = makeStyles({
  VideoBase: {
    width: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transform: 'rotateY(180deg)',
  },
  VideoClip: {
    position: 'absolute',
    width: '49%',
    right: '0',
    top: '0',
    border: '5px solid',
  },
});

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
}

export default function VideoTrack({ track, isLocal, priority }: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  // The local video track is mirrored.
  const isClip = track.name.includes('clip');
  const classes = useStyles();

  return <video className={`${classes.VideoBase} ${isClip ? classes.VideoClip : ''}`} ref={ref} />;
}
