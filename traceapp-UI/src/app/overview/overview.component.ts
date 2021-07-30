import { Component, OnInit } from '@angular/core';
import {Issue} from "../../models/issue";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  issues: Issue[];
  private subscriber:any;


  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    console.log("ngoninit")
    this.subscriber = this.route.params.subscribe(() => {
      this.http.get('/api/jira/').subscribe((data:Issue[]) => {
        this.issues = data;
        console.log(data)
      })
    })
  }

}
