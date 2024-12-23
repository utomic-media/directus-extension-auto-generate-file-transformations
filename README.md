# 🐰 Directus extension: Auto generate file transformations
> 💡 Automatically generate your file transformations on file upload. You can select which transformations should be created.

![](https://raw.githubusercontent.com/utomic-media/directus-extension-auto-generate-file-transformations/main/docs/Directus-Extension-Auto-Generate-File-Transformations.png)

## ⚙ Settings
Select one or more of the transformation-preset. The extension will automatically show you all the available system-transformations as well as your own custom transformations. Once you upload or replace a file, the extension will automatically generate all the selected transformations for you. 

![](https://raw.githubusercontent.com/utomic-media/directus-extension-auto-generate-file-transformations/main/docs/screenshots/settings.png)

### CPU- & Memory-consumption
We request the transformations one after another in order to not take to much resources at once. But please still keep in mind that generating all transformations can still be quiet heavy, especially when you upload a lot of image and have a lot of presets selected. We recommend to only select the ones you mostly need.

### Transformation-Presets with 'auto'-format
For transformations using 'auto' format (e.g system-transformations), AVIF versions are generated by this extension. This matches Directus primary format preference (in case avif is supported, directus will prefer avif for auto-formats).

### Deleted Transformation-Presets
Once you delete a custom transformation, it will also be automatically removed from your selection.



## ⚙️ Installation
To install the extension, take a look at the [Official Guide](https://docs.directus.io/extensions/installing-extensions.html).
After installation it will register the required settings-field on the next server-startup.

### Installation via npm

```
npm i directus-extension-auto-generate-file-transformations
```

or

```
pnpm i directus-extension-auto-generate-file-transformations
```


### Installation via marketplace
By default the marketplace won't show this extension as it's not sandboxed.
Unfortunately the current state of sandboxed-extensions is too limited and wouldn't allow this extension to create and read the settings-fields.

However, you can force Directus Marketplace to show all extensions via the MARKETPLACE_TRUST environment variable:
```env
MARKETPLACE_TRUST=all
````

Afterwards this extension can easily be installed through the in-build directus marketplace. Just go to settings -> marketplace and search for auto-generate-file-transformations.



## ❓ FAQ

### Why should I use this extension?

By default directus will only generate the transformations on first reuquest. In some cases it might be useful to generate the versions directly after upload, for example:
- Your website requires transformations and for max performance you don't want to wait with the generation until a visitor requests them
- You upload a lot of files via API and then, when you visit the Directus Webapp, it takes a lot of time to load the images, as all tranformations still needs to be generated
