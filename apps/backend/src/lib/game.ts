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

    this.doWriting();
  }

  private doWriting() {
    if (this.gameState.phase === 'playing') {
      // continuing
      this.gameState.roundIndex++;
      this.gameState.submissions = new Map();
      this.gameState.step = 'writing';
    } else {
      // first round
      this.gameState = {
        phase: 'playing',
        step: 'writing',
        imageUrl: 'https://placekitten.com/300/400',
        roundIndex: -1,
        scores: new Map(),
        submissions: new Map(),
      };
    }

    this.io.in(this.lobbyId).emit('game:set-state', {
      state: 'writing',
      imgUrl: this.gameState.imageUrl,
    });

    if (this.gameState.roundIndex + 1 >= ROUND_COUNT) {
      this.endGame(this.gameState.scores);
    } else {
      this.timeout = setTimeout(this.doJudging, ROUND_TIME * 1000);
    }
  }

  private doJudging() {
    if (
      this.gameState.phase !== 'playing' ||
      this.gameState.step !== 'writing'
    ) {
      throw new Error('Attempted to start judging phas');
    }
    // TODO
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
