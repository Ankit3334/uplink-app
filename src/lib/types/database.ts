export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  boost_count: number;
  thread_count: number;
  created_at: string;
}

export interface Boost {
  id: string;
  user_id: string;
  post_id: string;
}

export interface Thread {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "boost_count" | "thread_count" | "created_at"> & {
          id?: string;
          boost_count?: number;
          thread_count?: number;
          created_at?: string;
        };
        Update: Partial<Omit<Post, "id" | "created_at">>;
        Relationships: [];
      };
      boosts: {
        Row: Boost;
        Insert: Omit<Boost, "id"> & { id?: string };
        Update: Partial<Omit<Boost, "id">>;
        Relationships: [];
      };
      threads: {
        Row: Thread;
        Insert: Omit<Thread, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Thread, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
