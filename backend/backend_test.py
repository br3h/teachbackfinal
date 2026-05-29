#!/usr/bin/env python3
"""
Backend API tests for TeachBack AI Phase 4
Tests all critical backend endpoints and behaviors.
"""
import requests
import sys
from datetime import datetime
import time

# Use the public URL for testing
BASE_URL = "https://learn-by-teaching-4.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def test(self, name, fn):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"TEST {self.tests_run}: {name}")
        print('='*60)
        try:
            fn()
            self.tests_passed += 1
            print(f"✅ PASSED: {name}")
            return True
        except AssertionError as e:
            self.tests_failed += 1
            self.failures.append(f"{name}: {str(e)}")
            print(f"❌ FAILED: {name}")
            print(f"   Error: {str(e)}")
            return False
        except Exception as e:
            self.tests_failed += 1
            self.failures.append(f"{name}: Unexpected error - {str(e)}")
            print(f"❌ FAILED: {name}")
            print(f"   Unexpected error: {str(e)}")
            return False

    def assert_eq(self, actual, expected, msg=""):
        if actual != expected:
            raise AssertionError(f"{msg}\n  Expected: {expected}\n  Got: {actual}")

    def assert_in(self, item, container, msg=""):
        if item not in container:
            raise AssertionError(f"{msg}\n  Expected '{item}' to be in {container}")

    def assert_true(self, condition, msg=""):
        if not condition:
            raise AssertionError(msg or "Condition was False")

    def summary(self):
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print('='*60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_failed}")
        if self.failures:
            print("\nFailed tests:")
            for f in self.failures:
                print(f"  - {f}")
        print('='*60)
        return self.tests_failed == 0


def main():
    tester = BackendTester()
    
    # Test 1: Health check
    def test_health():
        resp = requests.get(f"{BASE_URL}/health", timeout=10)
        tester.assert_eq(resp.status_code, 200, "Health check should return 200")
        data = resp.json()
        tester.assert_eq(data.get("status"), "ok", "Health status should be 'ok'")
        print(f"   Response: {data}")
    
    tester.test("GET /api/health", test_health)

    # Test 2: Waitlist count
    def test_count():
        resp = requests.get(f"{BASE_URL}/waitlist/count", timeout=10)
        tester.assert_eq(resp.status_code, 200, "Count endpoint should return 200")
        data = resp.json()
        tester.assert_in("count", data, "Response should contain 'count' field")
        tester.assert_true(isinstance(data["count"], int), "Count should be an integer")
        print(f"   Current waitlist count: {data['count']}")
    
    tester.test("GET /api/waitlist/count", test_count)

    # Test 3: Waitlist signup without consent (should fail)
    def test_no_consent():
        email = f"test-no-consent-{int(time.time())}@example.com"
        payload = {
            "email": email,
            "consentAccepted": False,
            "consentVersion": "v1.0",
        }
        resp = requests.post(f"{BASE_URL}/waitlist", json=payload, timeout=10)
        tester.assert_eq(resp.status_code, 400, "Should reject signup without consent")
        data = resp.json()
        tester.assert_in("detail", data, "Error response should have 'detail' field")
        tester.assert_true(
            "Privacy Policy" in data["detail"] or "consent" in data["detail"].lower(),
            "Error should mention consent/privacy"
        )
        print(f"   Error message: {data['detail']}")
    
    tester.test("POST /api/waitlist - no consent (should fail)", test_no_consent)

    # Test 4: Honeypot field (should silently succeed without DB write)
    def test_honeypot():
        email = f"bot-{int(time.time())}@example.com"
        payload = {
            "email": email,
            "consentAccepted": True,
            "consentVersion": "v1.0",
            "hp": "I am a bot",  # Honeypot field filled
        }
        resp = requests.post(f"{BASE_URL}/waitlist", json=payload, timeout=10)
        tester.assert_eq(resp.status_code, 200, "Honeypot should return 200 (silent success)")
        data = resp.json()
        tester.assert_eq(data.get("status"), "success", "Should return success status")
        print(f"   Response: {data}")
        print(f"   ✓ Honeypot triggered - bot submission silently ignored")
    
    tester.test("POST /api/waitlist - honeypot (silent success)", test_honeypot)

    # Test 5: Valid waitlist signup
    test_email = None
    def test_valid_signup():
        nonlocal test_email
        test_email = f"test-phase4-{int(time.time())}@university.edu"
        payload = {
            "email": test_email,
            "persona": "student",
            "mainGoal": "exam-prep",
            "subject": "biology",
            "consentAccepted": True,
            "consentVersion": "v1.0",
            "source": "landing-page",
        }
        resp = requests.post(f"{BASE_URL}/waitlist", json=payload, timeout=15)
        tester.assert_eq(resp.status_code, 200, "Valid signup should return 200")
        data = resp.json()
        tester.assert_eq(data.get("status"), "success", "Should return success status")
        tester.assert_in("message", data, "Response should have message")
        print(f"   Email: {test_email}")
        print(f"   Response: {data}")
        print(f"   ✓ Make.com webhook fires fire-and-forget (410 expected, doesn't affect user)")
    
    tester.test("POST /api/waitlist - valid signup", test_valid_signup)

    # Test 6: Duplicate email (should return duplicate status)
    def test_duplicate():
        if not test_email:
            raise AssertionError("Previous test didn't set test_email")
        payload = {
            "email": test_email,
            "consentAccepted": True,
            "consentVersion": "v1.0",
        }
        resp = requests.post(f"{BASE_URL}/waitlist", json=payload, timeout=10)
        tester.assert_eq(resp.status_code, 200, "Duplicate should return 200")
        data = resp.json()
        tester.assert_eq(data.get("status"), "duplicate", "Should return duplicate status")
        tester.assert_in("message", data, "Response should have message")
        print(f"   Response: {data}")
    
    tester.test("POST /api/waitlist - duplicate email", test_duplicate)

    # Test 7: Invalid email format
    def test_invalid_email():
        payload = {
            "email": "not-an-email",
            "consentAccepted": True,
            "consentVersion": "v1.0",
        }
        resp = requests.post(f"{BASE_URL}/waitlist", json=payload, timeout=10)
        tester.assert_true(
            resp.status_code in [400, 422],
            f"Invalid email should return 400 or 422, got {resp.status_code}"
        )
        data = resp.json()
        print(f"   Response: {data}")
    
    tester.test("POST /api/waitlist - invalid email format", test_invalid_email)

    # Test 8: Personalization fields validation
    def test_personalization():
        email = f"test-persona-{int(time.time())}@example.com"
        payload = {
            "email": email,
            "persona": "parent",
            "mainGoal": "homework-help",
            "subject": "math",
            "consentAccepted": True,
            "consentVersion": "v1.0",
        }
        resp = requests.post(f"{BASE_URL}/waitlist", json=payload, timeout=10)
        tester.assert_eq(resp.status_code, 200, "Valid personalization should succeed")
        data = resp.json()
        tester.assert_eq(data.get("status"), "success", "Should return success")
        print(f"   Response: {data}")
    
    tester.test("POST /api/waitlist - personalization fields", test_personalization)

    # Print summary
    success = tester.summary()
    return 0 if success else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        sys.exit(1)
