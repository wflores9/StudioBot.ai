# Logo Integration Guide

## Logo Files Needed

You provided two logo versions:
1. **Full Logo** - With "StudioBot" text
2. **Icon Only** - Just the bot icon

## Where to Save Logo Files

Save your logo files to the `client/public` directory:

```
client/public/
  ├── logo.png          ← Full logo (used when sidebar is open)
  ├── logo-icon.png     ← Icon only (used when sidebar is collapsed)
  └── vite.svg
```

### Steps to Add Your Logo

1. **Save the full logo:**
   - Save as: `client/public/logo.png`
   - Recommended size: 200-300px width, transparent background

2. **Save the icon:**
   - Save as: `client/public/logo-icon.png`
   - Recommended size: 64x64px or 128x128px square

3. **Restart the dev server** (if running):
   ```bash
   # Stop with Ctrl+C, then restart
   cd client
   npm run dev
   ```

## How It Works

The Layout component (`client/src/components/Layout.tsx`) now supports:

- **Image logo** with automatic fallback to text if image fails to load
- **Responsive sizing** - logo scales when sidebar collapses
- **CSS styling** in `Layout.css` handles the logo display

### Current Implementation

```typescript
<div className="logo">
  <img
    src="/logo.png"
    alt="StudioBot.ai"
    className="logo-image"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
      e.currentTarget.nextElementSibling!.style.display = 'block';
    }}
  />
  <span className="logo-text" style={{ display: 'none' }}>
    🎬 StudioBot.ai
  </span>
</div>
```

## CSS Styling

The logo CSS has been updated to:
- Display logo image at 36px height when sidebar is open
- Scale to 32px when sidebar is collapsed
- Hide text when sidebar is closed
- Maintain aspect ratio with `object-fit: contain`

## Testing

After adding your logo files:

1. **Open the app:** http://localhost:5173
2. **Check the logo appears** in the sidebar
3. **Test collapse:** Click the toggle button - logo should resize
4. **Test fallback:** Rename logo.png temporarily to see text fallback

## Next Steps

Once logo is integrated:
- [ ] Add favicon (`client/public/favicon.ico`)
- [ ] Update page title in `client/index.html`
- [ ] Complete mock implementations
- [ ] Prepare for production deployment
