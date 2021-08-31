import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app component/app.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {OverviewComponent} from './overview/overview.component';
import {MatSliderModule} from "@angular/material/slider";
import {AppRoutingModule} from './app-routing.module';
import {MatListModule} from "@angular/material/list";
import {HttpClientModule} from "@angular/common/http";
import {MatCardModule} from "@angular/material/card";
import {RequirementsComponent} from './requirements/requirements.component';
import {ArchitectureComponent} from './architecture/architecture.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {SweetAlert2Module} from "@sweetalert2/ngx-sweetalert2";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HelpComponent} from './help/help.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {ReviewComponent} from './review/review.component';
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    RequirementsComponent,
    ArchitectureComponent,
    HelpComponent,
    ReviewComponent,
  ],
    imports: [
        HttpClientModule,
        BrowserModule,
        NoopAnimationsModule,
        MatSliderModule,
        AppRoutingModule,
        MatListModule,
        MatCardModule,
        MatSidenavModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        SweetAlert2Module,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatTooltipModule,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
