import {html} from "hono/html";

export const dashboardHtml = (email: string) => html`
    <section>
        <h1>Dashboard</h1>
        <p>Welcome, ${email}!</p>
    </section>
`
