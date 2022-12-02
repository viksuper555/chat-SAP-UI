import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { AuthComponent } from './authorization/auth.component';
import { ChatComponent } from './chat/chat.component'
import {AppComponent} from "./app.component";
import {MatCardModule} from "@angular/material/card";
import {MaterialModule} from "./material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DataService} from "./data.service";

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatCardModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [DatePipe, DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
