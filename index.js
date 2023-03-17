const {
  ul,
  li,
  a,
  span,
  hr,
  div,
  text,
  i,
  h6,
  h1,
  p,
  header,
  footer,
  mkTag,
  nav,
  aside,
} = require("@saltcorn/markup/tags");
const renderLayout = require("@saltcorn/markup/layout");
const db = require("@saltcorn/data/db");

const subItem = (currentUrl) => (item) =>
  li(
    { class: "nav-item" },
    item.link
      ? a(
          {
            class: ["nav-link", active(currentUrl, item) && "active"],
            href: text(item.link),
          },
          i({ class: "far fa-circle nav-icon" }),
          p(item.label)
        )
      : h6({ class: "collapse-header" }, item.label)
  );

const active = (currentUrl, item) =>
  (item.link && currentUrl.startsWith(item.link)) ||
  (item.subitems &&
    item.subitems.some((si) => si.link && currentUrl.startsWith(si.link)));

const sideBarItem = (currentUrl) => (item) => {
  const is_active = active(currentUrl, item);
  return li(
    {
      class: [
        "nav-item",
        item.subitems && "has-treeview",
        item.subitems && is_active && "menu-open",
      ],
    },
    item.link
      ? a(
          { class: ["nav-link", is_active && "active"], href: text(item.link) },
          p(text(item.label))
        )
      : item.subitems
      ? [
          a(
            {
              class: ["nav-link", is_active && "active"],
              href: "javascript:;",
            },
            //i({ class: "fas fa-fw fa-wrench" }),
            p(text(item.label), i({ class: "right fas fa-angle-left" }))
          ),
          ul(
            {
              class: ["nav nav-treeview"],
            },
            item.subitems.map(subItem(currentUrl))
          ),
        ]
      : span({ class: "nav-link" }, text(item.label))
  );
};

const sideBarSection = (currentUrl) => (section) =>
  [
    section.section &&
      section.section !== "Menu" &&
      li({ class: "nav-header" }, section.section),
    section.items.map(sideBarItem(currentUrl)).join(""),
  ];

const sidebar = (brand, sections, currentUrl) =>
  aside(
    { class: "main-sidebar sidebar-bg-dark sidebar-color-primary shadow" },
    div(
      { class: "brand-container" },
      a(
        {
          class: "brand-link",
          href: "/",
        },
        //div({class:"sidebar-brand-icon rotate-n-15"},
        //i({class:"fas fa-laugh-wink"})),
        span({ class: "brand-text font-weight-light" }, brand.name)
      )
    ),
    div(
      { class: "sidebar" },
      nav(
        { class: "mt-2" },
        ul(
          {
            class: "nav nav-pills nav-sidebar flex-column",
            "data-lte-toggle": "treeview",
            role: "menu",
            "data-accordion": "false",
            id: "accordionSidebar",
          },
          sections.map(sideBarSection(currentUrl))
        )
      )
    )
  );

const blockDispatch = {
  pageHeader: ({ title, blurb }) =>
    div(
      h1({ class: "h3 mb-0 mt-2 text-gray-800" }, title),
      blurb && p({ class: "mb-0 text-gray-800" }, blurb)
    ),
  footer: ({ contents }) =>
    div(
      { class: "container" },
      footer(
        { id: "footer" },
        div({ class: "row" }, div({ class: "col-sm-12" }, contents))
      )
    ),
  hero: ({ caption, blurb }) =>
    header(
      { class: "masthead" },
      div(
        { class: "container h-100" },
        div(
          {
            class:
              "row h-100 align-items-center justify-content-center text-center",
          },
          div(
            { class: "col-lg-10 align-self-end" },
            h1({ class: "text-uppercase font-weight-bold" }, caption),
            hr({ class: "divider my-4" })
          ),
          div(
            { class: "col-lg-8 align-self-baseline" },
            p({ class: "font-weight-light mb-5" }, blurb)
            /*a(
              {
                class: "btn btn-primary btn-xl",
                href: "#about"
              },
              "Find Out More"
            )*/
          )
        )
      )
    ),
};
const renderBody = (title, body) =>
  renderLayout({
    blockDispatch,
    layout:
      typeof body === "string" ? { type: "card", title, contents: body } : body,
  });

//const safeSlash = () => (isNode ? "/" : "");
const servePrefix = `/plugins/public/adminlte@${
  require("./package.json").version
}`;

const wrap = ({
  title,
  menu,
  brand,
  alerts,
  currentUrl,
  body,
  headers,
  role,
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="${servePrefix}/overlayscrollbars.min.css">
    <link rel="stylesheet" href="${servePrefix}/fontawesome/fontawesome.min.css">
    <link href="${servePrefix}/adminlte.min.css" rel="stylesheet">
    ${headers
      .filter((h) => h.css)
      .map((h) => `<link href="${h.css}" rel="stylesheet">`)
      .join("")}
    ${headers
      .filter((h) => h.headerTag)
      .map((h) => h.headerTag)
      .join("")}
    <title>${text(title)}</title>
  </head>
  <body id="page-top" class="layout-fixed">
    <div id="wrapper">
      ${sidebar(brand, menu, currentUrl)}

      <main class="content-wrapper">
        <div id="content">
          <div id="page-inner-content" class="container-fluid px-2">
            <div id="alerts-area">
              ${alerts.map((a) => alert(a.type, a.msg)).join("")}
            </div>
            <div >
              ${renderBody(title, body, role)}
            <div>
          </div>
        </div>
      </main>
    </div>
    <script src="/static_assets/${
      db.connectObj.version_tag
    }/jquery-3.6.0.min.js"></script>
    <script src="${servePrefix}/overlayscrollbars.browser.es6.min.js"></script>
    <script src="${servePrefix}/popper.min.js"></script>
    <script src="${servePrefix}/bootstrap.min.js"></script>
    <script src="${servePrefix}/adminlte.min.js"></script>
    ${headers
      .filter((h) => h.script)
      .map(
        (h) =>
          `<script src="${h.script}" ${
            h.integrity
              ? `integrity="${h.integrity}" crossorigin="anonymous"`
              : ""
          }></script>`
      )
      .join("")}
  </body>
</html>`;

const alert = (type, s) => {
  //console.log("alert", type, s,s.length)
  const realtype = type === "error" ? "danger" : type;
  return s && s.length > 0
    ? `<div class="alert alert-${realtype} alert-dismissible fade show" role="alert">
  ${text(s)}
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>`
    : "";
};

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "adminlte",
  layout: { wrap },
};
