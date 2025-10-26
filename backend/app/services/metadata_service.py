"""
Metadata Service - Generates NFT metadata and uploads to IPFS via Pinata
"""

from typing import Dict, Any
import json
import base64
import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from app.services.certificate_template import CertificateTemplate

load_dotenv()

class MetadataService:
    def __init__(self):
        # Initialize certificate template generator
        self.template_generator = CertificateTemplate()
        
        # Pinata API credentials
        self.pinata_api_key = os.getenv('PINATA_API_KEY')
        self.pinata_secret = os.getenv('PINATA_SECRET_API_KEY')
        self.pinata_jwt = os.getenv('PINATA_JWT')
        
        # Pinata endpoints
        self.pinata_upload_url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
        self.pinata_file_url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
        
        # Check if Pinata is configured
        self.use_ipfs = bool(self.pinata_jwt or (self.pinata_api_key and self.pinata_secret))
        
        if not self.use_ipfs:
            print("⚠️  Pinata not configured - using data URIs. Add PINATA_JWT to .env for IPFS upload")

    
    def generate_metadata(
        self,
        course_id: str,
        user_id: str,
        quiz_score: int,
        completion_percentage: int,
        final_score: int,
        wallet_address: str,
        user_name: str = "Student"
    ) -> Dict[str, Any]:
        """
        Generate NFT metadata JSON with course-specific certificate image
        
        Args:
            course_id: Course identifier
            user_id: User's Firebase ID
            quiz_score: Quiz score (0-100)
            completion_percentage: Course completion (0-100)
            final_score: Calculated final score
            wallet_address: User's Solana wallet
            
        Returns:
            Dictionary with metadata and URI
        """
        try:
            # Current timestamp
            timestamp = datetime.now().isoformat() + 'Z'
            
            # Generate course-specific certificate image
            certificate_image = self.template_generator.generate_certificate(
                course_id=course_id,
                wallet_address=wallet_address,
                final_score=final_score,
                timestamp=timestamp,
                user_name=user_name
            )
            
            # Upload certificate image to IPFS (or use data URI)
            if self.use_ipfs:
                image_uri = self._upload_image_sync(certificate_image, f"{course_id}_{wallet_address[:8]}.png")
            else:
                # Use data URI for MVP
                image_b64 = base64.b64encode(certificate_image).decode()
                image_uri = f"data:image/png;base64,{image_b64}"
            
            # Course-specific metadata
            course_metadata = {
                'data-structures': {
                    'name': 'Data Structures Master',
                    'description': 'Certificate of completion for mastering Data Structures & Algorithms including arrays, linked lists, trees, graphs, and complex problem-solving techniques.',
                    'category': 'Computer Science'
                },
                # Add more courses here
            }
            
            course_info = course_metadata.get(course_id, {
                'name': course_id.replace('-', ' ').title()[:32],
                'description': f'Certificate of completion for {course_id}',
                'category': 'General'
            })
            
            # Generate metadata JSON (Metaplex standard)
            metadata = {
                "name": f"{course_info['name'][:28]} NFT",  # Max 32 chars
                "symbol": "SIGNUM",  # Max 10 chars
                "description": course_info['description'],
                "image": image_uri,  # Using generated certificate image
                "external_url": "https://signumlearning.com",
                "attributes": [
                    {
                        "trait_type": "Course",
                        "value": course_info['name']
                    },
                    {
                        "trait_type": "Category",
                        "value": course_info['category']
                    },
                    {
                        "trait_type": "Quiz Score",
                        "value": quiz_score
                    },
                    {
                        "trait_type": "Completion",
                        "value": completion_percentage
                    },
                    {
                        "trait_type": "Final Score",
                        "value": final_score
                    },
                    {
                        "trait_type": "Wallet Address",
                        "value": f"{wallet_address[:8]}...{wallet_address[-8:]}"
                    },
                    {
                        "trait_type": "Issue Date",
                        "value": datetime.now().strftime("%Y-%m-%d")
                    },
                    {
                        "trait_type": "Timestamp",
                        "value": timestamp
                    },
                    {
                        "trait_type": "Platform",
                        "value": "Signum Learning"
                    }
                ],
                "properties": {
                    "files": [{
                        "uri": image_uri,
                        "type": "image/png"
                    }],
                    "category": "certificate",
                    "creators": [
                        {
                            "address": wallet_address,
                            "share": 100
                        }
                    ]
                }
            }
            
            # Upload metadata to IPFS or use data URI
            if self.use_ipfs:
                metadata_uri = self._upload_metadata_sync(metadata)
            else:
                metadata_json = json.dumps(metadata, indent=2)
                metadata_uri = self._create_data_uri(metadata_json)
            
            return {
                'metadata': metadata,
                'uri': metadata_uri,
                'image_uri': image_uri,
                'success': True
            }
            
        except Exception as e:
            raise Exception(f"Error generating metadata: {str(e)}")
    
    def _generate_certificate_image_uri(self, course_name: str, emoji: str, score: int) -> str:
        """
        Generate a simple SVG certificate image as data URI
        For production, this should be a proper PNG/JPG uploaded to IPFS
        """
        svg = f'''
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#grad)"/>
            <rect x="20" y="20" width="560" height="360" fill="none" stroke="#fff" stroke-width="4"/>
            <text x="300" y="80" font-family="Arial" font-size="48" fill="#fff" text-anchor="middle">{emoji}</text>
            <text x="300" y="140" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle" font-weight="bold">CERTIFICATE OF COMPLETION</text>
            <text x="300" y="200" font-family="Arial" font-size="20" fill="#fff" text-anchor="middle">{course_name}</text>
            <text x="300" y="260" font-family="Arial" font-size="18" fill="#fff" text-anchor="middle">Signum Learning Platform</text>
            <text x="300" y="320" font-family="Arial" font-size="32" fill="#fbbf24" text-anchor="middle" font-weight="bold">Score: {score}%</text>
        </svg>
        '''
        
        # Convert SVG to data URI
        svg_b64 = base64.b64encode(svg.strip().encode()).decode()
        return f"data:image/svg+xml;base64,{svg_b64}"
    
    def _create_data_uri(self, json_data: str) -> str:
        """Convert JSON to data URI"""
        json_b64 = base64.b64encode(json_data.encode()).decode()
        return f"data:application/json;base64,{json_b64}"
    
    def _upload_metadata_sync(self, metadata: dict) -> str:
        """Synchronous metadata upload to IPFS"""
        try:
            headers = {'Content-Type': 'application/json'}
            
            if self.pinata_jwt:
                headers['Authorization'] = f'Bearer {self.pinata_jwt}'
            else:
                headers['pinata_api_key'] = self.pinata_api_key
                headers['pinata_secret_api_key'] = self.pinata_secret
            
            data = {
                'pinataContent': metadata,
                'pinataMetadata': {
                    'name': f"{metadata.get('name', 'certificate')}.json",
                }
            }
            
            response = requests.post(self.pinata_upload_url, json=data, headers=headers)
            
            if response.status_code == 200:
                ipfs_hash = response.json().get('IpfsHash')
                return f"ipfs://{ipfs_hash}"
            else:
                return self._create_data_uri(json.dumps(metadata))
        except Exception as e:
            print(f"Error uploading metadata: {e}")
            return self._create_data_uri(json.dumps(metadata))
    
    def _upload_image_sync(self, image_data: bytes, filename: str) -> str:
        """Synchronous image upload to IPFS"""
        try:
            headers = {}
            if self.pinata_jwt:
                headers['Authorization'] = f'Bearer {self.pinata_jwt}'
            else:
                headers['pinata_api_key'] = self.pinata_api_key
                headers['pinata_secret_api_key'] = self.pinata_secret
            
            files = {'file': (filename, image_data, 'image/png')}
            
            # Add pinata metadata
            pinata_metadata = {
                'name': filename,
                'keyvalues': {
                    'platform': 'Signum Learning',
                    'type': 'certificate-image'
                }
            }
            
            data = {
                'pinataMetadata': json.dumps(pinata_metadata)
            }
            
            response = requests.post(self.pinata_file_url, files=files, data=data, headers=headers)
            
            if response.status_code == 200:
                ipfs_hash = response.json().get('IpfsHash')
                # Get gateway URL from environment or use default
                gateway = os.getenv('PINATA_GATEWAY', 'gateway.pinata.cloud')
                # Return HTTPS gateway URL instead of ipfs:// for browser compatibility
                print(f"✅ Image uploaded to IPFS: {ipfs_hash}")
                return f"https://{gateway}/ipfs/{ipfs_hash}"
            else:
                print(f"❌ Pinata image upload failed: {response.text}")
                b64_image = base64.b64encode(image_data).decode()
                return f"data:image/png;base64,{b64_image}"
        except Exception as e:
            print(f"❌ Error uploading image: {e}")
            b64_image = base64.b64encode(image_data).decode()
            return f"data:image/png;base64,{b64_image}"
    
    async def upload_to_ipfs(self, metadata: dict) -> str:
        """
        Upload metadata to IPFS via Pinata
        Falls back to data URI if Pinata not configured
        
        Args:
            metadata: NFT metadata dictionary
            
        Returns:
            IPFS URI (ipfs://...) or data URI
        """
        if not self.use_ipfs:
            # Fallback to data URI
            return self._create_data_uri(json.dumps(metadata))
        
        try:
            # Prepare headers
            headers = {
                'Content-Type': 'application/json'
            }
            
            # Use JWT if available, otherwise use API key
            if self.pinata_jwt:
                headers['Authorization'] = f'Bearer {self.pinata_jwt}'
            else:
                headers['pinata_api_key'] = self.pinata_api_key
                headers['pinata_secret_api_key'] = self.pinata_secret
            
            # Prepare request body
            data = {
                'pinataContent': metadata,
                'pinataMetadata': {
                    'name': f"{metadata.get('name', 'certificate')}.json",
                    'keyvalues': {
                        'platform': 'Signum Learning',
                        'type': 'nft-metadata'
                    }
                }
            }
            
            # Upload to Pinata
            response = requests.post(
                self.pinata_upload_url,
                json=data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ipfs_hash = result.get('IpfsHash')
                ipfs_uri = f"ipfs://{ipfs_hash}"
                print(f"✅ Metadata uploaded to IPFS: {ipfs_uri}")
                return ipfs_uri
            else:
                print(f"❌ Pinata upload failed: {response.text}")
                # Fallback to data URI
                return self._create_data_uri(json.dumps(metadata))
                
        except Exception as e:
            print(f"❌ Error uploading to IPFS: {str(e)}")
            # Fallback to data URI
            return self._create_data_uri(json.dumps(metadata))
    
    async def upload_image_to_ipfs(self, image_data: bytes, filename: str) -> str:
        """
        Upload image to IPFS via Pinata
        
        Args:
            image_data: Image bytes
            filename: Name of the file
            
        Returns:
            IPFS URI (ipfs://...) or data URI
        """
        if not self.use_ipfs:
            # Fallback to data URI
            b64_image = base64.b64encode(image_data).decode()
            return f"data:image/png;base64,{b64_image}"
        
        try:
            headers = {}
            if self.pinata_jwt:
                headers['Authorization'] = f'Bearer {self.pinata_jwt}'
            else:
                headers['pinata_api_key'] = self.pinata_api_key
                headers['pinata_secret_api_key'] = self.pinata_secret
            
            files = {
                'file': (filename, image_data, 'image/png')
            }
            
            pinata_metadata = {
                'name': filename,
                'keyvalues': {
                    'platform': 'Signum Learning',
                    'type': 'certificate-image'
                }
            }
            
            data = {
                'pinataMetadata': json.dumps(pinata_metadata)
            }
            
            response = requests.post(
                self.pinata_file_url,
                files=files,
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ipfs_hash = result.get('IpfsHash')
                ipfs_uri = f"ipfs://{ipfs_hash}"
                print(f"✅ Image uploaded to IPFS: {ipfs_uri}")
                return ipfs_uri
            else:
                print(f"❌ Pinata image upload failed: {response.text}")
                b64_image = base64.b64encode(image_data).decode()
                return f"data:image/png;base64,{b64_image}"
                
        except Exception as e:
            print(f"❌ Error uploading image to IPFS: {str(e)}")
            b64_image = base64.b64encode(image_data).decode()
            return f"data:image/png;base64,{b64_image}"
