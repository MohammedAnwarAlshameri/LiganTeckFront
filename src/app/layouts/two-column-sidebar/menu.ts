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
        label: 'MENUITEMS.APPS.LIST.TICKETS',
        icon: 'ph-ticket',
        link: '/apps/ticket'
    },
    {
        id: 5,
        label: 'MENUITEMS.APPS.LIST.TICKETS_ADMIN',
        icon: 'ph-clipboard-text',
        link: '/apps/ticket-admin'
    },
    {
        id: 6,
        label: 'MENUITEMS.APPS.LIST.TICKETS_USER',
        icon: 'ph-user-circle',
        link: '/apps/ticket-user'
    }
];