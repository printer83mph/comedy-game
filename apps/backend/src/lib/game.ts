import { GameServer } from '../types/server';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;

const ROUND_COUNT = 3;

const WRITING_TIME = 60;
const JUDGING_TIME = 25;
const LOOKING_TIME_PER_CAPTION = 3;
const LOOKING_TIME_WINNER = 10;

const CAPTION_MAX_CHARS = 250;

type GameState =
  | { phase: 'waiting' }
  | {
      phase: 'playing';
      step: 'writing' | 'judging' | 'looking';
      scores: Map<string, number>;
      imageUrl: string;
      roundIndex: number;
      submissions: Map<string, string>;
      votes: Map<string, string>;
    }
  | { phase: 'finished'; scores: Map<string, number> };

export default class Game {
  private gameState: GameState = { phase: 'waiting' };
  private timeout?: NodeJS.Timeout; // TODO: use this for shorting rounds when everyone has submitted
  private readonly playerData = new Map<string, { nickname: string }>();

  private ownerId: string;
  public get OwnerId() {
    return this.ownerId;
  }

  public get PlayerIds() {
    return [...this.playerData.keys()];
  }

  public get Players() {
    return [...this.playerData.entries()];
  }

  constructor(
    private io: GameServer,
    private lobbyId: string,
    ownerId: string,
    ownerNickname: string,
    private deleteMe: () => void,
  ) {
    this.ownerId = ownerId;
    this.addPlayer(ownerId, ownerNickname);
  }

  public addPlayer(playerId: string, nickname: string) {
    if (this.playerData.size >= MAX_PLAYERS) {
      throw new Error('Already at max players');
    }
    if (this.playerData.has(playerId)) {
      throw new Error(`Player ${playerId} already in game`);
    }
    this.playerData.set(playerId, { nickname: nickname });
  }

  public removePlayer(playerId: string) {
    if (!this.playerData.has(playerId)) {
      throw new Error(`Player ${playerId} not in game`);
    }
    this.playerData.delete(playerId);

    // all players disconnected!
    if (this.playerData.size === 0) {
      this.destroy();
      return;
    }

    // lobby owner left
    if (playerId === this.ownerId) {
      this.ownerId = this.playerData.keys().next().value;
    }
  }

  public play() {
    if (
      this.gameState.phase !== 'waiting' &&
      this.gameState.phase !== 'finished'
    ) {
      throw new Error('Game not in waiting room or finished phase');
    }
    if (this.playerData.size < MIN_PLAYERS) {
      throw new Error('Not enough players');
    }
    if (this.playerData.size > MAX_PLAYERS) {
      throw new Error('Too many players');
    }

    this.startWriting();
  }

  private startWriting() {
    if (this.gameState.phase === 'playing') {
      // check for on final round
      if (this.gameState.roundIndex + 1 >= ROUND_COUNT) {
        console.log('ended game!!!');
        this.endGame(this.gameState.scores);
        return;
      }
      // continuing
      this.gameState.roundIndex += 1;
      this.gameState.submissions = new Map();
      this.gameState.step = 'writing';
    } else {
      // first round
      this.gameState = {
        phase: 'playing',
        step: 'writing',
        // TODO: pick random image
        imageUrl: 'https://placekitten.com/300/400',
        roundIndex: 0,
        scores: new Map(),
        submissions: new Map(),
        votes: new Map(),
      };
    }

    this.io.in(this.lobbyId).emit('game:set-state', {
      roundIndex: this.gameState.roundIndex,
      state: 'writing',
      imgUrl: this.gameState.imageUrl,
      endTime: Date.now() + WRITING_TIME * 1000,
    });

    this.timeout = setTimeout(
      this.startJudging.bind(this),
      WRITING_TIME * 1000,
    );
  }

  public submitCaption(playerId: string, caption: string) {
    if (
      this.gameState.phase !== 'playing' ||
      this.gameState.step !== 'writing'
    ) {
      throw new Error('Attempted to submit caption on wrong phase');
    }

    if (this.gameState.submissions.has(playerId)) {
      throw new Error('Player has already submitted a caption');
    }

    if (caption.length > CAPTION_MAX_CHARS) {
      throw new Error(
        `Caption must be at most ${CAPTION_MAX_CHARS} characters`,
      );
    }

    // TODO: validation on caption
    this.gameState.submissions.set(playerId, caption);

    if (this.gameState.submissions.size >= this.playerData.size) {
      clearTimeout(this.timeout);
      this.startJudging();
    }
  }

  private startJudging() {
    if (
      this.gameState.phase !== 'playing' ||
      this.gameState.step !== 'writing'
    ) {
      throw new Error('Attempted to start judging phase at wrong time');
    }

    const { roundIndex, imageUrl, submissions } = this.gameState;

    this.gameState = {
      phase: 'playing',
      step: 'judging',
      roundIndex,
      imageUrl,
      submissions,
      votes: new Map(),
      scores: new Map(),
    };

    this.io.in(this.lobbyId).emit('game:set-state', {
      roundIndex: this.gameState.roundIndex,
      state: 'judging',
      imgUrl: this.gameState.imageUrl,
      endTime: Date.now() + JUDGING_TIME * 1000,
      captions: [...this.gameState.submissions.entries()],
    });

    this.timeout = setTimeout(
      this.startLooking.bind(this),
      JUDGING_TIME * 1000,
    );
  }

  public submitVote(votingPlayerId: string, submissionPlayerId: string) {
    if (
      this.gameState.phase !== 'playing' ||
      this.gameState.step !== 'judging'
    ) {
      throw new Error('Attempted to submit caption on wrong phase');
    }

    if (this.gameState.votes.has(votingPlayerId)) {
      throw new Error('Player has already voted');
    }

    if (votingPlayerId === submissionPlayerId) {
      throw new Error('Player cannot vote for themselves');
    }

    this.gameState.votes.set(votingPlayerId, submissionPlayerId);

    if (this.gameState.votes.size >= this.playerData.size) {
      clearTimeout(this.timeout);
      this.startLooking();
    }
  }

  private startLooking() {
    if (
      this.gameState.phase !== 'playing' ||
      this.gameState.step !== 'judging'
    ) {
      throw new Error('Attempted to start looking phase at wrong time');
    }

    const { imageUrl, submissions, votes, roundIndex, scores } = this.gameState;

    let maxPoints = 0;
    const points = new Map<string, number>();
    for (const [, submissionPlayerId] of votes.entries()) {
      const playerPointTally = (points.get(submissionPlayerId) ?? 0) + 1;
      maxPoints = Math.max(maxPoints, playerPointTally);
      points.set(submissionPlayerId, playerPointTally);
    }
    const winners = [...points.entries()]
      .filter(([, voteCount]) => voteCount === maxPoints)
      .map(([id]) => id);

    winners.forEach((winnerId) => {
      scores.set(winnerId, (scores.get(winnerId) ?? 0) + 1);
    });

    this.gameState = {
      phase: 'playing',
      step: 'writing',
      imageUrl,
      submissions,
      votes,
      roundIndex,
      scores,
    };

    const waitTime =
      LOOKING_TIME_PER_CAPTION * this.gameState.submissions.size +
      LOOKING_TIME_WINNER;

    this.io.in(this.lobbyId).emit('game:set-state', {
      roundIndex: this.gameState.roundIndex,
      state: 'looking',
      imgUrl: this.gameState.imageUrl,
      endTime: Date.now() + waitTime * 1000,
      captions: [...this.gameState.submissions.entries()],
      winners,
    });

    this.timeout = setTimeout(this.startWriting.bind(this), waitTime * 1000);
  }

  private endGame(scores: Map<string, number>) {
    this.gameState = { phase: 'finished', scores };
    this.io.in(this.lobbyId).emit('game:finish', [...scores.entries()]);
  }

  public destroy() {
    clearTimeout(this.timeout);
    this.deleteMe();
  }
}
