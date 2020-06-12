const navigationConfig = [
    {
        id: "dashboard",
        title: "Dashboard",
        type: "item",
        icon: "whatshot",
        url: "/dashboard"
    },
    {
        id      : 'inventory',
        title   : 'Inventory',
        type    : 'collapse',
        icon    : 'shopping_cart',
        children: [
            {
                id: "products",
                title: "Products",
                type: "item",
                icon: "whatshot",
                url: "/products",
                'exact': true
            }
        ]
    },
    {
        id      : 'dropshipping',
        title   : 'Dropshipping',
        type    : 'collapse',
        icon    : 'shopping_cart',
        children: [
            {
                id: "orders",
                title: "Orders",
                type: "item",
                icon: "whatshot",
                url: "/orders",
                'exact': true
            }
        ]
    },
    {
        id      : 'settings',
        title   : 'Settings',
        type    : 'collapse',
        icon    : 'shopping_cart',
        children: [
            {
                id: "account-settings",
                title: "Account Settings",
                type: "item",
                icon: "settings",
                url: "/account",
                exact: true
            },
            {
                id: "integrations",
                title: "Integrations",
                type: "item",
                icon: "settings",
                url: "/integrations",
                exact: true
            },
            {
                id: "email settings",
                title: "Email settings",
                type: "item",
                icon: "settings",
                url: "/email-settings",
                exact: true
            }
        ]
    }
];

export default navigationConfig;
