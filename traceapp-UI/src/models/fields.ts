import {Issuetype} from "./issuetype";
import {Project} from "./project";
import {Priority} from "./priority";
import {Status} from "./status";
import {Component} from "./component";
import {Assignee} from "./assignee";
import {Reporter} from "./reporter";


export interface Fields{
  issuetype: Issuetype,       // -> issuetype.name
  project: Project,           // -> project.key (BAC), project.name
  summary: string,            // "Name"/Summary of issue
  priority: Priority,         // -> priority.name
  status: Status,             // -> status.name
  components: Component[],    // name, description
  description: string,        // Beschreibung des issues
  assignee: Assignee,         // -> assignee.displayName, (assignee.emailAddress)
  reporter: Reporter,         // -> reporter.displayName, (assignee.emailAddress)
}
