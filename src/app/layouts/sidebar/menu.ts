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
    }
]