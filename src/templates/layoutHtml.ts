import {html} from "@worker-tools/shed";
import {HTML} from "@worker-tools/html";

const layout = (content: HTML): HTML => html`
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Workers Starter</title>
        <link rel="stylesheet" href="/static/css/reset.css">
        <link rel="stylesheet" href="/static/css/theme.css">
        <link rel="stylesheet" href="/static/css/typography.css">
        <link rel="stylesheet" href="/static/css/layout.css">
        <link rel="stylesheet" href="/static/css/buttons.css">
        <link rel="stylesheet" href="/static/css/dropdowns.css">

        <link rel="icon" href="/static/favicon.ico" sizes="48x48">
        <link rel="icon" href="/static/favicon.svg" sizes="any" type="image/svg+xml"/>
    </head>
    <body>
    ${content}
    <footer>
        <span>
            <script>document.write("&copy;" + new Date().getFullYear());</script>
            Initial Capacity, Inc.
        </span>
    </footer>
    </body>
    </html>
`

const title: HTML = html`
    <ul>
        <li>
            <svg class="logo">
                <use xlink:href="/static/images/icons.svg#logo"></use>
            </svg>
        </li>
        <li class="heading">
            <h1>Workers Starter</h1>
        </li>
    </ul>
`

export const unauthenticatedLayout = (content: HTML): HTML => layout(html`
    <header>
        ${title}
    </header>
    <main>
        ${content}
    </main>
`)

type UserContext = {
    email: string
    accountName: string,
}

export const authenticatedLayout = (user: UserContext, content: HTML): HTML => layout(html`
    <header>
        ${title}
        <ul>
            <li class="dropdown">
                <a href="#" class="button" aria-haspopup="true">
                    <svg>
                        <use xlink:href="/static/images/icons.svg#account"></use>
                    </svg>

                   ${user.email}
                </a>

                <ul class="menu" aria-label="submenu">
                    <li><a href="#">${user.accountName}</a></li>
                </ul>
            </li>
            <li>
                <a href="/log-out" aria-label="log out">
                    <svg>
                        <use xlink:href="/static/images/icons.svg#log-out"></use>
                    </svg>
                </a>
            </li>
        </ul>
    </header>
    <main>
        ${content}
    </main>
`)
