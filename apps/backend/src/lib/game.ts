import { GameServer, LobbyID } from '../types/server';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const ROUND_COUNT = 5;
const ROUND_TIME = 30;

type GameState =
  | { phase: 'waiting' }
  | {
      phase: 'playing';
      step: 'writing' | 'judging';
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

  constructor(
    private io: GameServer,
    private lobbyId: LobbyID,
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
    if (this.gameState.phase !== 'waiting') {
      throw new Error('Game not in waiting room phase');
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
      endTime: Date.now() + ROUND_TIME * 1000,
    });

    this.timeout = setTimeout(this.startJudging.bind(this), ROUND_TIME * 1000);
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

    // TODO: validation on caption
    this.gameState.submissions.set(playerId, caption);
  }

  private startJudging() {
    if (
      this.gameState.phase !== 'playing' ||
      this.gameState.step !== 'writing'
    ) {
      throw new Error('Attempted to start judging phase');
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

    if (this.gameState.roundIndex + 1 >= ROUND_COUNT) {
      this.endGame(this.gameState.scores);
    } else {
      this.timeout = setTimeout(
        this.startWriting.bind(this),
        ROUND_TIME * 1000,
      );
    }
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
    this.gameState.scores.set(
      submissionPlayerId,
      (this.gameState.scores.get(submissionPlayerId) ?? 0) + 1,
    );
  }

  private endGame(scores: Map<string, number>) {
    this.gameState = { phase: 'finished', scores };
    this.io.in(this.lobbyId).emit('game:finish', scores);
  }

  public destroy() {
    clearTimeout(this.timeout);
    this.deleteMe();
  }
}
