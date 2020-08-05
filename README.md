# Quinn's TinyApp!

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of a user's index of shortened URLs"](https://raw.githubusercontent.com/quinnvoker/tinyApp/master/docs/url_index.png)
!["Screenshot of individual URL view and edit page"](https://raw.githubusercontent.com/quinnvoker/tinyApp/master/docs/url_edit.png)

## Features
- Redirects short URLs to full URLs
- Editing short URLs' destinations
- User Account Management
  - Each user owns and maintains their own list of URLs
  - Only a short URL's creator can edit/remove it
- Analytics for link owners
  - Total Visits per URL
  - Unique Visits per URL
  - Visit log per URL with timestamps and visitor id

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
