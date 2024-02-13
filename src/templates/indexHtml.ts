import {HTML} from "@worker-tools/html";
import {html} from "@worker-tools/shed";

export const indexHtml: HTML = html`
    <section>
        <h1>Welcome</h1>
        <p>
            <a class="button" href="/dashboard">log in</a>
        </p>
    </section>
`
