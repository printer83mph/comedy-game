import { GameServer, GameSocket } from '../types/server';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const ROUND_COUNT = 5;
const ROUND_TIME = 30;

type GameState =
  | { phase: 'waiting' }
  | {
      phase: 'writing' | 'judging';
      scores: Map<string, number>;
      imageUrl: string;
      roundIndex: number;
      submissions: Map<string, string>;
      timeout?: NodeJS.Timeout; // TODO: use this for shorting rounds when everyone has submitted
    }
  | { phase: 'finished'; scores: Map<string, number> };

export default class Game {
  private gameState: GameState = { phase: 'waiting' };
  private readonly playerData = new Map<string, { foo?: undefined }>();

  private ownerId: string;

  constructor(
    private io: GameServer,
    private lobbyId: string,
    owner: GameSocket,
    private deleteMe: () => void,
  ) {
    this.addPlayer(owner);
    this.ownerId = owner.id;

    owner.on('game:start', () => {
      try {
        this.play();
      } catch (err) {
        owner.emit('client-error', (err as Error).message);
      }
    });
  }

  public addPlayer(socket: GameSocket) {
    const playerId = socket.id;
    if (this.playerData.size >= MAX_PLAYERS) {
      throw new Error('Already at max players');
    }
    if (this.playerData.has(playerId)) {
      throw new Error('Player already in game');
    }
    this.playerData.set(playerId, {});

    // TODO: set up listeners
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

    this.doRound();
  }

  private doRound() {
    if (this.gameState.phase !== 'judging') {
      // first round
      this.gameState = {
        phase: 'writing',
        imageUrl: 'https://placekitten.com/300/400',
        roundIndex: -1,
        scores: new Map(),
        submissions: new Map(),
      };
    } else {
      // continuing
      this.gameState.roundIndex++;
      this.gameState.submissions = new Map();
      this.gameState.phase = 'writing';
    }

    this.io.in(this.lobbyId).emit('game:set-state', {
      state: 'writing',
      imgUrl: this.gameState.imageUrl,
    });

    if (this.gameState.roundIndex + 1 >= ROUND_COUNT) {
      this.endGame(this.gameState.scores);
    } else {
      this.gameState.timeout = setTimeout(this.doRound, ROUND_TIME * 1000);
    }
  }

  private endGame(scores: Map<string, number>) {
    this.gameState = { phase: 'finished', scores };
    this.io.emit('game:finish', scores);
  }
}
