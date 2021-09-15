import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IssueMin} from "../../models/issueMin";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  nonTraceableIssues: IssueMin[];
  traceableIssues: IssueMin[];
  reviewableIssues: IssueMin[];
  //options = {autoHide: false, scrollbarMinSize: 100}; ?

  constructor(private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    await this.getNonTraceableIssues();
    await this.getTraceableIssues();
    await this.getRevieableIssues();
  }

  getNonTraceableIssues() {
    this.http.get(`/api/neo4j/nonTraceableIssues`).subscribe((data: IssueMin[]) => {
      this.nonTraceableIssues = data.sort((a,b) => a.key.localeCompare(b.key, undefined, {numeric: true}));
    })
  }

  getTraceableIssues() {
    this.http.get(`/api/neo4j/traceableIssues`).subscribe((data: IssueMin[]) => {
      this.traceableIssues = data.sort((a,b) => a.key.localeCompare(b.key, undefined, {numeric: true}));
    })
  }


  getRevieableIssues() {
    this.http.get('/api/neo4j/reviewableIssues').subscribe((data: IssueMin[]) => {
      this.reviewableIssues = data.sort((a,b) => a.key.localeCompare(b.key, undefined, {numeric: true}));
    })
  }
}
