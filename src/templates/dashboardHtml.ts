import {html} from "@worker-tools/shed";
import {HTML} from "@worker-tools/html";

export const dashboardHtml = (email: string): HTML => html`
    <section>
        <h1>Workers Starter</h1>
        <p>Welcome, ${email}!</p>
    </section>
`
