import {Component, OnInit} from '@angular/core';
import {Issue} from "../../models/issue";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {IssueMin} from "../../models/issueMin";
import {Softwareclass} from "../../models/softwareclass";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  issues: Issue[];
  nonTraceableIssues: IssueMin[];
  traceableIssues: IssueMin[];
  reviewableIssues: IssueMin[];
  options = {autoHide: false, scrollbarMinSize: 100};

  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    this.http.get('/api/jira/').subscribe((data: Issue[]) => {
      this.issues = data;
    })
    await this.getNonTraceableIssues();
    await this.getTraceableIssues();
    await this.getRevieableIssues();
  }

  getNonTraceableIssues() {
    this.http.get(`/api/neo4j/getNonTraceableIssues`).subscribe((data: IssueMin[]) => {
      this.nonTraceableIssues = data.sort((a, b) => a.key.slice(a.key.length - 4).localeCompare(b.key.slice(b.key.length - 4)))
    })
  }

  getTraceableIssues() {
    this.http.get(`/api/neo4j/getTraceableIssues`).subscribe((data: IssueMin[]) => {
      this.traceableIssues = data.sort((a, b) => a.key.slice(a.key.length - 4).localeCompare(b.key.slice(b.key.length - 4)))
    })
  }


  getRevieableIssues() {
    this.http.get('/api/neo4j/getReviewableIssues').subscribe((data: IssueMin[]) => {
      this.reviewableIssues = data.sort((a, b) => a.key.slice(a.key.length - 4).localeCompare(b.key.slice(b.key.length - 4)))
    })
  }
}
