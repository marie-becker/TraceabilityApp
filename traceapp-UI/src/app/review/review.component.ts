import {Component, OnInit} from '@angular/core';
import {Issue} from "../../models/issue";
import {FormControl, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import Swal from "sweetalert2";
import {IssueMin} from "../../models/issueMin";

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

  issues: IssueMin[];
  searchIssues: IssueMin[];
  selectedIssue: Issue;
  selectedIssuesClasses: String[];
  availableClasses: String[];
  edit = false;
  classControl = new FormControl('', Validators.required);
  searchControl = new FormControl();

  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get('/api/neo4j/reviewableIssues').subscribe((data: IssueMin[]) => {
      this.issues = data.sort((a,b) => a.key.localeCompare(b.key, undefined, {numeric: true}));
      this.searchIssues = data;
      // console.log(data)
      if (this.issues.length != 0) {
        this.getReq(this.issues[0].key);
        this.getClassesForReq(this.issues[0].key);
      }
    })
  }

  getReq(key) {
    this.http.get(`/api/jira/byKey/${key}`).subscribe((data: Issue) => {
      this.selectedIssue = data;
    })
  }

  getAvailableClasses() {
    this.http.get(`/api/neo4j/allClassNames`).subscribe((data: String[]) => {
      this.availableClasses = data.filter(n => !this.selectedIssuesClasses.includes(n)).sort();
    })
  }

  getClassesForReq(key) {
    this.http.get(`/api/neo4j/classes/${key}`).subscribe((data: String[]) => {
      this.selectedIssuesClasses = data.sort();
    })
  }

  deleteTrace(key, cl) {
    this.http.post('/api/neo4j/deleteTrace', {key: key, filename: cl}, {responseType: 'text'}).subscribe();
    this.getClassesForReq(key);
  }

  deleteTraceBox(key, cl) {
    Swal.fire({
      title: 'Do you really want to delete the trace?',
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteTrace(key, cl);
      }
    })
  }

  addTrace(key) {
    console.log(this.classControl.value);
    this.http.post('/api/neo4j/addTrace', {
      key: key,
      filename: this.classControl.value
    }, {responseType: 'text'}).subscribe(r => {
      this.getClassesForReq(key);
      this.getAvailableClasses();
    });
  }

  searchChange() {
    this.issues = this.searchIssues.filter(i => i.key.toLowerCase().includes(this.searchControl.value.toLowerCase()) ||
      i.summary.toLowerCase().includes(this.searchControl.value.toLowerCase()))
  }

  finishReview(key){
    this.http.post('/api/neo4j/finishReview', {key:key}, {responseType: "text"}).subscribe(() =>{
      this.getIssues();
    })
  }

  getIssues(){
    this.http.get('/api/neo4j/reviewableIssues').subscribe((data: IssueMin[]) => {
      this.issues = data;
      this.searchIssues = data.sort((a,b) => a.key.localeCompare(b.key));;
      if (this.issues.length != 0) {
        this.getReq(this.issues[0].key);
        this.getClassesForReq(this.issues[0].key);
      }
    })
  }
  finishAllBox() {
    Swal.fire({
      title: 'Do you really want to dismiss every issue warning?',
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.finishAll();
      }
    })
  }

  finishAll(){
    this.http.get('/api/neo4j/setIssuesToFalse', {responseType:"text"}).subscribe((r:string) => {
      console.log(r);
      this.getIssues();
      this.selectedIssue = null;
    })
  }
}
