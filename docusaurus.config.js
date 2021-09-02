const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
// const qiniuPrefix = require('./qiniu-upload-prefix');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: '卫辰',
    tagline: '努力把兴趣稳定在生活',
    url: 'http://githubci.faithcal.com',
    baseUrl: process.env.NODE_PATH == 'development' ? '/my-website/' : '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'facebook', // Usually your GitHub org/user name.
    projectName: 'docusaurus', // Usually your repo name.
    themeConfig: {
        navbar: {
            title: '卫辰',
            logo: {
                alt: '诗的远方',
                src: 'img/logo.svg',
            },
            items: [
                {
                    type: 'doc',
                    docId: 'intro',
                    position: 'left',
                    label: '文档',
                },
                { to: '/blog', label: '博客', position: 'left' },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: '文档 ',
                    items: [
                        {
                            label: '笔记',
                            to: '/docs/intro',
                        },
                    ],
                },
                {
                    title: '其他',
                    items: [
                        {
                            label: '掘金',
                            href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                        },
                        {
                            label: '语雀',
                            href: 'https://discordapp.com/invite/docusaurus',
                        },
                    ],
                },
                {
                    title: '更多',
                    items: [
                        {
                            label: '个人博客',
                            href: 'https://github.com/facebook/docusaurus',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/facebook/docusaurus',
                        },
                        {
                            label: 'Gitee',
                            href: 'https://twitter.com/docusaurus',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} From chalee.`,
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    // sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/',
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    editUrl: 'https://github.com/facebook/docusaurus/edit/master/website/blog/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
