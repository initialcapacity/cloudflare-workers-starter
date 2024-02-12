import {html} from "@worker-tools/shed";
import {resetCss} from "../css/resetCss";
import {styleCss} from "../css/styleCss";
import {HTML} from "@worker-tools/html";

export const layoutHtml = (content: HTML): HTML => html`
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Workers Starter</title>
        <style>
            ${resetCss}
            ${styleCss}
        </style>
    </head>
    <body>
    ${content}
    </body>
    </html>
`