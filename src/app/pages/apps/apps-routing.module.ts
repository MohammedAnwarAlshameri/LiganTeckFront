import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import{ClientComponent} from './client/client.component';
import{SubscriptionComponent} from './subscription/subscription.component';

const routes: Routes = [
    {
        path: "client",
        component: ClientComponent
    },
    {
        path: "subscription",
        component: SubscriptionComponent
    },
   
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppsRoutingModule { }
