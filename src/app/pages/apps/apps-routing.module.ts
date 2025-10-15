import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import{ClientComponent} from './client/client.component';

const routes: Routes = [
    {
        path: "client",
        component: ClientComponent
    },
   
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppsRoutingModule { }
