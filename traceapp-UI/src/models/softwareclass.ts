import {IssueMin} from "./issueMin";

export interface Softwareclass{
  filename: string;
  lastcommit: string;
  requirements: IssueMin[];
  path: string;
}
