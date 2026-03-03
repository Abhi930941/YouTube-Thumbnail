from flask import Flask, render_template, request, send_file, jsonify, redirect, url_for
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from datetime import datetime
from dotenv import load_dotenv
import io, os, logging, base64, json, time

load_dotenv()

app = Flask(__name__, template_folder='templates')
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
app.secret_key = os.environ.get('SECRET_KEY', 'thumbnailpro-secret-key')

CLERK_PUBLISHABLE_KEY = os.environ.get('CLERK_PUBLISHABLE_KEY', '')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('thumbnail_generator.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ── History ───────────────────────────────────────────────────────
HISTORY_FILE = 'thumbnail_history.json'
THUMBNAILS_DIR = os.path.join('static', 'thumbnails')

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_history(data):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def add_to_history(user_id, entry):
    if not user_id:
        return
    history = load_history()
    if user_id not in history:
        history[user_id] = []
    entry['id'] = str(int(time.time() * 1000))
    entry['created_at'] = datetime.now().strftime('%d %b %Y, %H:%M')
    history[user_id].insert(0, entry)
    history[user_id] = history[user_id][:50]
    save_history(history)

def get_user_history(user_id):
    return load_history().get(user_id, [])

def delete_history_entry(user_id, entry_id):
    history = load_history()
    if user_id in history:
        # Delete thumbnail file if it exists
        entry = next((e for e in history[user_id] if e.get('id') == entry_id), None)
        if entry and entry.get('thumbnail_file'):
            try:
                os.remove(os.path.join(THUMBNAILS_DIR, entry['thumbnail_file']))
            except Exception:
                pass
        history[user_id] = [e for e in history[user_id] if e.get('id') != entry_id]
        save_history(history)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def load_font(size, bold=False, italic=False):
    try:
        if bold and italic:   path = "arialbi.ttf"
        elif bold:            path = "arialbd.ttf"
        elif italic:          path = "ariali.ttf"
        else:                 path = "arial.ttf"
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            f = ImageFont.load_default(); f.size = size; return f
        except Exception as e:
            logger.error(f"Font load error: {e}")
            return ImageFont.load_default()

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('index.html', clerk_pub_key=CLERK_PUBLISHABLE_KEY)

@app.route('/features')
def features():
    return render_template('features.html', clerk_pub_key=CLERK_PUBLISHABLE_KEY)

@app.route('/login')
def login():
    return render_template('login.html', clerk_pub_key=CLERK_PUBLISHABLE_KEY,
                           next=request.args.get('next', '/generator'))

@app.route('/register')
def register():
    return render_template('register.html', clerk_pub_key=CLERK_PUBLISHABLE_KEY)

@app.route('/generator')
def generator():
    return render_template('generator.html',
                           template_param=request.args.get('template', ''),
                           mode_param=request.args.get('mode', ''),
                           clerk_pub_key=CLERK_PUBLISHABLE_KEY)

@app.route('/how-it-works')
def how_it_works():
    try:
        return render_template('how-it-works.html', clerk_pub_key=CLERK_PUBLISHABLE_KEY)
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return f"Error loading page: {str(e)}", 500

@app.route('/history')
def history():
    return render_template('history.html', clerk_pub_key=CLERK_PUBLISHABLE_KEY)

@app.route('/api/history', methods=['GET'])
def api_get_history():
    user_id = request.args.get('user_id', '')
    if not user_id:
        return jsonify([])
    return jsonify(get_user_history(user_id))

@app.route('/api/history/add', methods=['POST'])
def api_add_history():
    data = request.get_json() or {}
    user_id = data.get('user_id', '')
    if not user_id:
        return jsonify({'success': True})

    entry = {
        'title':           data.get('title', 'Untitled'),
        'subtitle':        data.get('subtitle', ''),
        'mode':            data.get('mode', 'simple'),
        'bg_color':        data.get('bg_color', '#FF0000'),
        'text_color':      data.get('text_color', '#FFFFFF'),
        # Simple mode settings
        'title_size':      data.get('title_size', 48),
        'subtitle_size':   data.get('subtitle_size', 24),
        'text_styles':     data.get('text_styles', ''),
        'shadow_enabled':  data.get('shadow_enabled', False),
        'shadow_color':    data.get('shadow_color', '#000000'),
        'shadow_offset_x': data.get('shadow_offset_x', 2),
        'shadow_offset_y': data.get('shadow_offset_y', 2),
        'bg_type':         data.get('bg_type', 'color'),
        'bg_image_data':   data.get('bg_image_data', None),
        # Advanced mode canvas state
        'canvas_state':    data.get('canvas_state', None),
    }

    # Save thumbnail PNG to static/thumbnails/
    thumbnail_b64 = data.get('thumbnail_b64', '')
    if thumbnail_b64 and ',' in thumbnail_b64:
        try:
            _, encoded = thumbnail_b64.split(',', 1)
            img_data = base64.b64decode(encoded)
            os.makedirs(THUMBNAILS_DIR, exist_ok=True)
            filename = f"thumb_{int(time.time()*1000)}.png"
            with open(os.path.join(THUMBNAILS_DIR, filename), 'wb') as f:
                f.write(img_data)
            entry['thumbnail_file'] = filename
        except Exception as e:
            logger.error(f"Thumbnail save error: {e}")

    add_to_history(user_id, entry)
    return jsonify({'success': True})

@app.route('/api/history/<entry_id>', methods=['DELETE'])
def api_delete_history(entry_id):
    user_id = (request.get_json() or {}).get('user_id', '')
    if user_id:
        delete_history_entry(user_id, entry_id)
    return jsonify({'success': True})

@app.route('/api/history/clear', methods=['DELETE'])
def api_clear_history():
    user_id = (request.get_json() or {}).get('user_id', '')
    if user_id:
        history = load_history()
        # Delete all thumbnail files for this user
        for entry in history.get(user_id, []):
            if entry.get('thumbnail_file'):
                try:
                    os.remove(os.path.join(THUMBNAILS_DIR, entry['thumbnail_file']))
                except Exception:
                    pass
        history[user_id] = []
        save_history(history)
    return jsonify({'success': True})

@app.route('/generate-thumbnail', methods=['POST'])
def generate_thumbnail():
    try:
        form_data = {
            'title':           request.form.get('title', 'Your Title'),
            'subtitle':        request.form.get('subtitle', 'Your Subtitle'),
            'title_size':      int(request.form.get('title_size', 48)),
            'subtitle_size':   int(request.form.get('subtitle_size', 24)),
            'bg_color':        request.form.get('bg_color', '#FF0000'),
            'text_color':      request.form.get('text_color', '#FFFFFF'),
            'text_styles':     [s.strip() for s in request.form.get('text_styles', '').split(',') if s.strip()],
            'shadow_enabled':  request.form.get('shadow_enabled') == 'on',
            'shadow_color':    request.form.get('shadow_color', '#000000'),
            'shadow_offset_x': int(request.form.get('shadow_offset_x', 2)),
            'shadow_offset_y': int(request.form.get('shadow_offset_y', 2)),
            'bg_type':         request.form.get('bg_type', 'color')
        }

        bg_image = request.files.get('bg_image')
        if form_data['bg_type'] == 'image' and bg_image and allowed_file(bg_image.filename):
            try:
                img = Image.open(bg_image.stream).convert("RGB").resize((1280, 720), Image.LANCZOS)
            except Exception as e:
                logger.error(f"BG image error: {e}")
                img = Image.new('RGB', (1280, 720), color=form_data['bg_color'])
        else:
            img = Image.new('RGB', (1280, 720), color=form_data['bg_color'])

        draw = ImageDraw.Draw(img)
        is_bold      = 'bold'      in form_data['text_styles']
        is_italic    = 'italic'    in form_data['text_styles']
        has_underline= 'underline' in form_data['text_styles']

        title_font    = load_font(form_data['title_size'], is_bold, is_italic)
        subtitle_font = load_font(form_data['subtitle_size'], is_bold, is_italic)

        def draw_centered(text, font, y_center):
            max_width = int(1280 * 0.9)
            size      = font.size if hasattr(font, "size") else form_data['title_size']
            tmp_font  = font
            measure   = lambda t, f: draw.textlength(t, font=f)
            if measure(text, tmp_font) > max_width:
                while size > 18 and measure(text, tmp_font) > max_width:
                    size -= 2
                    tmp_font = load_font(size, is_bold, is_italic)
            line_w = measure(text, tmp_font)
            x = (1280 - line_w) // 2
            y = int(y_center - (size * 0.6))
            if form_data['shadow_enabled']:
                draw.text((x + form_data['shadow_offset_x'], y + form_data['shadow_offset_y']),
                          text, font=tmp_font, fill=form_data['shadow_color'])
            draw.text((x, y), text, font=tmp_font, fill=form_data['text_color'],
                      stroke_width=2 if is_bold else 0, stroke_fill='#000')
            if has_underline:
                ul_y = y + int(size * 1.05)
                draw.line([(x, ul_y), (x + line_w, ul_y)], fill=form_data['text_color'], width=2)

        draw_centered(form_data['title'],    title_font,    720 * 0.38)
        draw_centered(form_data['subtitle'], subtitle_font, 720 * 0.60)

        out = io.BytesIO()
        img.save(out, format='PNG', quality=95)
        out.seek(0)
        return send_file(out, mimetype='image/png', as_attachment=True,
                         download_name='youtube-thumbnail.png')
    except Exception as e:
        logger.error(f"Simple generation failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/generate-advanced-thumbnail', methods=['POST'])
def generate_advanced_thumbnail():
    try:
        canvas_data = request.form.get('canvas_data')
        if not canvas_data or ',' not in canvas_data:
            raise ValueError("Invalid or missing canvas data")
        header, encoded = canvas_data.split(",", 1)
        if "base64" not in header:
            raise ValueError("Canvas data must be base64")
        image_data = base64.b64decode(encoded)
        img_io = io.BytesIO(image_data)
        img_io.seek(0)
        with Image.open(img_io) as img:
            if img.size != (1280, 720):
                img = img.resize((1280, 720), Image.LANCZOS)
                output = io.BytesIO()
                img.save(output, format='PNG')
                output.seek(0)
                return send_file(output, mimetype='image/png', as_attachment=True,
                                 download_name='youtube-thumbnail-advanced.png')
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png', as_attachment=True,
                         download_name='youtube-thumbnail-advanced.png')
    except Exception as e:
        logger.error(f"Advanced generation failed: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/get-templates', methods=['GET'])
def get_templates():
    return jsonify([
        {"id": 1, "name": "Red Gradient",      "background": "linear-gradient(135deg, #FF0000, #990000)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#FFFFFF"},
        {"id": 2, "name": "Dark Professional", "background": "linear-gradient(135deg, #000000, #333333)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#CCCCCC"},
        {"id": 3, "name": "Bright Yellow",     "background": "linear-gradient(135deg, #FFCC00, #FF9900)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#000000", "subtitle_color": "#333333"},
        {"id": 4, "name": "Blue Ocean",        "background": "linear-gradient(135deg, #0077b6, #00b4d8)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#EEEEEE"},
        {"id": 5, "name": "Green Nature",      "background": "linear-gradient(135deg, #2a9d8f, #e9c46a)",
         "title": "YOUR TITLE HERE", "subtitle": "Your subtitle text", "title_color": "#FFFFFF", "subtitle_color": "#EEEEEE"},
    ])


@app.route('/apply-filter', methods=['POST'])
def apply_filter():
    try:
        image_file  = request.files.get('image')
        filter_type = request.form.get('filter_type')
        intensity   = float(request.form.get('intensity', 100)) / 100.0
        if image_file and allowed_file(image_file.filename):
            img = Image.open(image_file.stream).convert("RGB")
            if   filter_type == 'brightness': img = ImageEnhance.Brightness(img).enhance(intensity)
            elif filter_type == 'contrast':   img = ImageEnhance.Contrast(img).enhance(intensity)
            elif filter_type == 'saturate':   img = ImageEnhance.Color(img).enhance(intensity)
            elif filter_type == 'grayscale':  img = img.convert("L").convert("RGB")
            elif filter_type == 'sepia':
                w, h = img.size; px = img.load()
                for y in range(h):
                    for x in range(w):
                        r, g, b = img.getpixel((x, y))
                        px[x, y] = (min(255, int(0.393*r+0.769*g+0.189*b)),
                                    min(255, int(0.349*r+0.686*g+0.168*b)),
                                    min(255, int(0.272*r+0.534*g+0.131*b)))
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
    return "Internal Server Error", 500

@app.errorhandler(404)
def not_found_error(error):
    return "Page Not Found", 404

if __name__ == '__main__':
    app.run(debug=True)