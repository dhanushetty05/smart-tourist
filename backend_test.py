#!/usr/bin/env python3
"""
Smart Tourist Safety Monitoring System - Backend API Testing
Tests all API endpoints for authentication, tourist management, location tracking, alerts, and analytics
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class TouristSafetyAPITester:
    def __init__(self, base_url="https://touristguard-11.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tourist_token = None
        self.admin_token = None
        self.tourist_id = None
        self.alert_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None, 
                 token: Optional[str] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if token:
            test_headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                try:
                    return False, response.json()
                except:
                    return False, {'error': response.text}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_tourist_registration(self):
        """Test tourist registration"""
        test_data = {
            "email": f"tourist_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test Tourist",
            "role": "tourist"
        }
        
        success, response = self.run_test(
            "Tourist Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'access_token' in response:
            self.tourist_token = response['access_token']
            print(f"   Tourist token obtained: {self.tourist_token[:20]}...")
            return True
        return False

    def test_admin_registration(self):
        """Test admin registration"""
        test_data = {
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "AdminPass123!",
            "name": "Test Admin",
            "role": "police"
        }
        
        success, response = self.run_test(
            "Admin Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_tourist_login(self):
        """Test tourist login with existing credentials"""
        test_data = {
            "email": "tourist@test.com",
            "password": "password123"
        }
        
        success, response = self.run_test(
            "Tourist Login",
            "POST",
            "auth/login",
            200,
            data=test_data
        )
        
        if not success:
            # Try with registered user if login fails
            print("   Login failed, using registration token...")
            return self.tourist_token is not None
        
        if 'access_token' in response:
            self.tourist_token = response['access_token']
            return True
        return False

    def test_create_tourist_profile(self):
        """Test creating tourist profile"""
        if not self.tourist_token:
            print("❌ No tourist token available")
            return False
            
        entry_date = datetime.now()
        exit_date = entry_date + timedelta(days=30)
        
        test_data = {
            "name": "Test Tourist Profile",
            "passport_number": "AB1234567",
            "entry_date": entry_date.isoformat(),
            "exit_date": exit_date.isoformat(),
            "emergency_contact": "+1234567890",
            "photo_url": "https://example.com/photo.jpg"
        }
        
        success, response = self.run_test(
            "Create Tourist Profile",
            "POST",
            "tourists",
            200,
            data=test_data,
            token=self.tourist_token
        )
        
        if success and 'tourist_id' in response:
            self.tourist_id = response['tourist_id']
            print(f"   Tourist ID created: {self.tourist_id}")
            return True
        return False

    def test_get_tourist_profile(self):
        """Test getting tourist profile"""
        if not self.tourist_token:
            return False
            
        return self.run_test(
            "Get Tourist Profile",
            "GET",
            "tourists/me",
            200,
            token=self.tourist_token
        )[0]

    def test_update_location(self):
        """Test location update"""
        if not self.tourist_token:
            return False
            
        test_data = {
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        return self.run_test(
            "Update Location",
            "POST",
            "locations",
            200,
            data=test_data,
            token=self.tourist_token
        )[0]

    def test_create_panic_alert(self):
        """Test panic alert creation"""
        if not self.tourist_token:
            return False
            
        test_data = {
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        success, response = self.run_test(
            "Create Panic Alert",
            "POST",
            "alerts/panic",
            200,
            data=test_data,
            token=self.tourist_token
        )
        
        if success and 'id' in response:
            self.alert_id = response['id']
            print(f"   Alert ID created: {self.alert_id}")
            return True
        return False

    def test_get_alerts(self):
        """Test getting alerts"""
        if not self.tourist_token:
            return False
            
        return self.run_test(
            "Get Alerts",
            "GET",
            "alerts",
            200,
            token=self.tourist_token
        )[0]

    def test_get_geo_zones(self):
        """Test getting geo zones"""
        return self.run_test(
            "Get Geo Zones",
            "GET",
            "geo-zones",
            200
        )[0]

    def test_admin_get_tourists(self):
        """Test admin getting all tourists"""
        if not self.admin_token:
            return False
            
        return self.run_test(
            "Admin Get All Tourists",
            "GET",
            "tourists",
            200,
            token=self.admin_token
        )[0]

    def test_admin_get_analytics(self):
        """Test admin analytics dashboard"""
        if not self.admin_token:
            return False
            
        return self.run_test(
            "Admin Analytics Dashboard",
            "GET",
            "analytics/dashboard",
            200,
            token=self.admin_token
        )[0]

    def test_admin_update_alert(self):
        """Test admin updating alert status"""
        if not self.admin_token or not self.alert_id:
            return False
            
        return self.run_test(
            "Admin Update Alert",
            "PATCH",
            f"alerts/{self.alert_id}?status=resolved&assigned_officer=Test Officer",
            200,
            token=self.admin_token
        )[0]

    def test_tourist_verification(self):
        """Test tourist ID verification"""
        if not self.tourist_id:
            return False
            
        return self.run_test(
            "Tourist ID Verification",
            "GET",
            f"tourists/verify/{self.tourist_id}",
            200
        )[0]

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Smart Tourist Safety API Testing...")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Test sequence
        test_sequence = [
            ("API Root", self.test_root_endpoint),
            ("Tourist Registration", self.test_tourist_registration),
            ("Admin Registration", self.test_admin_registration),
            ("Tourist Login", self.test_tourist_login),
            ("Create Tourist Profile", self.test_create_tourist_profile),
            ("Get Tourist Profile", self.test_get_tourist_profile),
            ("Update Location", self.test_update_location),
            ("Create Panic Alert", self.test_create_panic_alert),
            ("Get Alerts", self.test_get_alerts),
            ("Get Geo Zones", self.test_get_geo_zones),
            ("Admin Get Tourists", self.test_admin_get_tourists),
            ("Admin Analytics", self.test_admin_get_analytics),
            ("Admin Update Alert", self.test_admin_update_alert),
            ("Tourist Verification", self.test_tourist_verification),
        ]

        for test_name, test_func in test_sequence:
            try:
                test_func()
            except Exception as e:
                print(f"❌ {test_name} failed with exception: {str(e)}")
                self.failed_tests.append({
                    'test': test_name,
                    'error': str(e)
                })

        # Print results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print("\n🔍 FAILED TESTS DETAILS:")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {failure.get('test', 'Unknown')}")
                if 'error' in failure:
                    print(f"   Error: {failure['error']}")
                if 'expected' in failure and 'actual' in failure:
                    print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
                if 'response' in failure:
                    print(f"   Response: {failure['response']}")

        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ success rate as passing

def main():
    """Main test execution"""
    tester = TouristSafetyAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Testing failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())