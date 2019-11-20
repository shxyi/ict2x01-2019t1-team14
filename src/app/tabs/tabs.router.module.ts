import { RouterModule, Routes } from '@angular/router'; /* import Routes to link to app-routing.module.ts */
import { NgModule } from '@angular/core' /* for @NgModule */
import { TabsPage } from './tabs.page'; /* tab page */

const routes: Routes = [{
    path: '', /* default */
    component: TabsPage, 
    children: [
        { path: '', redirectTo: 'leaderboard', pathMatch: 'full' },
        { path: 'direction', loadChildren: '../direction/direction.module#DirectionPageModule' },
        { path: 'leaderboard', loadChildren: '../leaderboard/leaderboard.module#LeaderboardPageModule' },
        { path: 'profile', loadChildren: '../profile/profile.module#ProfilePageModule' },
    ]}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TabsRoutingModule { }