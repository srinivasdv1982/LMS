SET NOCOUNT ON;

--truncate table Users
-- Default password hash (Replace with real bcrypt hash in production)
-- 123456
DECLARE @DefaultPasswordHash NVARCHAR(500) = '$2b$10$8IwwAfmKf6dVIzZwYh2cXuQlRo4NclyCkmjvarPrixru5f4zGTnhe';

INSERT INTO Users (LodgeId, EmployeeId, Username, PasswordHash, IsActive)
SELECT 
    E.LodgeId,
    E.EmployeeId,
    CONCAT('user_', E.EmployeeId) AS Username,
    @DefaultPasswordHash,
    1
FROM Employees E
LEFT JOIN Users U ON E.EmployeeId = U.EmployeeId
WHERE U.UserId IS NULL;  -- Avoid duplicates

PRINT 'Users created successfully for all employees';