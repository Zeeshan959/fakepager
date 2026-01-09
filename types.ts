
export enum Theme {
  White = 'white',
  Dim = 'dim',
  Black = 'black',
}

export type UserStatus = 'TRIALING' | 'TRIAL_ENDED' | 'PAID' | 'NEVER_STARTED' | 'OWNER';

export interface Profile {
  id: string;
  status: 'trialing' | 'paid' | 'owner';
  trial_started_at: string;
  created_at?: string;
  updated_at?: string;
}
