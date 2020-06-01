import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Participant, Track } from 'twilio-video';
import Publication from '../Publication/Publication';
import usePublications from '../../hooks/usePublications/usePublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

interface ParticipantTracksProps {
  participant: Participant;
  disableAudio?: boolean;
  enableScreenShare?: boolean;
  videoPriority?: Track.Priority | null;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    testMainP: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
  })
);

/*
 *  The object model for the Room object (found here: https://www.twilio.com/docs/video/migrating-1x-2x#object-model) shows
 *  that Participant objects have TrackPublications, and TrackPublication objects have Tracks.
 *
 *  The React components in this application follow the same pattern. This ParticipantTracks component renders Publications,
 *  and the Publication component renders Tracks.
 */

export default function ParticipantTracks({
  participant,
  disableAudio,
  enableScreenShare,
  videoPriority,
}: ParticipantTracksProps) {
  const classes = useStyles();
  const { room } = useVideoContext();
  const publications = usePublications(participant);
  const isLocal = participant === room.localParticipant;

  let filteredPublications;

  if (enableScreenShare && publications.some(p => p.trackName.includes('screen'))) {
    filteredPublications = publications.filter(p => !p.trackName.includes('camera'));
  } else {
    filteredPublications = publications.filter(p => !p.trackName.includes('screen'));
  }

  console.log('filteredPublications.length:', filteredPublications, filteredPublications.length);

  return (
    <div className={classes.testMainP}>
      {filteredPublications.slice(0, 2).map((publication, index) => (
        <Publication
          key={`${publication.kind}-${index}`}
          publication={publication}
          participant={participant}
          isLocal={isLocal}
          disableAudio={disableAudio}
          videoPriority={videoPriority}
        />
      ))}
      {filteredPublications.slice(2).map((publication, index) => (
        <div
          style={{
            position: 'absolute',
            width: 250,
            height: 'auto',
            top: 79,
            right: 41,
          }}
        >
          <Publication
            key={`${publication.kind}-${index}`}
            publication={publication}
            participant={participant}
            isLocal={isLocal}
            disableAudio={disableAudio}
            videoPriority={videoPriority}
          />
        </div>
      ))}
    </div>
  );
}
