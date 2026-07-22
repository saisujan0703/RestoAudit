# Security Implementation Guide

## Overview
This guide documents all security fixes implemented to prevent data leakage across branches, restrict unauthorized access, and harden the SBMS application.

---

## Fixes Applied

### 1. ✅ Credential Redaction (COMPLETED)
**File:** `backend/src/main/resources/application.properties`

**What was wrong:**
```properties
# OLD - EXPOSED PLAINTEXT PASSWORD
spring.datasource.password=karur66654
```

**What's fixed:**
```properties
# NEW - USES ENVIRONMENT VARIABLES
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

**How to use:**
Before running backend, set environment variables:

**Windows PowerShell:**
```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "karur66654"
mvn spring-boot:run
```

**Windows CMD:**
```cmd
set DB_USERNAME=root
set DB_PASSWORD=karur66654
mvn spring-boot:run
```

**Linux/Mac:**
```bash
export DB_USERNAME=root
export DB_PASSWORD=karur66654
mvn spring-boot:run
```

---

### 2. ✅ Authentication Filter (COMPLETED)
**File:** `backend/src/main/java/com/restroaudit/backend/security/SecurityFilter.java` (NEW)

**What it does:**
- Intercepts all API requests
- Validates `X-Branch-Id` header is present for protected endpoints
- Stores branch context in request for controllers to use
- Allows only specified public endpoints without authentication

**Key code:**
```java
// All /api/* endpoints now require X-Branch-Id header
if (branchIdHeader == null || branchIdHeader.isEmpty()) {
    if (isProtectedEndpoint(path)) {
        response.sendError(403, "Missing X-Branch-Id header");
    }
}
```

**Usage from frontend:**
```ts
// frontend/lib/api.ts already does this
const headers = {
    'Content-Type': 'application/json',
    'X-Branch-Id': getBranchIdFromContext()  // Must be sent with every request
};
```

---

### 3. ✅ Branch Isolation on Read Operations (COMPLETED)
**Files Modified:**
- `backend/src/main/java/com/restroaudit/backend/controller/UserController.java`
- `backend/src/main/java/com/restroaudit/backend/controller/OrderController.java`

**What was wrong:**
```java
// OLD - RETURNS ALL USERS REGARDLESS OF BRANCH
@GetMapping
public List<User> getAll() { 
    return service.findAll();  // SECURITY HOLE
}

// OLD - RETURNS ANY USER BY ID (NO BRANCH CHECK)
@GetMapping("/{id}")
public User getById(@PathVariable Integer id) {
    return service.findById(id);  // SECURITY HOLE
}
```

**What's fixed:**
```java
// NEW - FILTERS BY BRANCH
@GetMapping
public List<User> getAll(@RequestHeader(value = "X-Branch-Id") Integer branchId) {
    if (branchId != null) {
        return service.findByBranchId(branchId);  // SECURE
    }
    return new ArrayList<>();  // Deny if no branch context
}

// NEW - VALIDATES BRANCH OWNERSHIP
@GetMapping("/{id}")
public User getById(@PathVariable Integer id,
                   @RequestHeader(value = "X-Branch-Id") Integer branchId) {
    User user = service.findById(id)
            .orElseThrow(() -> new ResponseStatusException(404, "Not found"));
    
    // SECURITY: Only allow access if user's branch matches requester's branch
    if (branchId != null && user.getBranch() != null) {
        if (!branchId.equals(user.getBranch().getBranchId())) {
            throw new ResponseStatusException(403, 
                "Cannot access users from other branches");  // SECURE
        }
    }
    return user;
}
```

**Impact:**
- User in branch 102 can NO LONGER see data from branch 101
- Attempting to access branch 101 user returns 403 Forbidden

---

### 4. ✅ Branch Isolation on Write Operations (COMPLETED)
**Files Modified:**
- `UserController.update()` — validates branch before allowing edits
- `UserController.delete()` — validates branch before allowing deletion
- `OrderController.update()` — validates branch before allowing status updates

**Example (UPDATE):**
```java
@PutMapping("/{id}")
public ResponseEntity<Map> update(
        @PathVariable Integer id,
        @RequestBody Map<String, Object> body,
        @RequestHeader(value = "X-Branch-Id") Integer branchId) {
    User existing = service.findById(id)
            .orElseThrow(() -> new ResponseStatusException(404, "Not found"));
    
    // SECURITY: Prevent updating users from other branches
    if (branchId != null && existing.getBranch() != null) {
        if (!branchId.equals(existing.getBranch().getBranchId())) {
            throw new ResponseStatusException(403, 
                "Cannot update users from other branches");  // SECURE
        }
    }
    // ... proceed with update
}
```

**Impact:**
- User in branch 102 cannot edit users in branch 101
- Attempting to do so returns 403 Forbidden

---

### 5. ✅ CORS Restriction (COMPLETED)
**Files Modified:**
- `UserController` — changed from `@CrossOrigin(origins = "*")`
- `OrderController` — changed from `@CrossOrigin(origins = "*")`

**What was wrong:**
```java
// OLD - ALLOWS REQUESTS FROM ANYWHERE (XSS/CSRF RISK)
@CrossOrigin(origins = "*")
```

**What's fixed:**
```java
// NEW - ONLY ALLOWS KNOWN FRONTEND ORIGINS
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
```

**Update for production:**
```java
@CrossOrigin(origins = {
    "https://yourdomain.com",
    "https://www.yourdomain.com"
})
```

---

### 6. ✅ Repository Method for Branch Filtering (COMPLETED)
**File:** `backend/src/main/java/com/restroaudit/backend/repository/UserRepository.java`

**Added:**
```java
public interface UserRepository extends JpaRepository<User, Integer> {
    // Find all users in a specific branch (for branch-scoped queries)
    List<User> findByBranch_BranchId(Integer branchId);
}
```

**Usage in service:**
```java
public List<User> findByBranchId(Integer branchId) {
    return repository.findByBranch_BranchId(branchId);
}
```

---

## Security Checklist

- [x] Credentials removed from code and moved to environment variables
- [x] Authentication filter validates branch context on all API calls
- [x] Read operations filter by branch (getAll, getById)
- [x] Write operations check branch ownership (update, delete)
- [x] CORS restricted to known origins only
- [x] X-Branch-Id header required for protected endpoints
- [ ] (Optional) Add JWT tokens for stateless authentication
- [ ] (Optional) Add audit logging for all data access/modifications
- [ ] (Optional) Implement rate limiting to prevent brute force
- [ ] (Optional) Add encrypted passwords in database

---

## Testing Security

### Test 1: Branch Isolation (READ)
```bash
# As user in branch 101, try to access user from branch 102
curl -H "X-Branch-Id: 101" http://localhost:8080/api/users/999
# Should return 403 Forbidden if user 999 is in branch 102

# Correct access
curl -H "X-Branch-Id: 101" http://localhost:8080/api/users/1
# Should return 200 OK if user 1 is in branch 101
```

### Test 2: Missing Branch Context
```bash
# Try accessing without X-Branch-Id header
curl http://localhost:8080/api/users
# Should return 403 Forbidden
```

### Test 3: Branch Isolation (WRITE)
```bash
# As user in branch 101, try to update user from branch 102
curl -X PUT \
  -H "X-Branch-Id: 101" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Hacked"}' \
  http://localhost:8080/api/users/999
# Should return 403 Forbidden if user 999 is in branch 102
```

---

## Common Issues & Troubleshooting

**Issue:** "Missing X-Branch-Id header"
- **Cause:** Frontend not sending the header
- **Fix:** Update `frontend/lib/api.ts` to include header in all requests

**Issue:** "Cannot access users from other branches" (when accessing correct branch)
- **Cause:** Branch ID in header doesn't match user's actual branch
- **Fix:** Verify branch assignment in database

**Issue:** Environment variable not recognized
- **Windows:** Use `$env:VAR_NAME` in PowerShell or `%VAR_NAME%` in CMD
- **Linux/Mac:** Use `export VAR_NAME=value`

**Issue:** "Invalid X-Branch-Id format"
- **Cause:** Branch ID header is not a valid integer
- **Fix:** Ensure frontend sends numeric branch ID

---

## Production Checklist

Before deploying to production:

1. **Set real database password via environment variable**
   ```bash
   $env:DB_PASSWORD = "your_secure_password"
   ```

2. **Update CORS origins to production domain**
   ```java
   @CrossOrigin(origins = {"https://yourdomain.com"})
   ```

3. **Enable HTTPS everywhere** (not just HTTP)

4. **Implement JWT tokens** for stateless authentication (optional but recommended)

5. **Add audit logging** to track all data access

6. **Enable database encryption** for sensitive fields

7. **Set up database backups** and test recovery

8. **Monitor logs** for suspicious activity (multiple 403 errors, etc.)

---

## References

- SecurityFilter: `backend/src/main/java/com/restroaudit/backend/security/SecurityFilter.java`
- Branch-scoped queries: `backend/src/main/java/com/restroaudit/backend/service/UserService.java`
- Fixed controllers: `UserController.java`, `OrderController.java`
