import {Component, OnInit} from '@angular/core';
import {Issue} from "../../models/issue";
import {HttpClient} from "@angular/common/http";
import Swal from "sweetalert2";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent implements OnInit {

  issues: Issue[];
  searchIssues: Issue[];
  selectedIssue: Issue;
  selectedIssuesClasses: String[];
  availableClasses: String[];
  edit = false;
  classControl = new FormControl('', Validators.required);
  searchControl = new FormControl();

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get('/api/jira/allIssues').subscribe(async (data: Issue[]) => {
      this.issues = data;
      this.searchIssues = data;
      if (this.issues.length != 0) {
        await this.getReq(this.issues[0].key);
        await this.getClassesForReq(this.issues[0].key);
        this.selectedIssue = this.issues[0];
      }
    })
  }


  getReq(key) {
    this.selectedIssue = this.issues.find(obj => {return obj.key == key});
    /*
    this.http.get(`/api/jira/byKey/${key}`).subscribe((data: Issue) => {
      this.selectedIssue = data;
    })

     */
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
    this.http.post('/api/neo4j/addTrace', {key: key, filename: this.classControl.value}, {responseType: 'text'}).subscribe(r => {
      this.getClassesForReq(key);
      this.getAvailableClasses();
    });
  }

  searchIssue(){
    this.issues = this.searchIssues.filter(i =>
      i.key.toLowerCase().includes(this.searchControl.value.toLowerCase()) ||
      i.fields.summary.toLowerCase().includes(this.searchControl.value.toLowerCase()))
  }
}
