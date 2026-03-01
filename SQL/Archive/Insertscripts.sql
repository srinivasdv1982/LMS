SET NOCOUNT ON;

-------------------------------------------------------------
-- 1️⃣ INSERT 5 LODGES
-------------------------------------------------------------
INSERT INTO Lodges (LodgeName, City, State, Country, Phone)
VALUES
('Royal Grand Lodge','Bangalore','Karnataka','India','0801111111'),
('Sunrise Residency','Mysore','Karnataka','India','0802222222'),
('Hill View Stay','Ooty','Tamil Nadu','India','0803333333'),
('Ocean Pearl Inn','Chennai','Tamil Nadu','India','0804444444'),
('Metro Palace Lodge','Hyderabad','Telangana','India','0805555555');

-------------------------------------------------------------
-- 2️⃣ ROLES (If not already present)
-------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Roles WHERE RoleName='Admin')
INSERT INTO Roles (RoleName) VALUES
('Admin'),('Manager'),('Receptionist'),
('Housekeeping'),('StoreKeeper');

-------------------------------------------------------------
-- 3️⃣ LOOP EACH LODGE
-------------------------------------------------------------
DECLARE @LodgeId INT;

DECLARE LodgeCursor CURSOR FOR
SELECT LodgeId FROM Lodges;

OPEN LodgeCursor;
FETCH NEXT FROM LodgeCursor INTO @LodgeId;

WHILE @@FETCH_STATUS = 0
BEGIN

    ---------------------------------------------------------
    -- FLOORS (4 per lodge)
    ---------------------------------------------------------
    DECLARE @f INT = 1;
    WHILE @f <= 4
    BEGIN
        INSERT INTO Floors (LodgeId, FloorName, FloorNumber)
        VALUES (@LodgeId, CONCAT('Floor ',@f), @f);

        SET @f = @f + 1;
    END

    ---------------------------------------------------------
    -- ROOMS (10 per floor)
    ---------------------------------------------------------
    DECLARE @FloorId INT;

    DECLARE FloorCursor CURSOR FOR
    SELECT FloorId FROM Floors WHERE LodgeId=@LodgeId;

    OPEN FloorCursor;
    FETCH NEXT FROM FloorCursor INTO @FloorId;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @r INT = 1;

        WHILE @r <= 10
        BEGIN
            INSERT INTO Rooms (LodgeId, RoomNumber, FloorId, RoomType, Status)
            VALUES
            (@LodgeId,
             CONCAT(@FloorId,'-',FORMAT(@r,'00')),
             @FloorId,
             CASE WHEN @r <=5 THEN 'Standard' ELSE 'Deluxe' END,
             'Available');

            SET @r = @r + 1;
        END

        FETCH NEXT FROM FloorCursor INTO @FloorId;
    END

    CLOSE FloorCursor;
    DEALLOCATE FloorCursor;

    ---------------------------------------------------------
    -- EMPLOYEES (10 per lodge)
    ---------------------------------------------------------
    INSERT INTO Employees (LodgeId, EmployeeCode, FirstName, RoleId, Salary, JoinDate)
    SELECT
        @LodgeId,
        CONCAT('EMP',@LodgeId,'-',ROW_NUMBER() OVER(ORDER BY (SELECT NULL))),
        CONCAT('Employee_',ROW_NUMBER() OVER(ORDER BY (SELECT NULL))),
        (SELECT TOP 1 RoleId FROM Roles ORDER BY NEWID()),
        15000 + (ABS(CHECKSUM(NEWID())) % 20000),
        GETDATE()
    FROM (VALUES(1),(2),(3),(4),(5),(6),(7),(8),(9),(10)) x(n);

    ---------------------------------------------------------
    -- INVENTORY ITEMS (Essential Lodge Items)
    ---------------------------------------------------------
    INSERT INTO InventoryItems (LodgeId, ItemCode, ItemName, Category, UnitOfMeasure, CurrentStock, ReorderLevel)
    VALUES
    (@LodgeId,'BED001','Bed Sheet','Linen','Nos',200,50),
    (@LodgeId,'PIL001','Pillow Cover','Linen','Nos',200,50),
    (@LodgeId,'TOW001','Bath Towel','Linen','Nos',150,40),
    (@LodgeId,'SOAP01','Soap','Toiletries','Nos',500,100),
    (@LodgeId,'SHMP01','Shampoo Sachet','Toiletries','Nos',500,100),
    (@LodgeId,'CLN001','Floor Cleaner','Cleaning','Liters',50,10),
    (@LodgeId,'DET001','Detergent','Cleaning','Kg',100,20),
    (@LodgeId,'BULB01','LED Bulb','Maintenance','Nos',100,20);

    ---------------------------------------------------------
    -- VENDORS
    ---------------------------------------------------------
    INSERT INTO Vendors (LodgeId, VendorName, Phone)
    VALUES
    (@LodgeId,'ABC Traders','9000000001'),
    (@LodgeId,'CleanCare Supplies','9000000002');

    ---------------------------------------------------------
    -- PURCHASE TRANSACTIONS
    ---------------------------------------------------------
    INSERT INTO InventoryTransactions
    (LodgeId, InventoryItemId, VendorId, TransactionType, Quantity, UnitPrice)
    SELECT
        @LodgeId,
        InventoryItemId,
        (SELECT TOP 1 VendorId FROM Vendors WHERE LodgeId=@LodgeId),
        'PURCHASE',
        50,
        100
    FROM InventoryItems
    WHERE LodgeId=@LodgeId;

    ---------------------------------------------------------
    -- EMPLOYEE ATTENDANCE (Today)
    ---------------------------------------------------------
    INSERT INTO EmployeeAttendance (LodgeId, EmployeeId, AttendanceDate, Status)
    SELECT
        @LodgeId,
        EmployeeId,
        CAST(GETDATE() AS DATE),
        'Present'
    FROM Employees
    WHERE LodgeId=@LodgeId;

    ---------------------------------------------------------
    -- HOUSEKEEPING TASKS (5 Rooms)
    ---------------------------------------------------------
    INSERT INTO HousekeepingTasks (LodgeId, RoomId, AssignedTo, Status)
    SELECT TOP 5
        @LodgeId,
        RoomId,
        (SELECT TOP 1 EmployeeId FROM Employees WHERE LodgeId=@LodgeId ORDER BY NEWID()),
        'Pending'
    FROM Rooms
    WHERE LodgeId=@LodgeId;

    FETCH NEXT FROM LodgeCursor INTO @LodgeId;
END

CLOSE LodgeCursor;
DEALLOCATE LodgeCursor;

PRINT 'ENTERPRISE SAMPLE DATA CREATED SUCCESSFULLY';