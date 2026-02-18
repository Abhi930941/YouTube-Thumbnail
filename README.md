# YouTube ThumbnailPro - Professional Thumbnail Generator

A web-based tool that enables content creators to design professional YouTube thumbnails without requiring graphic design software or skills. Built to solve the common pain point of creating eye-catching thumbnails quickly and efficiently.

## Overview

**Project Type:** Full Stack Web Application

**Problem Statement:** YouTube creators need eye-catching thumbnails to increase video CTR, but professional design tools are expensive and have a steep learning curve. Most creators lack design skills yet thumbnails directly impact video performance.

**Solution:** ThumbnailPro provides a free, browser-based tool with dual editing modes (simple form-based & advanced canvas-based), pre-designed templates, and instant downloads in YouTube's recommended format (1280x720 PNG).

---

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript 
- Google Fonts (Inter, Poppins)
- Font Awesome 6.4.0 for icons

**Backend:**
- Python 3.8+
- Flask (Web Framework)
- Pillow (PIL) for image processing

---

## Key Features

- **Dual Mode Interface:** Simple mode for quick creation, Advanced mode for pixel-perfect control
- **Live Preview:** Real-time thumbnail visualization with instant updates
- **Text Customization:** Adjustable font sizes (24-96px), styles (bold, italic, underline), colors, and positioning
- **Visual Effects:** Text shadows with customizable offset and color, gradient backgrounds
- **Image Processing:** Background image upload with filters (brightness, contrast, sepia, grayscale, saturation)
- **Standard Output:** 1280x720px PNG files (YouTube recommended aspect ratio: 16:9)

---

## System Architecture
```
      User Interface (Browser)
               ↓
      HTML/CSS/JS Frontend (Forms + Canvas)
               ↓
          HTTP Request
               ↓
      Flask Backend (Python)
               ↓
      Pillow Image Processing
          ↙           ↘
  Simple Mode    Advanced Mode
  (Server Render) (Canvas to Base64)
         ↓             ↓
      PNG Generation ← Merged
               ↓
      File Download (BytesIO)
               ↓
      User Downloads Thumbnail
  ```

**Flow:**

**Simple Mode:**
1. User enters text, selects colors/styles
2. Form submits to `/generate-thumbnail` endpoint
3. Flask processes form data
4. Pillow creates 1280x720 canvas
5. Background applied (color or image)
6. Text rendered with fonts and effects
7. PNG saved to BytesIO
8. File sent as downloadable response

**Advanced Mode:**
1. User edits directly on canvas preview
2. JavaScript draws in real-time
3. User clicks download
4. Canvas converts to Base64 PNG
5. Sent to `/generate-advanced-thumbnail`
6. Flask decodes and validates
7. Returns as downloadable PNG

---

## Project Structure
```
youtube-thumbnail-generator/
├── templates/
│   ├── base.html              # Base template with navbar/footer
│   ├── index.html             # Landing page
│   ├── generator.html         # Main thumbnail editor
│   ├── features.html          # Features showcase
│   └── how-it-works.html      # Tutorial page
├── static/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   └── script.js          # Frontend logic (1698 lines)
│   └── uploads/               # Temporary file storage
├── app.py                      # Flask backend server
├── requirements.txt            # Python dependencies
└── README.md                   # Documentation
```

---

## Demo & Links

**Live Demo:** https://youtube-thumbnail.onrender.com/

**GitHub Repository:** https://github.com/Abhi930941/YouTube-Thumbnail

**Screenshots:**
<table>
  <tr>
    <td><img src="Screenshot 2026-02-16 003327.png" alt="Home Page" /></td>
    <td><img src="Screenshot 2026-02-16 003443.png" alt="Simple Mode Editor" /></td>
    <td><img src="Screenshot 2026-02-16 003928.png" alt="Advanced Canvas Editor" /></td>
  </tr>
  <tr>
    <td align="center"><b>Home Page</b></td>
    <td align="center"><b>Simple Mode</b></td>
    <td align="center"><b>Advanced Mode</b></td>
  </tr>
</table>

---

## Why This Project Matters

**Problem Solved:**
This project matters because it helps YouTube creators design professional thumbnails quickly and easily without needing expensive software or graphic design skills.

---

## Usage Examples

**Simple Mode - Quick Thumbnail:**

1. Enter title and Enter subtitle
2. Choose background
3. Select any text colour, style
4. Enable shadow
5. Click "Generate & Download"

**Advanced Mode - Custom Design:**

1. Click "Switch to Advanced Mode" and select any Template 
2. Upload background image
3. Apply brightness filter (120%)
4. Drag title to any position
5. Change font size, style etc
6. Add shadow (offset)
7. Click download

**Template Quick Start:**

1. Scroll to template gallery
2. Click "Use This Template" 
3. Replace default text
4. Download immediately

---

## Contact

**Developer:** Abhishek Sahani

**LinkedIn:** [linkedin.com/in/abhishek-sahani-447851341](https://www.linkedin.com/in/abhishek-sahani-447851341)

**Portfolio:** [abhi930941.github.io/Portfolio](https://abhi930941.github.io/Portfolio/)

**Email:** abhishek242443@gmail.com

---
