import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './register/register.module#RegisterPageModule' },
  /*{ path: 'direction', loadChildren: './direction/direction.module#DirectionPageModule' },*/
  { path: 'feedback', loadChildren: './feedback/feedback.module#FeedbackPageModule' },
  { path: 'conquer', loadChildren: './conquer/conquer.module#ConquerPageModule' },
  { path: 'btn-conquer', loadChildren: './btn-conquer/btn-conquer.module#BtnConquerPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'forgetpw', loadChildren: './forgetpw/forgetpw.module#ForgetpwPageModule' },
  { path: 'edit-profile', loadChildren: './edit-profile/edit-profile.module#EditProfilePageModule' },
  { path: 'shake-dice', loadChildren: './shake-dice/shake-dice.module#ShakeDicePageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
