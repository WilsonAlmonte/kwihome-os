import { HomeArea } from "../home-areas/home-area.entity";

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;

  homeArea?: HomeArea;
};
