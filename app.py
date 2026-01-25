from flask import Flask, render_template, request, send_file, jsonify
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import io
import os
import logging
import textwrap
import base64

app = Flask(__name__, template_folder='templates')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('thumbnail_generator.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def load_font(size, bold=False, italic=False):
    # Try common Arial variants; gracefully fall back to default
    try:
        if bold and italic:
            path = "arialbi.ttf"
        elif bold:
            path = "arialbd.ttf"
        elif italic:
            path = "ariali.ttf"
        else:
            path = "arial.ttf"
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            f = ImageFont.load_default()
            f.size = size
            return f
        except Exception as e:
            logger.error(f"Font load error: {e}")
            return ImageFont.load_default()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generator')
def generator():
    template_param = request.args.get('template', '')
    mode_param = request.args.get('mode', '')
    return render_template('generator.html', template_param=template_param, mode_param=mode_param)

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/how-it-works')
def how_it_works():
    try:
        return render_template('how-it-works.html')
    except Exception as e:
        logger.error(f"Error rendering how-it-works page: {e}", exc_info=True)
        return f"Error loading page: {str(e)}", 500

@app.route('/generate-thumbnail', methods=['POST'])
def generate_thumbnail():
    """
    Simple mode – server-side render. No client drawImage here, so the earlier
    'broken state' error does not apply to this endpoint.
    """
    try:
        form_data = {
            'title': request.form.get('title', 'Your Title'),
            'subtitle': request.form.get('subtitle', 'Your Subtitle'),
            'title_size': int(request.form.get('title_size', 48)),
            'subtitle_size': int(request.form.get('subtitle_size', 24)),
            'bg_color': request.form.get('bg_color', '#FF0000'),
            'text_color': request.form.get('text_color', '#FFFFFF'),
            'text_styles': [s.strip() for s in request.form.get('text_styles', '').split(',') if s.strip()],
            'shadow_enabled': request.form.get('shadow_enabled') == 'on',
            'shadow_color': request.form.get('shadow_color', '#000000'),
            'shadow_offset_x': int(request.form.get('shadow_offset_x', 2)),
            'shadow_offset_y': int(request.form.get('shadow_offset_y', 2)),
            'bg_type': request.form.get('bg_type', 'color')
        }

        bg_image = request.files.get('bg_image')
        if form_data['bg_type'] == 'image' and bg_image and allowed_file(bg_image.filename):
            try:
                img = Image.open(bg_image.stream).convert("RGB").resize((1280, 720), Image.LANCZOS)
            except Exception as e:
                logger.error(f"Background image error: {e}")
                img = Image.new('RGB', (1280, 720), color=form_data['bg_color'])
        else:
            img = Image.new('RGB', (1280, 720), color=form_data['bg_color'])

        draw = ImageDraw.Draw(img)
        is_bold = 'bold' in form_data['text_styles']
        is_italic = 'italic' in form_data['text_styles']
        has_underline = 'underline' in form_data['text_styles']

        title_font = load_font(form_data['title_size'], is_bold, is_italic)
        subtitle_font = load_font(form_data['subtitle_size'], is_bold, is_italic)

        def draw_centered(text, font, y_center):
            max_width = int(1280 * 0.9)
            size = font.size if hasattr(font, "size") else form_data['title_size']
            tmp_font = font

            def measure(t, f):
                return draw.textlength(t, font=f)

            if measure(text, tmp_font) > max_width:
                while size > 18 and measure(text, tmp_font) > max_width:
                    size -= 2
                    tmp_font = load_font(size, is_bold, is_italic)

            line_w = measure(text, tmp_font)
            x = (1280 - line_w) // 2
            y = int(y_center - (size * 0.6))

            if form_data['shadow_enabled']:
                draw.text(
                    (x + form_data['shadow_offset_x'], y + form_data['shadow_offset_y']),
                    text, font=tmp_font, fill=form_data['shadow_color']
                )

            draw.text(
                (x, y), text, font=tmp_font, fill=form_data['text_color'],
                stroke_width=2 if is_bold else 0, stroke_fill='#000'
            )

            if has_underline:
                underline_y = y + int(size * 1.05)
                draw.line([(x, underline_y), (x + line_w, underline_y)], fill=form_data['text_color'], width=2)

        draw_centered(form_data['title'], title_font, 720 * 0.38)
        draw_centered(form_data['subtitle'], subtitle_font, 720 * 0.60)

        out = io.BytesIO()
        img.save(out, format='PNG', quality=95)
        out.seek(0)
        return send_file(out, mimetype='image/png', as_attachment=True, download_name='youtube-thumbnail.png')

    except Exception as e:
        logger.error(f"Simple generation failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/generate-advanced-thumbnail', methods=['POST'])
def generate_advanced_thumbnail():
    """
    Advanced mode – receives a dataURL image of the composed canvas and returns as a file.
    This ensures the downloaded image matches exactly what's in the preview.
    """
    try:
        canvas_data = request.form.get('canvas_data')
        if not canvas_data or ',' not in canvas_data:
            raise ValueError("Invalid or missing canvas data")

        header, encoded = canvas_data.split(",", 1)
        if "base64" not in header:
            raise ValueError("Canvas data must be base64")

        # Decode and save exactly as received
        image_data = base64.b64decode(encoded)
        img_io = io.BytesIO(image_data)
        img_io.seek(0)
        
        # Verify image dimensions
        with Image.open(img_io) as img:
            if img.size != (1280, 720):
                # If dimensions are wrong, resize to correct
                img = img.resize((1280, 720), Image.LANCZOS)
                output = io.BytesIO()
                img.save(output, format='PNG')
                output.seek(0)
                return send_file(output, mimetype='image/png', as_attachment=True, download_name='youtube-thumbnail-advanced.png')
        
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png', as_attachment=True, download_name='youtube-thumbnail-advanced.png')

    except Exception as e:
        logger.error(f"Advanced generation failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/get-templates', methods=['GET'])
def get_templates():
    templates = [
        {"id": 1, "name": "Red Gradient", "background": "linear-gradient(135deg, #FF0000, #990000)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#FFFFFF"},
        {"id": 2, "name": "Dark Professional", "background": "linear-gradient(135deg, #000000, #333333)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#CCCCCC"},
        {"id": 3, "name": "Bright Yellow", "background": "linear-gradient(135deg, #FFCC00, #FF9900)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#000000", "subtitle_color": "#333333"},
        {"id": 4, "name": "Blue Ocean", "background": "linear-gradient(135deg, #0077b6, #00b4d8)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#EEEEEE"},
        {"id": 5, "name": "Green Nature", "background": "linear-gradient(135deg, #2a9d8f, #e9c46a)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#EEEEEE"},
    ]
    return jsonify(templates)

@app.route('/apply-filter', methods=['POST'])
def apply_filter():
    try:
        image_file = request.files.get('image')
        filter_type = request.form.get('filter_type')
        intensity = float(request.form.get('intensity', 100)) / 100.0

        if image_file and allowed_file(image_file.filename):
            img = Image.open(image_file.stream).convert("RGB")

            if filter_type == 'brightness':
                img = ImageEnhance.Brightness(img).enhance(intensity)
            elif filter_type == 'contrast':
                img = ImageEnhance.Contrast(img).enhance(intensity)
            elif filter_type == 'saturate':
                img = ImageEnhance.Color(img).enhance(intensity)
            elif filter_type == 'sepia':
                w, h = img.size
                px = img.load()
                for y in range(h):
                    for x in range(w):
                        r, g, b = img.getpixel((x, y))
                        tr = int(0.393 * r + 0.769 * g + 0.189 * b)
                        tg = int(0.349 * r + 0.686 * g + 0.168 * b)
                        tb = int(0.272 * r + 0.534 * g + 0.131 * b)
                        px[x, y] = (min(255, tr), min(255, tg), min(255, tb))
            elif filter_type == 'grayscale':
                img = img.convert("L").convert("RGB")

            out = io.BytesIO()
            img.save(out, format='PNG', quality=95)
            out.seek(0)
            return send_file(out, mimetype='image/png')

        return jsonify({'error': 'Invalid image'}), 400
    except Exception as e:
        logger.error(f"Filter error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return "Internal Server Error - Please check the server logs", 500

@app.errorhandler(404)
def not_found_error(error):
    logger.error(f"Page not found: {error}")
    return "Page Not Found", 404

if __name__ == '__main__':
    app.run(debug=True)