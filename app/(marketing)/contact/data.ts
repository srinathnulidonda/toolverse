// app/(marketing)/contact/data.ts

export const contactMethods = [
    {
        icon: "ti-mail",
        title: "Email Support",
        description: "Get help from our team",
        value: "hello@toolverse.app",
        href: "mailto:hello@toolverse.app",
        availability: "Response within 24h",
    },
    {
        icon: "ti-brand-github",
        title: "GitHub Issues",
        description: "Report bugs & request features",
        value: "View Repository",
        href: "https://github.com/srinathnulidonda/toolverse/issues",
        availability: "Public discussions",
    },
    {
        icon: "ti-brand-twitter",
        title: "Twitter",
        description: "Latest updates & announcements",
        value: "@toolverse",
        href: "https://twitter.com/toolverse",
        availability: "Daily activity",
    },
];

export const quickLinks = [
    { label: "Documentation", href: "/docs", icon: "ti-book" },
    { label: "Feature Requests", href: "/feedback", icon: "ti-bulb" },
    { label: "Status Page", href: "/status", icon: "ti-activity" },
    { label: "Community", href: "/community", icon: "ti-users" },
];