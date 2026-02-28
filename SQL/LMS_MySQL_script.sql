-- 1. Setup Database
CREATE DATABASE IF NOT EXISTS LMS_DEV;
USE LMS_DEV;

-- 2. Drop Tables (Reverse Order of Dependency)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `EmployeeAttendance`;
DROP TABLE IF EXISTS `HousekeepingTasks`;
DROP TABLE IF EXISTS `InventoryTransactions`;
DROP TABLE IF EXISTS `InventoryItems`;
DROP TABLE IF EXISTS `Vendors`;
DROP TABLE IF EXISTS `News`;
DROP TABLE IF EXISTS `Rooms`;
DROP TABLE IF EXISTS `Floors`;
DROP TABLE IF EXISTS `Ads`;
DROP TABLE IF EXISTS `Employees`;
DROP TABLE IF EXISTS `Roles`;
DROP TABLE IF EXISTS `Lodges`;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Tables (Order of Dependency)

-- Table [Roles]
CREATE TABLE `Roles` (
    `RoleId` INT AUTO_INCREMENT NOT NULL,
    `RoleName` VARCHAR(100) NOT NULL UNIQUE,
    `Description` VARCHAR(500) NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`RoleId`)
) ENGINE=InnoDB;

-- Table [Lodges]
CREATE TABLE `Lodges` (
    `LodgeId` INT AUTO_INCREMENT NOT NULL,
    `LodgeName` VARCHAR(255) NOT NULL,
    `RegistrationNumber` VARCHAR(100) NULL,
    `GSTNumber` VARCHAR(50) NULL,
    `AddressLine1` VARCHAR(255) NULL,
    `AddressLine2` VARCHAR(255) NULL,
    `City` VARCHAR(100) NULL,
    `State` VARCHAR(100) NULL,
    `Country` VARCHAR(100) NULL,
    `Pincode` VARCHAR(20) NULL,
    `Phone` VARCHAR(20) NULL,
    `Email` VARCHAR(255) NULL,
    `Website` VARCHAR(255) NULL,
    `IsActive` TINYINT(1) DEFAULT 1,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`LodgeId`)
) ENGINE=InnoDB;

-- Table [Employees]
CREATE TABLE `Employees` (
    `EmployeeId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `EmployeeCode` VARCHAR(50) NULL,
    `FirstName` VARCHAR(100) NOT NULL,
    `LastName` VARCHAR(100) NULL,
    `Phone` VARCHAR(20) NULL,
    `Email` VARCHAR(255) NULL,
    `RoleId` INT NOT NULL,
    `Salary` DECIMAL(18, 2) DEFAULT 0.00,
    `JoinDate` DATE NULL,
    `IsActive` TINYINT(1) DEFAULT 1,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`EmployeeId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`RoleId`)
) ENGINE=InnoDB;

-- Table [Floors]
CREATE TABLE `Floors` (
    `FloorId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `FloorName` VARCHAR(100) NULL,
    `FloorNumber` VARCHAR(50) NOT NULL,
    `IsActive` TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`FloorId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`)
) ENGINE=InnoDB;

-- Table [Rooms]
CREATE TABLE `Rooms` (
    `RoomId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `FloorId` INT NOT NULL,
    `RoomNumber` VARCHAR(50) NOT NULL,
    `RoomType` VARCHAR(100) NOT NULL,
    `Status` VARCHAR(50) DEFAULT 'Available',
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`RoomId`),
    CONSTRAINT `CK_RoomStatus` CHECK (`Status` IN ('Maintenance', 'Cleaning', 'Occupied', 'Available')),
    FOREIGN KEY (`FloorId`) REFERENCES `Floors` (`FloorId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`)
) ENGINE=InnoDB;

-- Table [HousekeepingTasks]
CREATE TABLE `HousekeepingTasks` (
    `TaskId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `RoomId` INT NOT NULL,
    `AssignedTo` INT NOT NULL,
    `Status` VARCHAR(50) DEFAULT 'Pending',
    `TaskDate` DATE DEFAULT (CURRENT_DATE),
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`TaskId`),
    CONSTRAINT `CK_TaskStatus` CHECK (`Status` IN ('Completed', 'In Progress', 'Pending')),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`RoomId`) REFERENCES `Rooms` (`RoomId`),
    FOREIGN KEY (`AssignedTo`) REFERENCES `Employees` (`EmployeeId`)
) ENGINE=InnoDB;

-- Table [InventoryItems]
CREATE TABLE `InventoryItems` (
    `InventoryItemId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `ItemCode` VARCHAR(100) NOT NULL,
    `ItemName` VARCHAR(255) NOT NULL,
    `Category` VARCHAR(100) NULL,
    `UnitOfMeasure` VARCHAR(50) NULL,
    `ReorderLevel` INT DEFAULT 0,
    `CurrentStock` INT DEFAULT 0,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`InventoryItemId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`)
) ENGINE=InnoDB;

-- Table [Vendors]
CREATE TABLE `Vendors` (
    `VendorId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `VendorName` VARCHAR(255) NOT NULL,
    `ContactPerson` VARCHAR(255) NULL,
    `Phone` VARCHAR(20) NULL,
    `Email` VARCHAR(255) NULL,
    `GSTNumber` VARCHAR(50) NULL,
    PRIMARY KEY (`VendorId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`)
) ENGINE=InnoDB;

-- Table [InventoryTransactions]
CREATE TABLE `InventoryTransactions` (
    `TransactionId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `InventoryItemId` INT NOT NULL,
    `TransactionType` VARCHAR(50) NOT NULL,
    `Quantity` INT NOT NULL,
    `UnitPrice` DECIMAL(18, 2) DEFAULT 0.00,
    `TransactionDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `VendorId` INT NULL,
    `CreatedBy` INT NOT NULL,
    PRIMARY KEY (`TransactionId`),
    CONSTRAINT `CK_TransactionType` CHECK (`TransactionType` IN ('ADJUSTMENT', 'DAMAGE', 'ISSUE', 'PURCHASE')),
    CONSTRAINT `CK_Quantity` CHECK (`Quantity` > 0),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`InventoryItemId`) REFERENCES `InventoryItems` (`InventoryItemId`),
    FOREIGN KEY (`VendorId`) REFERENCES `Vendors` (`VendorId`),
    FOREIGN KEY (`CreatedBy`) REFERENCES `Employees` (`EmployeeId`)
) ENGINE=InnoDB;

-- Table [EmployeeAttendance]
CREATE TABLE `EmployeeAttendance` (
    `AttendanceId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `EmployeeId` INT NOT NULL,
    `AttendanceDate` DATE NOT NULL,
    `Status` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`AttendanceId`),
    CONSTRAINT `CK_AttendanceStatus` CHECK (`Status` IN ('HalfDay', 'Leave', 'Absent', 'Present')),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`EmployeeId`)
) ENGINE=InnoDB;

-- Table [Users]
CREATE TABLE `Users` (
    `UserId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `EmployeeId` INT NOT NULL,
    `Username` VARCHAR(255) NOT NULL UNIQUE,
    `PasswordHash` VARCHAR(1000) NOT NULL,
    `IsActive` TINYINT(1) DEFAULT 1,
    `LastLoginAt` DATETIME NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`UserId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`EmployeeId`)
) ENGINE=InnoDB;

-- Table [Ads]
CREATE TABLE `Ads` (
    `AdId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `Title` VARCHAR(255) NOT NULL,
    `Link` VARCHAR(500) NULL,
    `ImageUrl` VARCHAR(500) NULL,
    `CreatedBy` INT NOT NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`AdId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`CreatedBy`) REFERENCES `Employees` (`EmployeeId`)
) ENGINE=InnoDB;

-- Table [News]
CREATE TABLE `News` (
    `NewsId` INT AUTO_INCREMENT NOT NULL,
    `LodgeId` INT NOT NULL,
    `Title` VARCHAR(255) NOT NULL,
    `Content` TEXT NOT NULL,
    `CreatedBy` INT NOT NULL,
    `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`NewsId`),
    FOREIGN KEY (`LodgeId`) REFERENCES `Lodges` (`LodgeId`),
    FOREIGN KEY (`CreatedBy`) REFERENCES `Employees` (`EmployeeId`)
) ENGINE=InnoDB;

-- 4. Create Performance Indexes
CREATE INDEX `IX_Rooms_LodgeId` ON `Rooms` (`LodgeId`);
CREATE INDEX `IX_Employees_LodgeId` ON `Employees` (`LodgeId`);
CREATE INDEX `IX_Attendance_LodgeId` ON `EmployeeAttendance` (`LodgeId`);