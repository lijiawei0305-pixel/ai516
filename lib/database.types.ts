export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          creator_id: string;
          original_sentence: string;
          hidden_meaning: string;
          room_title: string;
          public_title: string;
          emotion_type: string;
          visual_theme: string;
          room_json: Json;
          visibility: Database["public"]["Enums"]["room_visibility"];
          status: Database["public"]["Enums"]["room_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          original_sentence: string;
          hidden_meaning: string;
          room_title: string;
          public_title: string;
          emotion_type: string;
          visual_theme?: string;
          room_json?: Json;
          visibility?: Database["public"]["Enums"]["room_visibility"];
          status?: Database["public"]["Enums"]["room_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          original_sentence?: string;
          hidden_meaning?: string;
          room_title?: string;
          public_title?: string;
          emotion_type?: string;
          visual_theme?: string;
          room_json?: Json;
          visibility?: Database["public"]["Enums"]["room_visibility"];
          status?: Database["public"]["Enums"]["room_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      room_assets: {
        Row: {
          id: string;
          room_id: string;
          creator_id: string;
          storage_path: string;
          public_url: string | null;
          signed_url_strategy: Json;
          asset_type: Database["public"]["Enums"]["room_asset_type"];
          role: Database["public"]["Enums"]["room_asset_role"];
          safe_description: string | null;
          object_id: string | null;
          layer_role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          creator_id: string;
          storage_path: string;
          public_url?: string | null;
          signed_url_strategy?: Json;
          asset_type?: Database["public"]["Enums"]["room_asset_type"];
          role?: Database["public"]["Enums"]["room_asset_role"];
          safe_description?: string | null;
          object_id?: string | null;
          layer_role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          creator_id?: string;
          storage_path?: string;
          public_url?: string | null;
          signed_url_strategy?: Json;
          asset_type?: Database["public"]["Enums"]["room_asset_type"];
          role?: Database["public"]["Enums"]["room_asset_role"];
          safe_description?: string | null;
          object_id?: string | null;
          layer_role?: string;
          created_at?: string;
        };
      };
      room_shares: {
        Row: {
          id: string;
          room_id: string;
          creator_id: string;
          share_token: string;
          target_user_id: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          creator_id: string;
          share_token: string;
          target_user_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          creator_id?: string;
          share_token?: string;
          target_user_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      guess_attempts: {
        Row: {
          id: string;
          room_id: string;
          share_id: string;
          player_id: string | null;
          anonymous_id: string | null;
          selected_object_ids: string[];
          selected_choice_index: number | null;
          free_text_guess: string | null;
          score: number | null;
          affinity_score: number | null;
          hit_keywords: string[];
          missed_keywords: string[];
          title: string | null;
          comment: string | null;
          reveal_level: number;
          owner_visibility_acknowledged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          share_id: string;
          player_id?: string | null;
          anonymous_id?: string | null;
          selected_object_ids?: string[];
          selected_choice_index?: number | null;
          free_text_guess?: string | null;
          score?: number | null;
          affinity_score?: number | null;
          hit_keywords?: string[];
          missed_keywords?: string[];
          title?: string | null;
          comment?: string | null;
          reveal_level?: number;
          owner_visibility_acknowledged_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          share_id?: string;
          player_id?: string | null;
          anonymous_id?: string | null;
          selected_object_ids?: string[];
          selected_choice_index?: number | null;
          free_text_guess?: string | null;
          score?: number | null;
          affinity_score?: number | null;
          hit_keywords?: string[];
          missed_keywords?: string[];
          title?: string | null;
          comment?: string | null;
          reveal_level?: number;
          owner_visibility_acknowledged_at?: string;
          created_at?: string;
        };
      };
      pet_conversations: {
        Row: {
          id: string;
          room_id: string;
          share_id: string | null;
          guess_attempt_id: string | null;
          user_id: string | null;
          role: Database["public"]["Enums"]["pet_conversation_role"];
          content: string;
          safe_summary: string | null;
          hint_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          share_id?: string | null;
          guess_attempt_id?: string | null;
          user_id?: string | null;
          role: Database["public"]["Enums"]["pet_conversation_role"];
          content: string;
          safe_summary?: string | null;
          hint_level?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          share_id?: string | null;
          guess_attempt_id?: string | null;
          user_id?: string | null;
          role?: Database["public"]["Enums"]["pet_conversation_role"];
          content?: string;
          safe_summary?: string | null;
          hint_level?: number;
          created_at?: string;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          owner_id: string;
          room_id: string | null;
          guess_attempt_id: string | null;
          entry_type: Database["public"]["Enums"]["diary_entry_type"];
          title: string;
          markdown_content: string;
          visibility: Database["public"]["Enums"]["diary_visibility"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          room_id?: string | null;
          guess_attempt_id?: string | null;
          entry_type: Database["public"]["Enums"]["diary_entry_type"];
          title: string;
          markdown_content?: string;
          visibility?: Database["public"]["Enums"]["diary_visibility"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          room_id?: string | null;
          guess_attempt_id?: string | null;
          entry_type?: Database["public"]["Enums"]["diary_entry_type"];
          title?: string;
          markdown_content?: string;
          visibility?: Database["public"]["Enums"]["diary_visibility"];
          created_at?: string;
          updated_at?: string;
        };
      };
      diary_access_requests: {
        Row: {
          id: string;
          diary_entry_id: string;
          requester_id: string;
          owner_id: string;
          room_id: string;
          guess_attempt_id: string;
          message: string | null;
          status: Database["public"]["Enums"]["diary_access_status"];
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          diary_entry_id: string;
          requester_id: string;
          owner_id: string;
          room_id: string;
          guess_attempt_id: string;
          message?: string | null;
          status?: Database["public"]["Enums"]["diary_access_status"];
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          diary_entry_id?: string;
          requester_id?: string;
          owner_id?: string;
          room_id?: string;
          guess_attempt_id?: string;
          message?: string | null;
          status?: Database["public"]["Enums"]["diary_access_status"];
          created_at?: string;
          responded_at?: string | null;
        };
      };
      diary_comments: {
        Row: {
          id: string;
          diary_entry_id: string;
          author_id: string;
          owner_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          diary_entry_id: string;
          author_id: string;
          owner_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          diary_entry_id?: string;
          author_id?: string;
          owner_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      memory_documents: {
        Row: {
          id: string;
          owner_id: string;
          scope_type: Database["public"]["Enums"]["memory_scope_type"];
          scope_id: string | null;
          markdown_content: string;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          scope_type: Database["public"]["Enums"]["memory_scope_type"];
          scope_id?: string | null;
          markdown_content?: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          scope_type?: Database["public"]["Enums"]["memory_scope_type"];
          scope_id?: string | null;
          markdown_content?: string;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      relationship_scores: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          room_id: string;
          guess_attempt_id: string;
          affinity_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          room_id: string;
          guess_attempt_id: string;
          affinity_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          room_id?: string;
          guess_attempt_id?: string;
          affinity_score?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_room_play_payload: {
        Args: { p_share_token: string };
        Returns: Json | null;
      };
      diary_access_threshold: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      room_visibility: "private" | "unlisted" | "public";
      room_status: "draft" | "active" | "archived" | "deleted";
      room_asset_type: "image";
      room_asset_role: "clue_image";
      pet_conversation_role: "user" | "assistant";
      diary_entry_type:
        | "created_room"
        | "guessed_room"
        | "mutual_result"
        | "pet_memory"
        | "manual_note";
      diary_visibility: "private" | "shared_by_request" | "shared";
      diary_access_status: "pending" | "approved" | "rejected";
      memory_scope_type: "user" | "room" | "relationship" | "pet";
    };
  };
};

export type RoomPlayPayload = {
  share: {
    id: string;
    room_id: string;
    expires_at: string | null;
  };
  room: {
    id: string;
    creator_id: string;
    public_title: string;
    emotion_type: string;
    visual_theme: string;
    room_json: Json;
    visibility: Database["public"]["Enums"]["room_visibility"];
    status: Database["public"]["Enums"]["room_status"];
    created_at: string;
    updated_at: string;
  };
  assets: Array<{
    id: string;
    room_id: string;
    public_url: string | null;
    signed_url_strategy: Json;
    asset_type: Database["public"]["Enums"]["room_asset_type"];
    role: Database["public"]["Enums"]["room_asset_role"];
    safe_description: string | null;
    created_at: string;
  }>;
  privacy_notice: string;
};
