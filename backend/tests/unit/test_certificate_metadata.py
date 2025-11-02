"""
Unit Tests for Certificate & Metadata Services (4 tests)
Tests certificate generation and NFT metadata creation
"""
import pytest
from unittest.mock import patch, MagicMock, Mock
from datetime import datetime


class TestCertificateService:
    """Test suite for Certificate Generation"""
    
    @pytest.mark.unit
    def test_generate_certificate_data_structures(self):
        """Test certificate generation for Data Structures course"""
        from app.services.certificate_template import CertificateTemplate
        
        mock_img = MagicMock()
        mock_img.size = (976, 693)
        mock_img.convert.return_value = mock_img
        
        with patch('app.services.certificate_template.Image.open', return_value=mock_img), \
             patch('app.services.certificate_template.ImageDraw.Draw'), \
             patch('app.services.certificate_template.os.path.exists', return_value=True):
            
            cert_service = CertificateTemplate()
            result = cert_service.generate_certificate(
                course_id="data-structures",
                wallet_address="ABC123xyz",
                final_score=92,
                timestamp="2024-01-15T10:00:00Z",
                user_name="Test User"
            )
            
            assert result is not None
            assert isinstance(result, bytes)
            print("✅ Certificate Generation: PASS")
    
    
    @pytest.mark.unit
    def test_certificate_text_rendering(self):
        """Test certificate text rendering"""
        from app.services.certificate_template import CertificateTemplate
        
        mock_img = MagicMock()
        mock_img.size = (976, 693)
        mock_img.convert.return_value = mock_img
        
        with patch('app.services.certificate_template.Image.open', return_value=mock_img), \
             patch('app.services.certificate_template.ImageDraw.Draw') as mock_draw, \
             patch('app.services.certificate_template.os.path.exists', return_value=True):
            
            mock_draw_instance = MagicMock()
            mock_draw.return_value = mock_draw_instance
            
            cert_service = CertificateTemplate()
            cert_service.generate_certificate(
                course_id="data-structures",
                wallet_address="WALLET123",
                final_score=95,
                timestamp="2024-01-25T09:45:00Z",
                user_name="John Doe"
            )
            
            assert mock_draw_instance.text.called
            print("✅ Certificate Text Rendering: PASS")


class TestMetadataService:
    """Test suite for NFT Metadata Service"""
    
    @pytest.mark.unit
    def test_generate_metadata(self):
        """Test NFT metadata generation"""
        from app.services.metadata_service import MetadataService
        
        with patch('app.services.metadata_service.CertificateTemplate') as mock_cert:
            mock_cert_instance = mock_cert.return_value
            mock_cert_instance.generate_certificate.return_value = b"fake_cert_image"
            
            metadata_service = MetadataService()
            result = metadata_service.generate_metadata(
                course_id="data-structures",
                user_id="test_user_123",
                quiz_score=90,
                completion_percentage=100,
                final_score=95,
                wallet_address="ABC123xyz",
                user_name="Test Student"
            )
            
            assert 'metadata' in result
            assert 'uri' in result
            assert result['metadata']['symbol'] == 'SIGNUM'
            print("✅ Metadata Generation: PASS")
    
    
    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_upload_to_ipfs_fallback(self):
        """Test IPFS upload fallback to data URI"""
        from app.services.metadata_service import MetadataService
        
        with patch('app.services.metadata_service.os.getenv') as mock_env:
            mock_env.return_value = None
            
            metadata_service = MetadataService()
            metadata_service.use_ipfs = False
            
            metadata_dict = {"name": "Test NFT", "image": "data:image/png;base64,abc"}
            ipfs_uri = await metadata_service.upload_to_ipfs(metadata_dict)
            
            assert ipfs_uri.startswith("data:application/json;base64,")
            print("✅ IPFS Fallback: PASS")
