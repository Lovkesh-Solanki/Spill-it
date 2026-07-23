// Hand-written to match supabase/schema.sql. Once you have the Supabase CLI
// set up, replace this with a generated file:
//   npx supabase gen types typescript --project-id aeucybwangbbcfmbcdek > src/lib/supabase/types.ts
// That command needs your Supabase access token (CLI login), which isn't
// something to hand to me — run it yourself when convenient. Until then,
// this file is accurate but must be kept in sync by hand if you change the
// schema.

export type Difficulty = "children" | "teens" | "adult" | "spicy";
export type SizeBracket = "2" | "3-5" | "5-10" | "10-25" | "25+";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; created_at: string };
        Insert: { id: string; display_name: string; created_at?: string };
        Update: { display_name?: string };
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          name: string;
          password_hash: string | null;
          is_open: boolean;
          verified_only: boolean;
          size_bracket: SizeBracket;
          owner_id: string;
          expiry_at: string | null;
          created_at: string;
        };
        Insert: never; // always go through the create_room() RPC
        Update: {
          name?: string;
          verified_only?: boolean;
          expiry_at?: string | null;
        };
      };
      room_memberships: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          nickname: string;
          role: "creator" | "member";
          is_muted: boolean;
          joined_at: string;
        };
        Insert: never; // always go through the join_room() RPC
        Update: { is_muted?: boolean };
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          content: string;
          report_count: number;
          status: "visible" | "hidden";
          sent_at: string;
        };
        Insert: { room_id: string; user_id: string; content: string };
        Update: never;
      };
      reports: {
        Row: {
          id: string;
          message_id: string;
          reporter_id: string;
          categories: string[];
          details: string | null;
          review_status: "pending" | "upheld" | "dismissed";
          created_at: string;
        };
        Insert: {
          message_id: string;
          reporter_id: string;
          categories: string[];
          details?: string | null;
        };
        Update: never;
      };
      game_sessions: {
        Row: {
          id: string;
          mode: "local" | "online";
          room_id: string | null;
          difficulty: Difficulty;
          theme: string | null;
          tie_breaker_mode: "random" | "coin_toss";
          created_by: string;
          created_at: string;
        };
        Insert: {
          mode: "local" | "online";
          room_id?: string | null;
          difficulty: Difficulty;
          theme?: string | null;
          tie_breaker_mode?: "random" | "coin_toss";
          created_by: string;
        };
        Update: never;
      };
      players: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          user_id: string | null;
          forfeit_count: number;
        };
        Insert: {
          session_id: string;
          name: string;
          user_id?: string | null;
        };
        Update: { forfeit_count?: number };
      };
      prompt_logs: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          type: "truth" | "dare";
          difficulty: Difficulty;
          content: string;
          result: "forfeit" | "done";
          created_at: string;
        };
        Insert: {
          session_id: string;
          player_id: string;
          type: "truth" | "dare";
          difficulty: Difficulty;
          content: string;
          result: "forfeit" | "done";
        };
        Update: never;
      };
    };
    Views: {
      rooms_public: {
        Row: {
          id: string;
          code: string;
          name: string;
          is_open: boolean;
          verified_only: boolean;
          size_bracket: SizeBracket;
          owner_id: string;
          expiry_at: string | null;
          created_at: string;
          has_password: boolean;
        };
      };
    };
    Functions: {
      create_room: {
        Args: {
          p_name: string;
          p_password: string | null;
          p_size_bracket: SizeBracket;
          p_verified_only?: boolean;
        };
        Returns: Database["public"]["Tables"]["rooms"]["Row"];
      };
      join_room: {
        Args: {
          p_code: string;
          p_password?: string | null;
          p_nickname?: string | null;
        };
        Returns: Database["public"]["Tables"]["rooms"]["Row"];
      };
    };
  };
};
