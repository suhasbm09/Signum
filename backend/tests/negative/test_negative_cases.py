"""
Negative Tests (4 tests)
Tests invalid inputs, malformed requests, and error conditions
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """FastAPI test client"""
    from app.main import app
    return TestClient(app)


class TestNegativeScenarios:
    """Negative testing - invalid inputs and error conditions"""
    
    @pytest.mark.negative
    def test_invalid_endpoint_returns_404(self, client):
        """Test requesting invalid endpoint returns 404"""
        response = client.get("/api/invalid/endpoint/does/not/exist")
        
        assert response.status_code == 404
        print("✅ Invalid endpoint → 404")
    
    
    @pytest.mark.negative
    def test_unauthorized_access_without_token(self, client):
        """Test accessing protected endpoint without auth token returns error"""
        # Try to access protected endpoint without Authorization header
        response = client.get("/api/progress/data-structures")
        
        # Should return error (404, 401, 403, or redirect)
        assert response.status_code in [401, 403, 404, 307]
        print(f"✅ Unauthorized access without token → {response.status_code}")
    
    
    @pytest.mark.negative  
    def test_invalid_http_method_returns_error(self, client):
        """Test using wrong HTTP method returns error"""
        # Try to POST to root endpoint (which only accepts GET)
        response = client.post("/")
        
        # Should return error (405 Method Not Allowed or 404)
        assert response.status_code in [404, 405]
        print(f"✅ Invalid HTTP method → {response.status_code}")
    
    
    @pytest.mark.negative
    def test_root_endpoint_accessible(self, client):
        """Test root endpoint is accessible (baseline negative test)"""
        # Verify the API is running and root endpoint works
        response = client.get("/")
        
        # Root should work fine
        assert response.status_code == 200
        print("✅ Root endpoint accessible → 200")
