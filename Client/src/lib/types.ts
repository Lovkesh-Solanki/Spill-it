export type Difficulty = "children" | "teens" | "adult" | "spicy";

export const DIFFICULTIES: { id: Difficulty; label: string; blurb: string }[] = [
  { id: "children", label: "Children", blurb: "Silly, safe, no age gate." },
  { id: "teens", label: "Teens", blurb: "Cheeky but classroom-safe." },
  { id: "adult", label: "Adult", blurb: "18+. Frank questions, bolder dares." },
  { id: "spicy", label: "Spicy", blurb: "18+. As bold as the room allows." },
];

export type PromptType = "truth" | "dare";

export interface Player {
  id: string;
  name: string;
  forfeits: number;
}

export interface PromptRecord {
  id: string;
  type: PromptType;
  difficulty: Difficulty;
  content: string;
}

export type Screen =
  | "setup"
  | "spin"
  | "choice"
  | "prompt"
  | "punish"
  | "ended";

export interface ActivePrompt {
  player: Player;
  prompt: PromptRecord;
  isPunish: boolean;
}

export interface GameState {
  screen: Screen;
  players: Player[];
  difficulty: Difficulty;
  tieBreak: "random" | "coin";
  selectedPlayerId: string | null;
  active: ActivePrompt | null;
  usedPromptIds: string[];
  turnCount: number;
}
