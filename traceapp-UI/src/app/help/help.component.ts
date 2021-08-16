import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {


  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  postJiraToNeo4j() {
    let issues;
    this.http.get(`/api/jira/keysAndSummary`).subscribe((data) => {
      issues = data;
      this.http.post('/api/neo4j/postNodes', {issues: issues}, {responseType: 'text'}).subscribe(r => {
        console.log("error")
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
