import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {OverviewComponent} from "./overview/overview.component";
import {ArchitectureComponent} from "./architecture/architecture.component";
import {RequirementsComponent} from "./requirements/requirements.component";
import {HelpComponent} from "./help/help.component";
import {ReviewComponent} from "./review/review.component";


const routes: Routes = [
  { path: 'overview', component: OverviewComponent },
  { path: '',  redirectTo: '/overview', pathMatch: 'full'},
  { path: 'architecture', component: ArchitectureComponent},
  { path: 'requirements', component: RequirementsComponent},
  { path: 'help', component: HelpComponent},
  { path: 'review', component: ReviewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
