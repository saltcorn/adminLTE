//imports
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
  img,
  footer,
  mkTag,
  nav,
  aside,
} = require("@saltcorn/markup/tags");
const renderLayout = require("@saltcorn/markup/layout");
const db = require("@saltcorn/data/db");
const {
  headersInHead,
  headersInBody,
  toast,
} = require("@saltcorn/markup/layout_utils");

// http url prefix for serving static assets from public/
const servePrefix = `/plugins/public/adminlte@${
  require("./package.json").version
}`;
const { renderForm, link } = require("@saltcorn/markup");

// This is the core function for Saltcorn layout. It takes as argument an object with
// the specification for the page and must return a string with the full rendered page.
const wrap = ({
  title,
  menu,
  brand,
  alerts,
  currentUrl,
  body,
  headers,
  role,
  req,
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="${servePrefix}/overlayscrollbars.min.css">
    <link rel="stylesheet" href="${servePrefix}/fontawesome/fontawesome.min.css">
    <link href="${servePrefix}/adminlte.min.css" rel="stylesheet">
    ${headersInHead(headers)}
    <title>${text(title)}</title>
  </head>
  <body id="page-top" class="sidebar-mini layout-fixed" style="height: auto;">
    <div id="wrapper">
      ${sidebar(brand, menu, currentUrl)}

      <main class="content-wrapper">
        <section id="content">
          <div id="page-inner-content" class="container-fluid">
            <div id="alerts-area">
              ${toast ? "" : alerts.map((a) => alert(a.type, a.msg)).join("")}
            </div>
            <div >
              ${renderBody(title, body, role, req)}
            <div>
          </div>
        </div>
      </main>
      ${
        toast
          ? `
      <div 
        id="toasts-area"
        class="toast-container position-fixed top-0 start-50 p-0"
        style: "z-index: 999;"
        aria-live="polite" 
        aria-atomic="true"
      >
        ${alerts.map((a) => toast(a.type, a.msg)).join("")}
      </div>
      `
          : ""
      }
    </div>
    <script src="/static_assets/${
      db.connectObj.version_tag
    }/jquery-3.6.0.min.js"></script>
    <script src="${servePrefix}/bootstrap.bundle.min.js"></script>
    <script src="${servePrefix}/adminlte.min.js"></script>
    ${headersInBody(headers)}
    <script>
    function update_theme_notification_count(n) {
    $("a.notify-menu-item").html(
      '<i class="nav-icon fas fa-bell"></i><p>Notifications ('+n+')</p>');
    $(".admlte-user-navbar>a.nav-link").html(
      '<i class="nav-icon fas fa-user"></i><p>User ('+n+')<i class="end fas fa-angle-left"></i></p>');
    }
    </script>

  </body>
</html>`;

const formModify = (form) => {
  form.formStyle = "vert";
  form.submitButtonClass = "btn-primary btn-user btn-block";
  return form;
};

const renderAuthLinks = (authLinks) => {
  var links = [];
  if (authLinks.login)
    links.push(link(authLinks.login, "Already have an account? Login!"));
  if (authLinks.forgot) links.push(link(authLinks.forgot, "Forgot password?"));
  if (authLinks.signup)
    links.push(link(authLinks.signup, "Create an account!"));
  const meth_links = (authLinks.methods || [])
    .map(({ url, icon, label }) =>
      a(
        { href: url, class: "btn btn-secondary btn-user btn-block" },
        icon || "",
        `&nbsp;Login with ${label}`
      )
    )
    .join("");

  return (
    meth_links + links.map((l) => div({ class: "text-center" }, l)).join("")
  );
};

const authBrand = ({ name, logo }) =>
  logo
    ? `<img class="mb-4" src="${logo}" alt="Logo" width="72" height="72">`
    : `<h2>${name}</h2>`;

const authWrap = ({
  title,
  alerts, //TODO
  form,
  afterForm,
  headers,
  brand,
  csrfToken,
  authLinks,
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="${servePrefix}/overlayscrollbars.min.css">
    <link rel="stylesheet" href="${servePrefix}/fontawesome/fontawesome.min.css">
    <link href="${servePrefix}/adminlte.min.css" rel="stylesheet">
    ${headersInHead(headers)}
    <title>${text(title)}</title>
  </head>
  <body id="page-top" class="hold-transition login-page">
    <div class="login-box">
      ${alerts.map((a) => alert(a.type, a.msg)).join("")}
      <div class="card card-outline card-primary">
      <div class="card-header text-center">
        ${authBrand(brand)}
      </div>
        <div class="card-body login-card-body">
          <p class="login-box-msg">${title}</p>
          ${renderForm(formModify(form), csrfToken)}
          ${renderAuthLinks(authLinks)}
          ${afterForm}
        </div>
      </div>
    </div>
    <script src="/static_assets/${
      db.connectObj.version_tag
    }/jquery-3.6.0.min.js"></script>
    <script src="${servePrefix}/bootstrap.bundle.min.js"></script>
    <script src="${servePrefix}/adminlte.min.js"></script>
    ${headersInBody(headers)}
    <script>
    function update_theme_notification_count(n) {
    $("a.notify-menu-item").html(
      '<i class="nav-icon fas fa-bell"></i><p>Notifications ('+n+')</p>');
    $(".admlte-user-navbar>a.nav-link").html(
      '<i class="nav-icon fas fa-user"></i><p>User ('+n+')<i class="end fas fa-angle-left"></i></p>');
    }
    </script>

  </body>
</html>`;

// render the body by calling back to Saltcorn's renderLayout, supplying the
// custom blockDispatch, which specifies how certain layout elements should be rendered
const renderBody = (title, body, role, req) =>
  renderLayout({
    blockDispatch,
    role,
    req,
    layout:
      typeof body === "string" ? { type: "card", title, contents: body } : body,
  });

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

//render the sidebar with menu and brand. Note yhis is not exported and is not part of any
// official API, these functions are just called by `wrap`
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
        brand.logo &&
          img({
            src: brand.logo,
            width: "30",
            height: "30",
            class: "brand-image opacity-75 shadow",
            alt: "Logo",
            loading: "lazy",
          }),
        span({ class: "brand-text font-weight-light" }, brand.name)
      ),
      a(
        {
          class: "pushmenu mx-1",
          "data-lte-toggle": "sidebar-mini",
          href: "javascript:;",
          role: "button",
        },
        i({ class: "fas fa-angle-double-left" })
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

const sideBarSection = (currentUrl) => (section) =>
  section.items.map(sideBarItem(currentUrl)).join("");

const sideBarItem = (currentUrl) => (item) => {
  const is_active = active(currentUrl, item);
  return li(
    {
      class: [
        "nav-item",
        item.subitems && is_active && "menu-open",
        item.isUser && "admlte-user-navbar",
      ],
    },
    item.link
      ? a(
          {
            class: ["nav-link", is_active && "active"],
            href: text(item.link),
            target: item.target_blank ? "_blank" : undefined,
          },
          item.icon ? i({ class: `nav-icon ${item.icon}` }) : "",

          p(text(item.label))
        )
      : item.subitems
      ? [
          a(
            {
              class: ["nav-link", is_active && "active"],
              href: "javascript:;",
            },
            item.icon ? i({ class: `nav-icon ${item.icon}` }) : "",
            p(text(item.label), i({ class: "end fas fa-angle-left" }))
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

const subItem = (currentUrl) => (item) =>
  li(
    { class: "nav-item" },
    item.link
      ? a(
          {
            class: [
              "nav-link",
              active(currentUrl, item) && "active",
              item.class,
            ],
            target: item.target_blank ? "_blank" : undefined,
            href: text(item.link),
          },
          item.icon
            ? i({ class: `nav-icon ${item.icon}` })
            : i({ class: "far fa-circle nav-icon" }),
          p(item.label)
        )
      : a(
          {
            class: ["nav-link"],
            href: "javascript:;",
          },
          item.label
        )
  );

// Helper function to figure out if a menu item is active.
const active = (currentUrl, item) =>
  (item.link && currentUrl.startsWith(item.link)) ||
  (item.subitems &&
    item.subitems.some((si) => si.link && currentUrl.startsWith(si.link)));

// render an alert
const alert = (type, s) => {
  //console.log("alert", type, s,s.length)
  const realtype = type === "error" ? "danger" : type;
  return s && s.length > 0
    ? `<div class="alert alert-${realtype} alert-dismissible fade show" role="alert">
  ${text(s)}
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>`
    : "";
};

const exportRenderBody = ({ title, body, alerts, role, req }) =>
  `<div id="alerts-area">
    ${toast ? "" : alerts.map((a) => alert(a.type, a.msg)).join("")}
  </div>
  <div >
    ${renderBody(title, body, role, req)}
    ${
      toast
        ? `
    <div 
      id="toasts-area"
      class="toast-container position-fixed top-0 start-50 p-0"
      style: "z-index: 999;"
      aria-live="polite" 
      aria-atomic="true"
    >
      ${alerts.map((a) => toast(a.type, a.msg)).join("")}
    </div>
    `
        : ""
    }
  <div>`;

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "adminlte",
  layout: { wrap, authWrap, renderBody: exportRenderBody },
};
