#!/usr/bin/env python3
"""
Backend API Testing for Campus Web Access Security System
Tests all API endpoints for the Cisco Virtual Internship project
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, List

class CampusSecurityAPITester:
    def __init__(self, base_url="https://55270831-9284-4f10-82a9-de60713e484a.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'policies': [],
            'devices': [],
            'alerts': []
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict[Any, Any] = None, headers: Dict[str, str] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            details = f"Status: {response.status_code}"
            if not success:
                details += f" (Expected: {expected_status})"
                if response.text:
                    details += f" Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response_data

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_demo_initialization(self):
        """Test demo data initialization"""
        print("\n🔧 Testing Demo Data Initialization...")
        success, response = self.run_test(
            "Initialize Demo Data",
            "POST",
            "demo/initialize",
            200
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n📊 Testing Dashboard Statistics...")
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success and response:
            required_fields = [
                'total_policies', 'active_policies', 'total_devices', 
                'active_devices', 'total_alerts', 'unresolved_alerts',
                'blocked_requests_today', 'allowed_requests_today'
            ]
            
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Dashboard Stats Fields", False, f"Missing fields: {missing_fields}")
            else:
                self.log_test("Dashboard Stats Fields", True, "All required fields present")
        
        return success

    def test_policy_management(self):
        """Test policy management endpoints"""
        print("\n📋 Testing Policy Management...")
        
        # Test GET policies
        success, policies = self.run_test(
            "Get All Policies",
            "GET",
            "policies",
            200
        )
        
        if not success:
            return False

        # Test CREATE policy
        test_policy = {
            "name": "Test Policy",
            "description": "Test policy for API testing",
            "category": "custom",
            "action": "block",
            "domains": ["test.com", "example.com"],
            "keywords": ["test", "example"],
            "enabled": True,
            "priority": 1
        }
        
        success, created_policy = self.run_test(
            "Create Policy",
            "POST",
            "policies",
            200,
            data=test_policy
        )
        
        if success and 'id' in created_policy:
            policy_id = created_policy['id']
            self.created_resources['policies'].append(policy_id)
            
            # Test GET specific policy
            success, _ = self.run_test(
                "Get Specific Policy",
                "GET",
                f"policies/{policy_id}",
                200
            )
            
            # Test UPDATE policy
            update_data = {"enabled": False, "priority": 2}
            success, _ = self.run_test(
                "Update Policy",
                "PUT",
                f"policies/{policy_id}",
                200,
                data=update_data
            )
            
            # Test DELETE policy
            success, _ = self.run_test(
                "Delete Policy",
                "DELETE",
                f"policies/{policy_id}",
                200
            )
            
            if success:
                self.created_resources['policies'].remove(policy_id)
        
        return True

    def test_network_devices(self):
        """Test network device endpoints"""
        print("\n🌐 Testing Network Device Management...")
        
        # Test GET devices
        success, devices = self.run_test(
            "Get All Devices",
            "GET",
            "network/devices",
            200
        )
        
        if not success:
            return False

        # Test CREATE device
        test_device = {
            "name": "Test Router",
            "device_type": "router",
            "ip_address": "192.168.1.100",
            "location": "Test Lab",
            "description": "Test router for API testing",
            "status": "active",
            "position": {"x": 100, "y": 100},
            "connections": []
        }
        
        success, created_device = self.run_test(
            "Create Device",
            "POST",
            "network/devices",
            200,
            data=test_device
        )
        
        if success and 'id' in created_device:
            device_id = created_device['id']
            self.created_resources['devices'].append(device_id)
            
            # Test UPDATE device
            update_data = {
                "name": "Updated Test Router",
                "device_type": "router",
                "ip_address": "192.168.1.101",
                "location": "Updated Test Lab",
                "description": "Updated test router",
                "status": "inactive",
                "position": {"x": 200, "y": 200},
                "connections": []
            }
            success, _ = self.run_test(
                "Update Device",
                "PUT",
                f"network/devices/{device_id}",
                200,
                data=update_data
            )
            
            # Test DELETE device
            success, _ = self.run_test(
                "Delete Device",
                "DELETE",
                f"network/devices/{device_id}",
                200
            )
            
            if success:
                self.created_resources['devices'].remove(device_id)
        
        return True

    def test_security_alerts(self):
        """Test security alert endpoints"""
        print("\n⚠️ Testing Security Alert Management...")
        
        # Test GET alerts
        success, alerts = self.run_test(
            "Get All Alerts",
            "GET",
            "alerts",
            200
        )
        
        if not success:
            return False

        # Test CREATE alert
        test_alert = {
            "title": "Test Security Alert",
            "description": "Test alert for API testing",
            "severity": "medium",
            "source_ip": "192.168.1.50",
            "destination": "test-site.com",
            "policy_triggered": "Test Policy",
            "device_id": "test-device"
        }
        
        success, created_alert = self.run_test(
            "Create Alert",
            "POST",
            "alerts",
            200,
            data=test_alert
        )
        
        if success and 'id' in created_alert:
            alert_id = created_alert['id']
            self.created_resources['alerts'].append(alert_id)
            
            # Test RESOLVE alert
            success, _ = self.run_test(
                "Resolve Alert",
                "PUT",
                f"alerts/{alert_id}/resolve",
                200
            )
        
        return True

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n🚨 Testing Error Handling...")
        
        # Test non-existent policy
        success, _ = self.run_test(
            "Get Non-existent Policy",
            "GET",
            "policies/non-existent-id",
            404
        )
        
        # Test invalid policy creation
        invalid_policy = {
            "name": "",  # Empty name should fail
            "description": "Invalid policy",
            "category": "invalid_category",  # Invalid category
            "action": "invalid_action"  # Invalid action
        }
        
        success, _ = self.run_test(
            "Create Invalid Policy",
            "POST",
            "policies",
            422  # Validation error
        )
        
        # Test non-existent device
        success, _ = self.run_test(
            "Get Non-existent Device",
            "GET",
            "network/devices/non-existent-id",
            404
        )
        
        # Test non-existent alert resolution
        success, _ = self.run_test(
            "Resolve Non-existent Alert",
            "PUT",
            "alerts/non-existent-id/resolve",
            404
        )
        
        return True

    def cleanup_resources(self):
        """Clean up any created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Clean up policies
        for policy_id in self.created_resources['policies']:
            self.run_test(
                f"Cleanup Policy {policy_id}",
                "DELETE",
                f"policies/{policy_id}",
                200
            )
        
        # Clean up devices
        for device_id in self.created_resources['devices']:
            self.run_test(
                f"Cleanup Device {device_id}",
                "DELETE",
                f"network/devices/{device_id}",
                200
            )
        
        # Note: Alerts don't have delete endpoint, so we skip cleanup

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Campus Web Access Security System API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        try:
            # Initialize demo data first
            if not self.test_demo_initialization():
                print("⚠️ Demo initialization failed, continuing with existing data...")
            
            # Run all test suites
            self.test_dashboard_stats()
            self.test_policy_management()
            self.test_network_devices()
            self.test_security_alerts()
            self.test_error_handling()
            
        except KeyboardInterrupt:
            print("\n⏹️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error during testing: {e}")
        finally:
            # Always try to clean up
            self.cleanup_resources()
        
        # Print final results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Total Tests: {self.tests_run}")
        print(f"🎯 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            print(f"\n⚠️ {self.tests_run - self.tests_passed} test(s) failed. Please check the issues above.")
            return 1

def main():
    """Main test execution"""
    tester = CampusSecurityAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())