import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { NativeScriptRouterModule } from "nativescript-angular/router";
import { routes } from './users.routing';
import { SharedModule } from '../shared';

import {
  UserDetailsComponent,
  EditUserComponent,
  LoginComponent,
  PasswordResetModalComponent
} from './';

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    UserDetailsComponent,
    EditUserComponent,
    LoginComponent,
    PasswordResetModalComponent
  ],
  entryComponents: [
    PasswordResetModalComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class UsersModule {}
