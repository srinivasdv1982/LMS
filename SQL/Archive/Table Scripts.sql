/* =============================================================
   MULTI-TENANT LODGE MANAGEMENT SYSTEM
   FINAL ENTERPRISE SCRIPT
   SQL SERVER COMPATIBLE
============================================================= */

SET NOCOUNT ON;

-- ============================================================
-- DROP TABLES (Child → Parent Order)
-- ============================================================

IF OBJECT_ID('HousekeepingTasks') IS NOT NULL DROP TABLE HousekeepingTasks;
IF OBJECT_ID('EmployeeAttendance') IS NOT NULL DROP TABLE EmployeeAttendance;
IF OBJECT_ID('InventoryTransactions') IS NOT NULL DROP TABLE InventoryTransactions;
IF OBJECT_ID('Users') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('Rooms') IS NOT NULL DROP TABLE Rooms;
IF OBJECT_ID('Floors') IS NOT NULL DROP TABLE Floors;
IF OBJECT_ID('Employees') IS NOT NULL DROP TABLE Employees;
IF OBJECT_ID('Roles') IS NOT NULL DROP TABLE Roles;
IF OBJECT_ID('InventoryItems') IS NOT NULL DROP TABLE InventoryItems;
IF OBJECT_ID('Vendors') IS NOT NULL DROP TABLE Vendors;
IF OBJECT_ID('Lodges') IS NOT NULL DROP TABLE Lodges;

-- ============================================================
-- TENANT MASTER (LODGE TABLE)
-- ============================================================

CREATE TABLE Lodges (
    LodgeId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeName NVARCHAR(200) NOT NULL,
    RegistrationNumber NVARCHAR(100),
    GSTNumber NVARCHAR(50),
    AddressLine1 NVARCHAR(200),
    AddressLine2 NVARCHAR(200),
    City NVARCHAR(100),
    State NVARCHAR(100),
    Country NVARCHAR(100),
    Pincode NVARCHAR(20),
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    Website NVARCHAR(150),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- ============================================================
-- ROLES
-- ============================================================

CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(300),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================

CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    EmployeeCode NVARCHAR(50),
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100),
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    RoleId INT NOT NULL,
    Salary DECIMAL(18,2),
    JoinDate DATE,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- ============================================================
-- USER LOGIN TABLE
-- ============================================================

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    EmployeeId INT NOT NULL,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    IsActive BIT DEFAULT 1,
    LastLoginAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId)
);

-- ============================================================
-- FLOORS
-- ============================================================

CREATE TABLE Floors (
    FloorId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    FloorName NVARCHAR(50),
    FloorNumber INT NOT NULL,
    IsActive BIT DEFAULT 1,

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId)
);

-- ============================================================
-- ROOMS
-- ============================================================

CREATE TABLE Rooms (
    RoomId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    RoomNumber NVARCHAR(20) NOT NULL,
    FloorId INT NOT NULL,
    RoomType NVARCHAR(100),
    Status NVARCHAR(50) DEFAULT 'Available',
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
    FOREIGN KEY (FloorId) REFERENCES Floors(FloorId),

    CONSTRAINT CK_RoomStatus
        CHECK (Status IN ('Available','Occupied','Cleaning','Maintenance'))
);

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================

CREATE TABLE InventoryItems (
    InventoryItemId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    ItemCode NVARCHAR(50) NOT NULL,
    ItemName NVARCHAR(150) NOT NULL,
    Category NVARCHAR(100),
    UnitOfMeasure NVARCHAR(50),
    ReorderLevel INT DEFAULT 0,
    CurrentStock INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId)
);

-- ============================================================
-- VENDORS
-- ============================================================

CREATE TABLE Vendors (
    VendorId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    VendorName NVARCHAR(150) NOT NULL,
    ContactPerson NVARCHAR(100),
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    GSTNumber NVARCHAR(50),

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId)
);

-- ============================================================
-- INVENTORY TRANSACTIONS
-- ============================================================

CREATE TABLE InventoryTransactions (
    TransactionId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    InventoryItemId INT NOT NULL,
    VendorId INT NULL,
    TransactionType NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(18,2),
    TransactionDate DATETIME DEFAULT GETDATE(),
    CreatedBy INT,

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
    FOREIGN KEY (InventoryItemId) REFERENCES InventoryItems(InventoryItemId),
    FOREIGN KEY (VendorId) REFERENCES Vendors(VendorId),
    FOREIGN KEY (CreatedBy) REFERENCES Employees(EmployeeId),

    CONSTRAINT CK_TransactionType
        CHECK (TransactionType IN ('PURCHASE','ISSUE','DAMAGE','ADJUSTMENT'))
);

-- ============================================================
-- EMPLOYEE ATTENDANCE
-- ============================================================

CREATE TABLE EmployeeAttendance (
    AttendanceId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    EmployeeId INT NOT NULL,
    AttendanceDate DATE NOT NULL,
    Status NVARCHAR(50) NOT NULL,

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),

    CONSTRAINT CK_AttendanceStatus
        CHECK (Status IN ('Present','Absent','Leave','HalfDay'))
);

-- ============================================================
-- HOUSEKEEPING TASKS
-- ============================================================

CREATE TABLE HousekeepingTasks (
    TaskId INT IDENTITY(1,1) PRIMARY KEY,
    LodgeId INT NOT NULL,
    RoomId INT NOT NULL,
    AssignedTo INT NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (LodgeId) REFERENCES Lodges(LodgeId),
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId),
    FOREIGN KEY (AssignedTo) REFERENCES Employees(EmployeeId),

    CONSTRAINT CK_TaskStatus
        CHECK (Status IN ('Pending','In Progress','Completed'))
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IX_Employees_LodgeId ON Employees(LodgeId);
CREATE INDEX IX_Rooms_LodgeId ON Rooms(LodgeId);
CREATE INDEX IX_InventoryItems_LodgeId ON InventoryItems(LodgeId);
CREATE INDEX IX_InventoryTransactions_LodgeId ON InventoryTransactions(LodgeId);
CREATE INDEX IX_Attendance_LodgeId ON EmployeeAttendance(LodgeId);
CREATE INDEX IX_Housekeeping_LodgeId ON HousekeepingTasks(LodgeId);

PRINT 'MULTI-TENANT LODGE MANAGEMENT DATABASE CREATED SUCCESSFULLY';