import promptBank from "@/data/promptBank.json";
import type {
  Difficulty,
  GameState,
  Player,
  PromptRecord,
  PromptType,
} from "./types";

const REPEAT_CHANCE = 0.1; // ~10% chance a prompt can repeat within a session

// Plain-JS id, not crypto.randomUUID(): randomUUID only works in secure
// contexts (HTTPS or localhost), and breaks silently over http://192.168.x.x
// when testing on another device on the LAN. These ids only need to be
// unique within one local game session, so this is sufficient.
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

type Bank = Record<Difficulty, Record<PromptType, string[]>>;
const BANK = promptBank as unknown as Bank;

export function makePlayers(names: string[]): Player[] {
  return names
    .map((n) => n.trim())
    .filter(Boolean)
    .map((name) => ({
      id: makeId(),
      name,
      forfeits: 0,
    }));
}

export function createInitialState(
  players: Player[],
  difficulty: Difficulty,
  tieBreak: "random" | "coin"
): GameState {
  return {
    screen: "spin",
    players,
    difficulty,
    tieBreak,
    selectedPlayerId: null,
    active: null,
    usedPromptIds: [],
    turnCount: 0,
  };
}

function pickPrompt(
  difficulty: Difficulty,
  type: PromptType,
  usedIds: string[]
): PromptRecord {
  const pool = BANK[difficulty][type];
  const withIds = pool.map((content, i) => ({
    id: `${difficulty}-${type}-${i}`,
    type,
    difficulty,
    content,
  }));

  const unused = withIds.filter((p) => !usedIds.includes(p.id));
  const allowRepeat = unused.length === 0 || Math.random() < REPEAT_CHANCE;
  const candidates = allowRepeat ? withIds : unused;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function pickRandomPlayer(players: Player[]): Player {
  return players[Math.floor(Math.random() * players.length)];
}

export function highestForfeitPlayer(
  players: Player[]
): { player: Player; tied: boolean } {
  const max = Math.max(...players.map((p) => p.forfeits));
  const tied = players.filter((p) => p.forfeits === max);
  const player = tied[Math.floor(Math.random() * tied.length)];
  return { player, tied: tied.length > 1 };
}

export type GameAction =
  | { type: "SPIN" }
  | { type: "LANDED" }
  | { type: "CHOOSE"; choice: "truth" | "dare" | "random" }
  | { type: "RESOLVE"; result: "done" | "forfeit" }
  | { type: "END_GAME" }
  | { type: "PUNISH" }
  | { type: "RESOLVE_PUNISH"; result: "done" | "forfeit" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SPIN": {
      // Selects the player immediately so the wheel animation has a fixed
      // target; the screen only advances once the animation reports LANDED.
      const chosen = pickRandomPlayer(state.players);
      return { ...state, selectedPlayerId: chosen.id };
    }

    case "LANDED":
      return { ...state, screen: "choice" };

    case "CHOOSE": {
      const player = state.players.find(
        (p) => p.id === state.selectedPlayerId
      );
      if (!player) return state;
      const type: PromptType =
        action.choice === "random"
          ? Math.random() < 0.5
            ? "truth"
            : "dare"
          : action.choice;
      const prompt = pickPrompt(state.difficulty, type, state.usedPromptIds);
      return {
        ...state,
        screen: "prompt",
        active: { player, prompt, isPunish: false },
        usedPromptIds: [...state.usedPromptIds, prompt.id],
      };
    }

    case "RESOLVE": {
      if (!state.active) return state;
      const players = state.players.map((p) =>
        p.id === state.active!.player.id && action.result === "forfeit"
          ? { ...p, forfeits: p.forfeits + 1 }
          : p
      );
      return {
        ...state,
        players,
        screen: "spin",
        active: null,
        selectedPlayerId: null,
        turnCount: state.turnCount + 1,
      };
    }

    case "END_GAME":
      return { ...state, screen: "ended", active: null };

    case "PUNISH": {
      const { player } = highestForfeitPlayer(state.players);
      const prompt = pickPrompt(state.difficulty, "dare", state.usedPromptIds);
      return {
        ...state,
        screen: "punish",
        active: { player, prompt, isPunish: true },
        usedPromptIds: [...state.usedPromptIds, prompt.id],
      };
    }

    case "RESOLVE_PUNISH": {
      if (!state.active) return state;
      const players = state.players.map((p) =>
        p.id === state.active!.player.id && action.result === "forfeit"
          ? { ...p, forfeits: p.forfeits + 1 }
          : p
      );
      return { ...state, players, screen: "ended", active: null };
    }

    default:
      return state;
  }
}
