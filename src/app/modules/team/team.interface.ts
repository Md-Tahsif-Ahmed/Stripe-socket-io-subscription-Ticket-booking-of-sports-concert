import { IEvent } from '../event/event.interface';

export enum TeamGenre {
  POP = "Pop",
  ROCK = "Rock",
  HIP_HOP = "Hip-Hop",
  RB = "R&B",
  COUNTRY = "Country",
  ELECTRONIC = "Electronic",
  JAZZ = "Jazz",
  CLASSICAL = "Classical",
  REGGAE = "Reggae",
}

export interface ITeam {
  image?: string;
  name: string;
  genre: TeamGenre;
  bio?: string;
  instagram?: string; // Individual field
  twitter?: string; // Individual field
  facebook?: string; // Individual field
  website?: string; // Individual field
  isVerified: boolean;
}
export interface ITeamWithEvents extends ITeam {
  events: IEvent[];
}
 