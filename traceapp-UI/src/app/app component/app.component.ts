import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'traceapp-UI';
  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  postJiraToNeo4j() {
    let issues;
    this.http.get(`/api/jira/keysAndSummary`).subscribe((data) => {
      issues = data;
      this.http.post('/api/neo4j/jiraToNeo4j', {issues: issues}, {responseType: 'text'}).subscribe(r => {
        console.log(r);
      });
    })
  }

  updateGit(){
    this.http.post('/updateproject', {project_id:1}, {responseType:'text'}).subscribe((r) => {
      console.log(r);
    })
  }
}
