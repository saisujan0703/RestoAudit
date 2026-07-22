# Security Audit Report — SBMS

## Critical Issues Found

### 1. **No Authentication/Authorization** ⚠️ CRITICAL
- All endpoints are publicly accessible with no auth checks
- `X-Branch-Id` header is sent by frontend but NOT validated or trusted on backend
- Anyone can call any endpoint directly

### 2. **Data Leakage — Branch Isolation Failure** ⚠️ CRITICAL
- `UserController.getAll()` returns ALL users (branch 101 users can see branch 102 users)
- `UserController.getById(id)` returns any user by ID without checking if requester is in same branch
- `OrderController.getAll()` returns ALL orders regardless of branch
- `OrderController.getByUser(userId)` doesn't verify requester can access that user
- Users in branch 102 can view/modify users and orders from branch 101

### 3. **Credentials Exposed in Plaintext** ⚠️ CRITICAL
- `application.properties` contains: `spring.datasource.password=karur66654`
- This file is in version control and visible to anyone with repo access

### 4. **CORS Too Permissive**
- `@CrossOrigin(origins = "*")` allows requests from any domain

### 5. **No Audit Logging**
- Data access and modifications are not logged
- No way to track who accessed/modified what and when

### 6. **Update/Delete Without Branch Checks**
- `UserController.update()` and `UserController.delete()` don't check branch isolation
- `OrderController.update()` doesn't validate branch ownership

---

## Impact Assessment

| Issue | Severity | Impact |
|-------|----------|--------|
| Unauthenticated access | CRITICAL | Anyone can access all data |
| No branch isolation on reads | CRITICAL | Data visible across branches |
| Plaintext password | CRITICAL | DB compromise risk |
| No audit logging | HIGH | Cannot track unauthorized access |
| CORS misconfiguration | MEDIUM | XSS/CSRF attacks possible |

---

## Required Fixes

### Fix 1: Implement Authentication Filter
Create a security filter that:
- Validates incoming requests have a valid session/token
- Extracts and validates the `X-Branch-Id` header (or gets it from user session)
- Stores authenticated user info in request context for controllers to use

### Fix 2: Add Branch Isolation to All Endpoints
Every controller method that reads/writes data must check:
```
if (user.getBranch().getBranchId() != requestedBranchId) {
    throw FORBIDDEN
}
```

### Fix 3: Redact Credentials
Replace in `application.properties`:
```properties
# OLD (INSECURE):
spring.datasource.password=karur66654

# NEW (SECURE):
spring.datasource.password=${DB_PASSWORD:default_dev_password}
```

Set environment variable before running:
```bash
export DB_PASSWORD=<actual-password>  # Linux/Mac
set DB_PASSWORD=<actual-password>      # Windows cmd
$env:DB_PASSWORD="<actual-password>"   # Windows PowerShell
```

### Fix 4: Restrict CORS
Replace:
```java
@CrossOrigin(origins = "*")
```

With:
```java
@CrossOrigin(origins = {"http://localhost:3000", "https://yourdomain.com"})
```

### Fix 5: Add Request Logging Filter
Log all API calls with: user, branch, action, timestamp, resource accessed, success/failure.

---

## Detailed Vulnerability Examples

**Example 1: User in Branch 102 viewing Branch 101 data**
```
GET /api/users (no auth, no filtering)
Response: [all 100+ users from ALL branches]
```

**Example 2: User spoofing branch ID**
```
GET /api/users
X-Branch-Id: 101
(No backend validation → can access branch 101 data)
```

**Example 3: Password exposed**
```bash
grep password backend/src/main/resources/application.properties
# Output: spring.datasource.password=karur66654 ← VISIBLE IN REPO
```

---

## Immediate Actions Required

1. [ ] Remove plaintext password from git history
2. [ ] Add environment variable config
3. [ ] Implement authentication filter (Spring Security or custom)
4. [ ] Add branch isolation checks to all READ endpoints
5. [ ] Add branch isolation checks to all WRITE endpoints
6. [ ] Restrict CORS to known domains only
7. [ ] Add audit logging

---

## Files That Need Fixing

- `backend/src/main/java/com/restroaudit/backend/controller/UserController.java` (getAll, getById, update, delete)
- `backend/src/main/java/com/restroaudit/backend/controller/OrderController.java` (getAll, getByUser, getByBranch, update)
- `backend/src/main/java/com/restroaudit/backend/controller/MenuItemController.java` (if it exists)
- `backend/src/main/resources/application.properties` (credential redaction)
- Need to CREATE: `SecurityFilter.java` (authentication & authorization)

---

## Next Steps

Ready to implement these fixes. Recommend order:
1. Redact credentials (easiest, highest impact)
2. Implement SecurityFilter (foundational)
3. Update controllers with branch isolation
4. Add audit logging (optional but recommended)
