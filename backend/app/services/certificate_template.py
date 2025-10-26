"""
Certificate Template Generator
Creates course-specific certificate images with dynamic data
"""

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from datetime import datetime
from typing import Dict, Any
import os

class CertificateTemplate:
    def __init__(self):
        # Certificate dimensions (CANVAS SIZE FOR DESIGNING)
        self.width = 1200
        self.height = 850
        
        # Template folders path
        self.templates_dir = os.path.join(
            os.path.dirname(__file__), 
            '../templates/certificates'
        )
        
        # Try to load fonts (fallback to default if not available)
        try:
            self.title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 48)
            self.subtitle_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 32)
            self.name_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 32)  # Increased from 24 to 32
            self.score_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 27)  # Reduced to 36 for better fit
            self.text_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
            self.wallet_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)  # Smaller font for wallet
        except:
            self.title_font = ImageFont.load_default()
            self.subtitle_font = ImageFont.load_default()
            self.name_font = ImageFont.load_default()
            self.score_font = ImageFont.load_default()
            self.text_font = ImageFont.load_default()
            self.wallet_font = ImageFont.load_default()
    
    def _generate_data_structures_certificate(
        self,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str
    ) -> bytes:
        """
        Generate Data Structures course certificate using the template PNG
        Overlays 4 dynamic fields on the template:
        1. User name
        2. Wallet address  
        3. Final score
        4. Timestamp
        """
        # Load the template image
        template_path = os.path.join(self.templates_dir, 'data-structures', 'certificate_template.png')
        
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Certificate template not found at {template_path}")
        
        # Open the template
        img = Image.open(template_path).convert('RGB')
        draw = ImageDraw.Draw(img)
        
        # Get image dimensions from template (976 x 693)
        width, height = img.size
        
        # FIELD 1: User Name - below "This is to certify that"
        # Positioned at approximately 48% down the template
        name_y = int(height * 0.47)  # ~333px from top
        name_bbox = draw.textbbox((0, 0), user_name, font=self.name_font)
        name_x = (width - (name_bbox[2] - name_bbox[0])) // 2
        draw.text((name_x, name_y), user_name, fill='#000000', font=self.name_font)
        
        # FIELD 2: Full Wallet address - below the name (smaller font)
        # Display full address, positioned at 54% down
        wallet_y = int(height * 0.54)  # ~374px from top
        wallet_bbox = draw.textbbox((0, 0), wallet_address, font=self.wallet_font)
        wallet_x = (width - (wallet_bbox[2] - wallet_bbox[0])) // 2
        draw.text((wallet_x, wallet_y), wallet_address, fill='#555555', font=self.wallet_font)
        
        # FIELD 3: Final Score - positioned to the RIGHT of "with overall score" text
        # Positioned at approximately 68% down, shifted slightly right from center
        score_y = int(height * 0.685)  # ~471px from top
        score_text = f"{final_score}%"
        score_bbox = draw.textbbox((0, 0), score_text, font=self.score_font)
        # Move score slightly to the right - position at 55% of width
        score_x = int(width * 0.51)  # Slightly right of center (center = 50%)
        draw.text((score_x, score_y), score_text, fill='#000000', font=self.score_font)
        
        # FIELD 4: Timestamp - in "Certified on [date]" section
        # Positioned at approximately 82% down
        date_y = int(height * 0.82)  # ~568px from top
        # Convert UTC timestamp to IST (India Standard Time - UTC+5:30)
        from datetime import timedelta
        dt_utc = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        dt_ist = dt_utc + timedelta(hours=5, minutes=30)
        date_formatted = dt_ist.strftime("%B %d, %Y")
        date_bbox = draw.textbbox((0, 0), date_formatted, font=self.text_font)
        date_x = (width - (date_bbox[2] - date_bbox[0])) // 2
        draw.text((date_x, date_y), date_formatted, fill='#333333', font=self.text_font)
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG', quality=95)
        img_bytes.seek(0)
        
        return img_bytes.getvalue()
    
    def generate_certificate(
        self,
        course_id: str,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str = "Student"
    ) -> bytes:
        """
        Generate course-specific certificate with 4 dynamic fields always
        """
        if course_id == 'data-structures':
            return self._generate_data_structures_certificate(
                wallet_address, final_score, timestamp, user_name
            )
        else:
            return self._generate_generic_certificate(
                course_id, wallet_address, final_score, timestamp, user_name
            )
    
    def _generate_generic_certificate(
        self,
        course_id: str,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str
    ) -> bytes:
        """Generic certificate with 4 dynamic fields"""
        img = Image.new('RGB', (self.width, self.height), color='#1a1a2e')
        draw = ImageDraw.Draw(img)
        
        # Simple gradient
        for y in range(self.height):
            shade = int(26 + (50 - 26) * y / self.height)
            draw.rectangle([(0, y), (self.width, y+1)], fill=(shade, shade, shade + 20))
        
        # Border
        draw.rectangle([(30, 30), (self.width-30, self.height-30)], outline='#6366f1', width=8)
        
        # Title
        title = "CERTIFICATE OF COMPLETION"
        title_bbox = draw.textbbox((0, 0), title, font=self.title_font)
        title_x = (self.width - (title_bbox[2] - title_bbox[0])) // 2
        draw.text((title_x, 150), title, fill='#ffffff', font=self.title_font)
        
        # Course name
        course_name = course_id.replace('-', ' ').title()
        course_bbox = draw.textbbox((0, 0), course_name, font=self.subtitle_font)
        course_x = (self.width - (course_bbox[2] - course_bbox[0])) // 2
        draw.text((course_x, 230), course_name, fill='#6366f1', font=self.subtitle_font)
        
        # FIELD 1: User name
        name_bbox = draw.textbbox((0, 0), user_name, font=self.name_font)
        name_x = (self.width - (name_bbox[2] - name_bbox[0])) // 2
        draw.text((name_x, 320), user_name, fill='#ffffff', font=self.name_font)
        
        # FIELD 2: Wallet
        formatted_wallet = f"{wallet_address[:8]}...{wallet_address[-8:]}"
        wallet_bbox = draw.textbbox((0, 0), formatted_wallet, font=self.text_font)
        wallet_x = (self.width - (wallet_bbox[2] - wallet_bbox[0])) // 2
        draw.text((wallet_x, 360), formatted_wallet, fill='#9ca3af', font=self.text_font)
        
        # FIELD 3: Score
        score_text = f"{final_score}%"
        score_bbox = draw.textbbox((0, 0), score_text, font=self.score_font)
        score_x = (self.width - (score_bbox[2] - score_bbox[0])) // 2
        draw.text((score_x, 449.5), score_text, fill='#fbbf24', font=self.score_font)
        
        # FIELD 4: Date
        date_formatted = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime("%B %d, %Y")
        date_bbox = draw.textbbox((0, 0), date_formatted, font=self.text_font)
        date_x = (self.width - (date_bbox[2] - date_bbox[0])) // 2
        draw.text((date_x, 580), date_formatted, fill='#9ca3af', font=self.text_font)
        
        # Platform
        platform = "Signum Learning"
        platform_bbox = draw.textbbox((0, 0), platform, font=self.subtitle_font)
        platform_x = (self.width - (platform_bbox[2] - platform_bbox[0])) // 2
        draw.text((platform_x, 680), platform, fill='#6366f1', font=self.subtitle_font)
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG', quality=95)
        img_bytes.seek(0)
        
        return img_bytes.getvalue()
