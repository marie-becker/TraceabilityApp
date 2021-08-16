import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {FormControl, Validators} from "@angular/forms";
import {Softwareclass} from "../../models/softwareclass";
import {IssueMin} from "../../models/issueMin";
import Swal from "sweetalert2";

@Component({
  selector: 'app-architecture',
  templateUrl: './architecture.component.html',
  styleUrls: ['./architecture.component.scss']
})
export class ArchitectureComponent implements OnInit {

  classes: Softwareclass[];
  searchClasses: Softwareclass[];
  searchControl = new FormControl();
  selectedClass: Softwareclass;
  selectedClassIssues: IssueMin[];
  edit = false;
  editClass = false;
  add = false;
  issueControl = new FormControl('', Validators.required);
  availableIssues: IssueMin[];


  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    //await this.getAllClasses();
    this.http.get('/api/neo4j/classList').subscribe((data: Softwareclass[]) => {
      this.classes = data;
      this.searchClasses = data;
      if (this.classes.length != 0) {
        this.selectedClass = this.classes[0];
        this.getIssuesForClass(this.classes[0].filename);
      }
    })

  }

  searchChange() {
    this.classes = this.searchClasses.filter(i => i.filename.toLowerCase().includes(this.searchControl.value.toLowerCase()));
  }

  getAvailableIssues() {
    let requirements = this.selectedClassIssues;
    this.http.get('/api/neo4j/getRequirements').toPromise()
      .then((data: IssueMin[]) => {
        console.log(data);
        this.availableIssues = data.filter(({key: id1}) => !requirements.some(({key: id2}) => id1 === id2));
        console.log(this.availableIssues.length + "/" + data.length)
      })
      .catch(error => console.log(error))
  }

  getIssuesForClass(filename) {
    this.http.get(`/api/neo4j/getIssuesOfClass/${filename}`).toPromise()
      .then((data: IssueMin[]) => {
        this.selectedClassIssues = data;
      })
  }

  addTrace() {
    this.http.post('/api/neo4j/addTrace', {
      key: this.issueControl.value,
      filename: this.selectedClass.filename
    }, {responseType: 'text'}).toPromise()
      .then(async r => {
        await this.getIssuesForClass(this.selectedClass.filename);
        await this.getAvailableIssues();
      });
  }

  getAllClasses() {
    this.http.get('/api/neo4j/classList').subscribe((data: Softwareclass[]) => {
      this.classes = data;
      this.searchClasses = data;
    })
  }

  updateSelectedClass(filename) {
    this.selectedClass = this.classes.filter((item) => item.filename === filename)[0];
    this.selectedClassIssues = this.selectedClass.requirements;
    console.log(this.selectedClass);
  }

  deleteTrace(key) {
    this.http.post('/api/neo4j/deleteTrace', {
      key: key,
      filename: this.selectedClass.filename
    }, {responseType: 'text'}).subscribe();
    this.getIssuesForClass(this.selectedClass.filename);
  }

  del(key) {
    Swal.fire({
      title: 'Do you really want to delete the trace?',
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteTrace(key);
      }
    })
  }


}
