import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.DASHBOARD.TEXT',
        icon: 'ph-house',
        link: '/'
    },
    {
        id: 2,
        label: 'MENUITEMS.APPS.LIST.CLIENTS',
        icon: 'ph-users',
        link: '/apps/client'
    },
    {
        id: 3,
        label: 'MENUITEMS.APPS.LIST.SUBSCRIPTIONS',
        icon: 'ph-credit-card',
        link: '/apps/subscription'
    },
    {
        id: 4,
        label: 'MENUITEMS.APPS.LIST.TICKETS-ADMIN',
        icon: 'ph-ticket',
        link: '/apps/ticket-admin'
    },
    {
        id: 5,
        label: 'MENUITEMS.APPS.LIST.TICKETS_USER',
        icon: 'ph-ticket',
        link: '/apps/ticket-user'
    }
    

]