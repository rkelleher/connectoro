const navigationConfig = [
    {
        id: "dashboard",
        title: "Dashboard",
        type: "item",
        icon: "dashboard",
        url: "/dashboard"
    },
    {
        id      : 'inventory',
        title   : 'Inventory',
        type    : 'collapse',
        icon    : 'category',
        children: [
            {
                id: "products",
                title: "Products",
                type: "item",
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
                url: "/orders",
                'exact': true
            }
        ]
    },
    {
        id      : 'settings',
        title   : 'Settings',
        type    : 'collapse',
        icon: "settings",
        children: [
            {
                id: "account-settings",
                title: "Account Settings",
                type: "item",
                url: "/account",
                exact: true
            },
            {
                id: "integrations",
                title: "Integrations",
                type: "item",
                url: "/integrations",
                exact: true
            },
            {
                id: "email settings",
                title: "Email settings",
                type: "item",
                url: "/email-settings",
                exact: true
            }
        ]
    }
];

export default navigationConfig;
