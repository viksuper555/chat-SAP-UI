import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from "./authorization/auth.component";
import {ChatComponent} from "./chat/chat.component";
import {BrowserModule} from "@angular/platform-browser";

const routes: Routes = [
  { path: 'auth', title:'Login to messenger', component: AuthComponent },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'chat', title:'Messenger', component: ChatComponent },
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
