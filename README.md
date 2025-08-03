# ExtensionKit.io Starter Template

Template last updated: January 30, 2023

## Overview

This template comes ready with Manifest V3 support.

## Developing with the template

1. Navigate to `chrome://extensions` in your browser
2. Ensure `Developer mode` is `enabled` (top right)
3. Click `Load unpacked` in the top left
4. Select the folder for this extension template only

After completing the above steps, you should see the developer, unpacked version appear in your extension list as well as the extension icon appear in your browser bar alongside the other extensions you may have installed.

### Styling

There are temporary styles in `css/index.css`. This can be used or you can remove it and add your own entirely. Styles work like they would with any HTML page; you import the stylesheet in `index.html`. You can also add more stylesheets should you need them.

#### JavaScript

There is no JS included with this template by default, but you could easily add some and reference it in `index.html` with a regular `<script>` tag if you require it.

### Manifest

The manifest file is located in the root of the project in `manifest.json` and controls how the extension should behave.

### Extension icons

All extension icons live in the `/icons` folder in the root of the project. Any additional icon sizes you add in here can be referenced relative to an `icons` folder in the manifest like the following:

```json
"icons": {
  "128": "icons/icon.png"
},
```

## Preparing to publish

To prepare this template for publishing, add all the contents of this folder to a `.zip` file, including the `manifest.json`. Keep in mind, with every new publish of the same extension, you will need to bump the manifest `version` number up.

## Manifest explained

The key sections of the manifest with this template are:

### Browser Action

```
  "action": {
    "default_icon": {
      "32": "icons/icon.png"
    },
    "default_popup": "index.html",
    "default_title": "Open Popup"
  }
```

This portion of the manifest is used to define how the browser action (extension icon) should behave. In this case, when clicked it will trigger a default popup displaying the page `index.html`.

### Custom Commands

```
  "commands": {
    "_execute_browser_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+O",
        "mac": "MacCtrl+Shift+O"
      },
      "description": "Toggle Popup"
    }
  }
```

This portion of the manifest defines custom commands that execute the browser action mentioned above. For example, it defines `Ctrl+Shift+O` as the command that will trigger the browser action (showing the popup). This can be changed, but keep in mind, commands may conflict with other keyboard shortcuts (For example, if you set the command to `Ctrl+S`).

## Need additional help?

Check out the FAQs and documentation on the dashboard for additional help. If you're still having difficulties, please create a ticket.
