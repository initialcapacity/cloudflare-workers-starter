import {html} from "hono/html";

export const indexHtml = html`
    <section>
        <h1>Welcome</h1>
        <p>
            <a class="button" href="/dashboard">log in</a>
        </p>
    </section>
`
