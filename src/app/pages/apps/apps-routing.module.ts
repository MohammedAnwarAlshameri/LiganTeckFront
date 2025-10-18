import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component
import{ClientComponent} from './client/client.component';
import{SubscriptionComponent} from './subscription/subscription.component';
import{TicketComponent} from './ticket/ticket.component';
import{TicketAdminComponent} from './ticket-admin/ticket-admin.component';
import{TicketUserComponent} from './ticket-user/ticket-user.component';
import{InvoicesAdminComponent} from './invoices/invoices-admin.component';
import{MyInvoicesComponent} from './invoices/my-invoices.component';
import{SubscriptionsAdminComponent} from './subscriptions/subscriptions-admin.component';
import{MySubscriptionsComponent} from './subscriptions/my-subscriptions.component';

const routes: Routes = [
    {
        path: "client",
        component: ClientComponent
    },
    {
        path: "subscription",
        component: SubscriptionComponent
    },
    {
        path: "ticket",
        component: TicketComponent
    },
    {
        path: "ticket-admin",
        component: TicketAdminComponent
    },
    {
        path: "ticket-user",
        component: TicketUserComponent
    },
    {
        path: "invoices-admin",
        component: InvoicesAdminComponent
    },
    {
        path: "my-invoices",
        component: MyInvoicesComponent
    },
    {
        path: "subscriptions-admin",
        component: SubscriptionsAdminComponent
    },
    {
        path: "my-subscriptions",
        component: MySubscriptionsComponent
    },
   
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppsRoutingModule { }
