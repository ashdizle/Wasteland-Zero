"""
Wasteland Zero API Tests
Tests for IAP, Cosmetics, and core game APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://panel-adventure.preview.emergentagent.com')

class TestHealthEndpoint:
    """Health check tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
        print(f"✓ Health check passed: {data}")


class TestIAPEndpoints:
    """In-App Purchase API tests"""
    
    def test_get_iap_products(self):
        """Test IAP products endpoint returns 5 products"""
        response = requests.get(f"{BASE_URL}/api/iap/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        products = data["products"]
        assert len(products) == 5
        
        # Verify product IDs
        product_ids = [p["id"] for p in products]
        expected_ids = [
            "com.wastelandzero.premium",
            "com.wastelandzero.xp_boost",
            "com.wastelandzero.caps_boost",
            "com.wastelandzero.loot_boost",
            "com.wastelandzero.mega_bundle"
        ]
        for expected_id in expected_ids:
            assert expected_id in product_ids, f"Missing product: {expected_id}"
        
        print(f"✓ IAP products: {len(products)} products found")
        for p in products:
            print(f"  - {p['name']}: ${p['price']}")


class TestCosmeticsEndpoints:
    """Cosmetics shop API tests"""
    
    def test_get_cosmetics_catalog(self):
        """Test cosmetics catalog endpoint"""
        response = requests.get(f"{BASE_URL}/api/cosmetics/catalog")
        assert response.status_code == 200
        data = response.json()
        
        assert "items" in data
        assert "gem_packages" in data
        assert "earning_methods" in data
        
        items = data["items"]
        assert len(items) > 0
        print(f"✓ Cosmetics catalog: {len(items)} items")
    
    def test_get_player_data(self):
        """Test player cosmetics data endpoint"""
        response = requests.get(f"{BASE_URL}/api/cosmetics/player-data?player_id=default")
        assert response.status_code == 200
        data = response.json()
        
        assert "player_id" in data
        assert "total_gems" in data
        assert "owned_cosmetics" in data
        assert "equipped_cosmetics" in data
        
        print(f"✓ Player data: {data['total_gems']} gems, {len(data['owned_cosmetics'])} owned items")
    
    def test_get_active_bonuses(self):
        """Test active bonuses endpoint"""
        response = requests.get(f"{BASE_URL}/api/cosmetics/active-bonuses?player_id=default")
        assert response.status_code == 200
        data = response.json()
        
        assert "bonuses" in data
        print(f"✓ Active bonuses: {data['bonuses']}")


class TestLeaderboardEndpoints:
    """Leaderboard API tests"""
    
    def test_get_top_leaderboard(self):
        """Test leaderboard top endpoint"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/top?category=total_xp&limit=10")
        assert response.status_code == 200
        data = response.json()
        
        assert "players" in data
        assert "success" in data
        assert data["success"] == True
        print(f"✓ Leaderboard endpoint working: {len(data['players'])} entries")


class TestPrestigeEndpoints:
    """Prestige system API tests"""
    
    def test_get_prestige_data(self):
        """Test prestige data endpoint"""
        response = requests.get(f"{BASE_URL}/api/prestige/data?player_id=default")
        assert response.status_code == 200
        data = response.json()
        
        assert "player_id" in data
        assert "prestige_level" in data
        print(f"✓ Prestige data: level {data['prestige_level']}")
    
    def test_get_masteries(self):
        """Test masteries endpoint"""
        response = requests.get(f"{BASE_URL}/api/prestige/masteries?player_class=warrior")
        assert response.status_code == 200
        data = response.json()
        
        assert "universal" in data
        assert "class_specific" in data
        print(f"✓ Masteries: {len(data['universal'])} universal, {len(data['class_specific'])} class-specific")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
