# Bainsla Music - Admin Panel

PHP-based admin panel for managing the Bainsla Music website content.

## Login Credentials

- **URL:** https://bainslamusic.com/admin/
- **Username:** `admin`
- **Password:** `Bainsla@2024`

## Features

- **Hero Slides** - Add/Edit/Delete hero slideshow videos
- **Videos** - Manage trending videos (YouTube links)
- **Services** - Add/Edit/Delete services
- **Partner Channels** - Manage YouTube channel list
- **Directors** - Manage team members
- **Testimonials** - Manage artist reviews
- **Stats** - Update website statistics (Years, Videos, Artists, Views)
- **Settings** - Update company info, phone, email, address, social links

## Folder Structure

```
admin-panel/
├── admin/          # Admin panel UI
│   ├── index.html  # Admin dashboard
│   ├── admin.css   # Styles
│   └── admin.js    # Admin logic
├── api/            # PHP API endpoints
│   ├── config.php  # Configuration & auth
│   ├── login.php   # Login/session check
│   ├── logout.php  # Logout
│   ├── data.php    # CRUD operations
│   └── frontend-data.php  # Public data endpoint
├── data/           # Data storage
│   └── content.json  # Website content
├── dynamic-loader.js  # Frontend content loader
└── README.md
```

## Deployment to Hostinger

Upload the following to `public_html/`:
```
public_html/
├── admin/       ← from admin-panel/admin/
├── api/         ← from admin-panel/api/
├── data/        ← from admin-panel/data/
├── dynamic-loader.js  ← from admin-panel/
├── index.html   ← (existing website)
├── _next/       ← (existing assets)
└── favicon.ico  ← (existing)
```

Make sure `data/` folder has write permissions (chmod 755 or 775).

## Changing Admin Password

Edit `api/config.php` and change:
```php
define('ADMIN_PASSWORD', 'YourNewPassword');
```
