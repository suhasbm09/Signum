"""
Certificate Template Generator
Creates course-specific certificate images with dynamic data
Now with QR code support for blockchain verification
"""

from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from datetime import datetime, timedelta
from typing import Dict, Any
import os
import qrcode
from app.core.logging import certificate_logger

class CertificateTemplate:
    def __init__(self):
        # Template folders path
        self.templates_dir = os.path.join(
            os.path.dirname(__file__), 
            '../templates/certificates'
        )
        
        # Text colors matching project standards
        self.text_color = '#FFFFFF'  # Pure white for maximum readability
        self.accent_color = '#fbbf24'  # Bright yellow (Tailwind yellow-400) - high contrast with green certificate
        
        # Load Quantico fonts (project standard font family)
        # Using professional tech-styled Quantico font to match frontend
        font_dir = os.path.join(os.path.dirname(__file__))
        try:
            # Recipient name - Quantico Bold for prominence
            self.name_font = ImageFont.truetype(os.path.join(font_dir, 'Quantico-Bold.ttf'), 60)
            
            # Wallet address - Quantico Regular for clean monospace look
            self.wallet_font = ImageFont.truetype(os.path.join(font_dir, 'Quantico-Regular.ttf'), 28)
            
            # Overall score - Quantico Bold for celebration
            self.score_font = ImageFont.truetype(os.path.join(font_dir, 'Quantico-Bold.ttf'), 72)
            
            # Timestamp - Quantico Regular for professional clarity
            self.timestamp_font = ImageFont.truetype(os.path.join(font_dir, 'Quantico-Regular.ttf'), 38)
            
        except Exception as e:
            certificate_logger.warning(f"Font loading error: {e}. Falling back to DejaVu fonts.")
            # Fallback to system fonts if Quantico not available
            self.name_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 60)
            self.wallet_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 28)
            self.score_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 72)
            self.timestamp_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 38)
    
    def _generate_qr_code(self, mint_address: str, cluster: str = 'devnet') -> Image.Image:
        """
        Generate QR code for Solana Explorer verification link
        
        Args:
            mint_address: NFT mint address on Solana
            cluster: 'devnet' or 'mainnet-beta'
        
        Returns:
            PIL Image object of QR code
        """
        # Build Solana Explorer URL (better metadata display than Solscan)
        if cluster == 'mainnet-beta':
            url = f"https://explorer.solana.com/address/{mint_address}"
        else:
            url = f"https://explorer.solana.com/address/{mint_address}?cluster=devnet"
        
        # Generate QR code with high error correction
        qr = qrcode.QRCode(
            version=1,  # Auto-size
            error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction (30%)
            box_size=10,  # Size of each box in pixels
            border=2,  # Border size in boxes
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        # Create QR code image (black on white)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        return qr_img
    
    def _generate_data_structures_certificate(
        self,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str,
        mint_address: str = None
    ) -> bytes:
        """
        Generate Data Structures certificate with new tech-themed template
        Template dimensions: 1696 x 2528 pixels (portrait, high-res)
        
        Layout:
        - Top: SIGNUM logo + title
        - Left side: RECIPIENT NAME, WALLET ADDRESS boxes
        - Right side: QR CODE, OVERALL SCORE, TIMESTAMP boxes
        - Bottom: Powered by text
        
        Fields overlaid:
        1. User name (bright white, large)
        2. Wallet address (bright white, medium)
        3. Final score (bright emerald, HUGE)
        4. Timestamp (bright white, medium)
        5. QR code (if mint_address provided)
        """
        # Load the template image
        template_path = os.path.join(self.templates_dir, 'data-structures', 'certificate_template.png')
        
        if not os.path.exists(template_path):
            raise FileNotFoundError(f"Certificate template not found at {template_path}")
        
        # Open template (1696 x 2528)
        img = Image.open(template_path).convert('RGBA')
        draw = ImageDraw.Draw(img)
        
        # Get actual dimensions
        width, height = img.size
        certificate_logger.info(f"Certificate template size: {width}x{height}")
        
        # === POSITIONING FOR 1696x2528 TEMPLATE ===
        # Based on the green tech design layout
        
        # FIELD 1: RECIPIENT NAME
        # Position in left box - centered vertically inside the gray box
        name_x = int(width * 0.15)  # Moved more to the right
        name_y = int(height * 0.401)  # Inside the recipient name box
        draw.text((name_x, name_y), user_name, fill=self.text_color, font=self.name_font)
        
        # FIELD 2: WALLET ADDRESS (ON-CHAIN ID)
        # Position in left box - split into 2 lines to fit properly
        wallet_x = int(width * 0.11)  # Moved to the right
        wallet_y = int(height * 0.525)  # Starting position for first line
        # Split wallet address into 2 lines
        if len(wallet_address) > 22:
            line1 = wallet_address[:22]
            line2 = wallet_address[22:]
            draw.text((wallet_x, wallet_y), line1, fill=self.text_color, font=self.wallet_font)
            draw.text((wallet_x, wallet_y + 35), line2, fill=self.text_color, font=self.wallet_font)  # Second line below
        else:
            draw.text((wallet_x, wallet_y), wallet_address, fill=self.text_color, font=self.wallet_font)
        
        # FIELD 3: OVERALL SCORE
        # Position in right box - moved lower with reduced font size
        score_text = f"{final_score}%"
        score_x = int(width * 0.69)  # Right section with padding
        score_y = int(height * 0.70)  # Moved lower
        draw.text((score_x, score_y), score_text, fill=self.accent_color, font=self.score_font)
        
        # FIELD 4: TIMESTAMP
        # Position in right box - centered vertically inside the gray timestamp box
        # Convert UTC to IST (UTC+5:30)
        try:
            dt_utc = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            dt_ist = dt_utc + timedelta(hours=5, minutes=30)
            date_formatted = dt_ist.strftime("%B %d, %Y")
        except:
            date_formatted = datetime.now().strftime("%B %d, %Y")
        
        timestamp_x = int(width * 0.59)
        timestamp_y = int(height * 0.83)  # Moved lower
        draw.text((timestamp_x, timestamp_y), date_formatted, fill=self.text_color, font=self.timestamp_font)
        
        # FIELD 5: QR CODE (if mint address provided)
        # Position in right box QR code area, centered in designated QR box
        if mint_address:
            try:
                qr_img = self._generate_qr_code(mint_address, cluster='devnet')
                
                # Larger QR code to fill the designated box better
                qr_size = int(width * 0.30)  # Increased to 20% (~340px)
                qr_img = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
                
                # Position: centered in QR box
                qr_x = int(width * 0.73) - (qr_size // 2)  # Moved to the right
                qr_y = int(height * 0.38)  # Centered in the QR code box area
                
                # Paste QR code onto certificate
                img.paste(qr_img, (qr_x, qr_y))
                certificate_logger.info(f"QR code added at ({qr_x}, {qr_y}) with size {qr_size}x{qr_size}")
            except Exception as e:
                certificate_logger.error(f"QR code generation failed: {e}")
        else:
            certificate_logger.info("No mint address provided - QR code skipped")
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG', quality=95)
        img_bytes.seek(0)
        
        certificate_logger.info(f"Certificate generated: {user_name}, Score: {final_score}%, QR: {'Yes' if mint_address else 'No'}")
        return img_bytes.getvalue()
    
    def generate_certificate(
        self,
        course_id: str,
        wallet_address: str,
        final_score: int,
        timestamp: str,
        user_name: str = "Student",
        mint_address: str = None
    ) -> bytes:
        """
        Generate course-specific certificate with dynamic fields and QR code
        
        Args:
            course_id: Course identifier (e.g., 'data-structures')
            wallet_address: User's Solana wallet address
            final_score: Calculated final score (0-100)
            timestamp: ISO format timestamp
            user_name: Student's display name
            mint_address: NFT mint address for QR code (optional)
        
        Returns:
            PNG image bytes
        """
        if course_id == 'data-structures':
            return self._generate_data_structures_certificate(
                wallet_address, final_score, timestamp, user_name, mint_address
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
        draw.text((name_x, 220), user_name, fill='#ffffff', font=self.name_font)
        
        # FIELD 2: Wallet
        formatted_wallet = f"{wallet_address[:8]}...{wallet_address[-8:]}"
        wallet_bbox = draw.textbbox((0, 0), formatted_wallet, font=self.text_font)
        wallet_x = (self.width - (wallet_bbox[2] - wallet_bbox[0])) // 2
        draw.text((wallet_x, 160), formatted_wallet, fill='#9ca3af', font=self.text_font)
        
        # FIELD 3: Score
        score_text = f"{final_score}%"
        score_bbox = draw.textbbox((0, 0), score_text, font=self.score_font)
        score_x = (self.width - (score_bbox[2] - score_bbox[0])) // 2
        draw.text((score_x, 349.5), score_text, fill='#fbbf24', font=self.score_font)
        
        # FIELD 4: Date
        date_formatted = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime("%B %d, %Y")
        date_bbox = draw.textbbox((0, 0), date_formatted, font=self.text_font)
        date_x = (self.width - (date_bbox[2] - date_bbox[0])) // 2
        draw.text((date_x, 480), date_formatted, fill='#9ca3af', font=self.text_font)
        
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
