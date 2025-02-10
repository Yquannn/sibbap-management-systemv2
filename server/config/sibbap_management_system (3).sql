-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 10, 2025 at 11:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sibbap_management_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcementId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `targetAudience` varchar(255) NOT NULL,
  `status` enum('Active','Inactive','Draft') DEFAULT 'Draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcementId`, `title`, `content`, `targetAudience`, `status`) VALUES
(1, 'dsa', 'dsa', 'dsa', ''),
(2, 'fds', 'fds', 'members', ''),
(3, 'ds', 'dsa', 'dsa', '');

-- --------------------------------------------------------

--
-- Table structure for table `backtoback_details`
--

CREATE TABLE `backtoback_details` (
  `backtoback_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_relationship` varchar(100) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL,
  `coborrower_contact` varchar(50) DEFAULT NULL,
  `coborrower_address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beneficiaries`
--

CREATE TABLE `beneficiaries` (
  `beneficiaryId` int(11) NOT NULL,
  `memberId` int(11) DEFAULT NULL,
  `beneficiaryName` varchar(255) DEFAULT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `beneficiaryContactNumber` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beneficiaries`
--

INSERT INTO `beneficiaries` (`beneficiaryId`, `memberId`, `beneficiaryName`, `relationship`, `beneficiaryContactNumber`) VALUES
(229, 159, 'sda', 'dsa', 'dsa'),
(230, 159, 'dsa', 'dsa', 'dsa'),
(231, 181, 'dsads', 'dsasd', 'dsasd'),
(232, 181, 'dsads', 'dsads', 'dsads'),
(233, 186, 'dsasd', 'dsa', 'sdads'),
(234, 186, 'dsasd', 'dsads', 'dsads');

-- --------------------------------------------------------

--
-- Table structure for table `car_details`
--

CREATE TABLE `car_details` (
  `car_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_relationship` varchar(100) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL,
  `coborrower_contact` varchar(50) DEFAULT NULL,
  `coborrower_address` varchar(255) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `character_references`
--

CREATE TABLE `character_references` (
  `referenceId` int(11) NOT NULL,
  `memberId` int(11) DEFAULT NULL,
  `referenceName` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `referenceContactNumber` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `character_references`
--

INSERT INTO `character_references` (`referenceId`, `memberId`, `referenceName`, `position`, `referenceContactNumber`) VALUES
(116, 159, 'asd', 'dsasd', 'dsa'),
(117, 181, 'dsa', 'dsasd', 'dsadsa'),
(118, 186, 'dsasd', 'dassd', 'dasd');

-- --------------------------------------------------------

--
-- Table structure for table `educational_details`
--

CREATE TABLE `educational_details` (
  `educational_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `relative_relationship` varchar(50) DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `institution` varchar(255) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `year_level` varchar(50) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emergency_details`
--

CREATE TABLE `emergency_details` (
  `emergency_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `emergency_other_purpose` varchar(255) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feeds_rice_details`
--

CREATE TABLE `feeds_rice_details` (
  `feeds_rice_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `sacks` int(11) DEFAULT NULL,
  `max_sacks` int(11) DEFAULT NULL,
  `proof_of_business` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feeds_rice_details`
--

INSERT INTO `feeds_rice_details` (`feeds_rice_details_id`, `loan_application_id`, `statement_of_purpose`, `sacks`, `max_sacks`, `proof_of_business`) VALUES
(1, 2, 'personal', 10, 15, '/uploads/proof_of_business.pdf'),
(2, 3, 'personal', 10, 15, '/uploads/proof_of_business.pdf'),
(3, 5, '', 1, 30, NULL),
(4, 7, 'personal', 10, 15, '/uploads/proof_of_business.pdf'),
(5, 8, 'personal', 10, 15, '/uploads/proof_of_business.pdf'),
(6, 12, 'personal', 10, 15, '/uploads/proof_of_business.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `file_maintenance`
--

CREATE TABLE `file_maintenance` (
  `maintenanceId` int(11) NOT NULL,
  `year` year(4) DEFAULT year(curdate()),
  `month` varchar(50) NOT NULL,
  `memberCode` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `service` varchar(50) NOT NULL,
  `totalPurchaseServiceFee` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `file_maintenance`
--

INSERT INTO `file_maintenance` (`maintenanceId`, `year`, `month`, `memberCode`, `name`, `status`, `service`, `totalPurchaseServiceFee`) VALUES
(1, '2025', 'January', NULL, 'Christopher Kelly', '', 'CONSUMER STORE', 0.00),
(2, '2025', 'January', NULL, 'Scott Clarke', '', 'CONSUMER STORE', 0.00),
(3, '2025', 'January', NULL, 'Brooke Figueroa', '', 'CONSUMER STORE', 0.00),
(4, '2025', 'January', NULL, 'Debra Mclean', '', 'CONSUMER STORE', 0.00),
(5, '2025', 'January', NULL, 'Molly Pearson', '', 'CONSUMER STORE', 0.00),
(6, '2025', 'January', NULL, 'Sara Jackson', '', 'CONSUMER STORE', 0.00),
(7, '2025', 'January', NULL, 'Isabella Smith', '', 'CONSUMER STORE', 0.00),
(8, '2025', 'January', NULL, 'Jeffrey Myers', '', 'CONSUMER STORE', 0.00),
(9, '2025', 'January', NULL, 'Wayne Mooney', '', 'CONSUMER STORE', 0.00),
(10, '2025', 'January', NULL, 'Tiffany Vazquez', '', 'CONSUMER STORE', 0.00),
(11, '2025', 'January', NULL, 'Robert Nguyen DVM', '', 'CONSUMER STORE', 0.00),
(12, '2025', 'January', NULL, 'Matthew Gonzalez', '', 'CONSUMER STORE', 0.00),
(13, '2025', 'January', NULL, 'Louis Ramirez', '', 'CONSUMER STORE', 0.00),
(14, '2025', 'January', NULL, 'Paul Holland', '', 'CONSUMER STORE', 0.00),
(15, '2025', 'January', NULL, 'Peter Cole', '', 'CONSUMER STORE', 0.00),
(16, '2025', 'February', NULL, 'Sara Jackson', '', 'TRUEMONEY', 0.00),
(17, '2025', 'February', NULL, 'Molly Pearson', '', 'TRUEMONEY', 0.00),
(18, '2025', 'February', NULL, 'Peter Cole', '', 'TRUEMONEY', 0.00),
(19, '2025', 'February', NULL, 'Louis Ramirez', '', 'TRUEMONEY', 0.00),
(20, '2025', 'February', NULL, 'Matthew Gonzalez', '', 'TRUEMONEY', 0.00),
(21, '2025', 'February', NULL, 'Robert Nguyen DVM', '', 'TRUEMONEY', 0.00),
(22, '2025', 'February', NULL, 'Debra Mclean', '', 'TRUEMONEY', 0.00),
(23, '2025', 'February', NULL, 'Scott Clarke', '', 'TRUEMONEY', 0.00),
(24, '2025', 'February', NULL, 'Christopher Kelly', '', 'TRUEMONEY', 0.00),
(25, '2025', 'February', NULL, 'Brooke Figueroa', '', 'TRUEMONEY', 0.00),
(26, '2025', 'February', NULL, 'Paul Holland', '', 'TRUEMONEY', 0.00),
(27, '2025', 'February', NULL, 'Isabella Smith', '', 'TRUEMONEY', 0.00),
(28, '2025', 'February', NULL, 'Jeffrey Myers', '', 'TRUEMONEY', 0.00),
(29, '2025', 'February', NULL, 'Tiffany Vazquez', '', 'TRUEMONEY', 0.00),
(30, '2025', 'February', NULL, 'Wayne Mooney', '', 'TRUEMONEY', 0.00),
(31, '2025', 'March', NULL, 'Sara Jackson', '', 'GCASH (IN & OUT)', 0.00),
(32, '2025', 'March', NULL, 'Robert Nguyen DVM', '', 'GCASH (IN & OUT)', 0.00),
(33, '2025', 'March', NULL, 'Paul Holland', '', 'GCASH (IN & OUT)', 0.00),
(34, '2025', 'March', NULL, 'Isabella Smith', '', 'GCASH (IN & OUT)', 0.00),
(35, '2025', 'March', NULL, 'Scott Clarke', '', 'GCASH (IN & OUT)', 0.00),
(36, '2025', 'March', NULL, 'Jeffrey Myers', '', 'GCASH (IN & OUT)', 0.00),
(37, '2025', 'March', NULL, 'Matthew Gonzalez', '', 'GCASH (IN & OUT)', 0.00),
(38, '2025', 'March', NULL, 'Tiffany Vazquez', '', 'GCASH (IN & OUT)', 0.00),
(39, '2025', 'March', NULL, 'Louis Ramirez', '', 'GCASH (IN & OUT)', 0.00),
(40, '2025', 'March', NULL, 'Molly Pearson', '', 'GCASH (IN & OUT)', 0.00),
(41, '2025', 'March', NULL, 'Debra Mclean', '', 'GCASH (IN & OUT)', 0.00),
(42, '2025', 'March', NULL, 'Peter Cole', '', 'GCASH (IN & OUT)', 0.00),
(43, '2025', 'March', NULL, 'Brooke Figueroa', '', 'GCASH (IN & OUT)', 0.00),
(44, '2025', 'March', NULL, 'Christopher Kelly', '', 'GCASH (IN & OUT)', 0.00),
(45, '2025', 'March', NULL, 'Wayne Mooney', '', 'GCASH (IN & OUT)', 0.00),
(46, '2025', 'December', NULL, '1', 'TRUEMONEY', 'Juan Dela Cruz', NULL),
(47, '2025', 'December', NULL, '2', 'TRUEMONEY', 'Cardo Dalisay', NULL),
(48, '2025', 'November', NULL, '1', 'CONSUMER STORE', 'Juan Dela Cruz', NULL),
(49, '2025', 'November', NULL, '2', 'CONSUMER STORE', 'Cardo Dalisay', NULL),
(50, '2025', 'October', NULL, '1', 'TRUEMONEY', 'Juan Dela Cruz', NULL),
(51, '2025', 'October', NULL, '2', 'TRUEMONEY', 'Cardo Dalisay', NULL),
(52, '2025', 'September', NULL, NULL, '1', 'PRINTING SERVICES', NULL),
(53, '2025', 'September', NULL, NULL, '2', 'PRINTING SERVICES', NULL),
(54, '2025', 'january', NULL, NULL, '2', 'test service', NULL),
(55, '2025', 'january', NULL, NULL, '1', 'test service', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `health_details`
--

CREATE TABLE `health_details` (
  `health_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `housing_details`
--

CREATE TABLE `housing_details` (
  `housing_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(50) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_relationship` varchar(100) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL,
  `coborrower_contact` varchar(50) DEFAULT NULL,
  `coborrower_address` varchar(255) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intermentlot_details`
--

CREATE TABLE `intermentlot_details` (
  `intermentlot_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL,
  `interment_interest` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `livelihood_details`
--

CREATE TABLE `livelihood_details` (
  `livelihood_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_applications`
--

CREATE TABLE `loan_applications` (
  `loan_application_id` int(11) NOT NULL,
  `client_voucher_number` varchar(255) NOT NULL,
  `memberId` int(11) NOT NULL,
  `loan_type` varchar(50) NOT NULL,
  `application` varchar(255) NOT NULL,
  `loan_amount` decimal(10,2) DEFAULT NULL,
  `interest` decimal(10,2) NOT NULL,
  `terms` int(11) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(255) NOT NULL DEFAULT 'Waiting for evaluation',
  `remarks` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_applications`
--

INSERT INTO `loan_applications` (`loan_application_id`, `client_voucher_number`, `memberId`, `loan_type`, `application`, `loan_amount`, `interest`, `terms`, `balance`, `created_at`, `status`, `remarks`) VALUES
(2, '', 157, 'feeds', '', 5000.00, 0.00, 1, 0.00, '2025-02-07 18:30:28', 'Waiting for evaluation', 'Waiting for approval'),
(3, '', 184, 'feeds', '', 5000.00, 0.00, 1, 0.00, '2025-02-07 18:43:43', 'Waiting for evaluation', 'Waiting for approval'),
(4, '', 183, 'marketing', '', 75000.00, 0.00, 6, 0.00, '2025-02-07 19:03:36', 'Waiting for evaluation', 'Waiting for approval'),
(5, '', 159, 'feeds', '', 0.00, 0.00, 1, 0.00, '2025-02-07 19:14:56', 'Waiting for evaluation', 'Waiting for approval'),
(6, '', 185, 'marketing', '', 100000.00, 0.00, 10, 0.00, '2025-02-07 19:20:00', 'Waiting for evaluation', 'Waiting for approval'),
(7, 'VOUCHER-1738959150968-3953', 183, 'feeds', 'I need a loan for livestock feed purchase', 5000.00, 1.75, 1, 0.00, '2025-02-07 20:12:30', 'Waiting for evaluation', 'Waiting for approval'),
(8, 'VOUCHER-1738962428235-8862', 183, 'feeds', 'I need a loan for livestock feed purchase', 5000.00, 1.75, 1, 1000.00, '2025-02-07 21:07:08', 'Waiting for evaluation', 'Waiting for approval'),
(12, 'VOUCHER-1739055182385-6632', 183, 'Feeds Loan', 'New', 5000.00, 1.75, 1, 1000.00, '2025-02-08 22:53:02', 'Waiting for evaluation', 'Waiting for approval');

-- --------------------------------------------------------

--
-- Table structure for table `marketing_details`
--

CREATE TABLE `marketing_details` (
  `marketing_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `marketing_details`
--

INSERT INTO `marketing_details` (`marketing_details_id`, `loan_application_id`, `statement_of_purpose`, `comaker_name`, `comaker_member_id`) VALUES
(1, 4, 'Expanding merchandise business', 'John Doe', '789'),
(2, 6, 'pambili ng shabu ', 'dondon bautista', '25001');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `memberId` int(11) NOT NULL,
  `memberCode` varchar(255) NOT NULL,
  `registrationType` varchar(255) DEFAULT NULL,
  `memberType` varchar(255) DEFAULT NULL,
  `registrationDate` date DEFAULT NULL,
  `shareCapital` decimal(10,2) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `MiddleName` varchar(255) DEFAULT NULL,
  `maidenName` varchar(255) DEFAULT NULL,
  `tinNumber` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `birthplaceProvince` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `sex` varchar(50) DEFAULT NULL,
  `civilStatus` varchar(50) DEFAULT NULL,
  `highestEducationalAttainment` varchar(255) DEFAULT NULL,
  `occupationSourceOfIncome` varchar(255) DEFAULT NULL,
  `spouseName` varchar(255) DEFAULT NULL,
  `spouseOccupationSourceOfIncome` varchar(255) DEFAULT NULL,
  `contactNumber` varchar(255) DEFAULT NULL,
  `houseNoStreet` varchar(255) DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `idPicture` varchar(255) DEFAULT NULL,
  `is_timedepositor` tinyint(1) DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`memberId`, `memberCode`, `registrationType`, `memberType`, `registrationDate`, `shareCapital`, `LastName`, `FirstName`, `MiddleName`, `maidenName`, `tinNumber`, `dateOfBirth`, `birthplaceProvince`, `age`, `sex`, `civilStatus`, `highestEducationalAttainment`, `occupationSourceOfIncome`, `spouseName`, `spouseOccupationSourceOfIncome`, `contactNumber`, `houseNoStreet`, `barangay`, `city`, `idPicture`, `is_timedepositor`, `status`) VALUES
(157, '250001', NULL, NULL, '2025-01-22', 9900.00, 'dsasd', 'dsasd', 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'ACTIVE'),
(159, '250003', 'New', 'Individual', '2025-01-22', 122122.00, 'dsasd', 'sda', 'sda', 'sda', 'sdadsa', '2025-01-22', 'dsa', 21, 'Male', 'Single', 'Secondary', 'dsa', 'dsasd', 'dsa', '23123123132', 'dsads', 'sdasd', 'sdads', '1737613329568-Capture.PNG', 1, 'ACTIVE'),
(160, '250004', NULL, 'Individual', '2025-01-22', 9900.00, 'dsa', 'dsa', 'dsasd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'ACTIVE'),
(161, '250005', 'Transfer', 'Individual', '2025-01-21', 29900.00, 'dsasd', 'sda', 'sda', NULL, NULL, NULL, 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '23123123132', 'dsads', NULL, 'sdads', NULL, 1, 'ACTIVE'),
(162, '250006', 'Regular Member', 'Individual', '2025-01-21', 3900.00, 'dsasd', 'sda', 'sda', NULL, NULL, NULL, 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '23123123132', 'dsads', NULL, 'sdads', NULL, 1, 'ACTIVE'),
(163, '250007', NULL, NULL, '2025-01-22', 99900.00, 'dsads', 'dsads', 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'ACTIVE'),
(164, '250008', NULL, NULL, '2025-01-22', 11.00, 'dsasd', 'sda', 'sda', NULL, NULL, NULL, 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '23123123132', 'dsads', NULL, 'sdads', NULL, 1, 'ACTIVE'),
(166, '250010', NULL, NULL, '2025-01-22', 1011.00, 'dsasd', 'sda', 'sda', NULL, NULL, NULL, 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '23123123132', 'dsads', NULL, 'sdads', NULL, 1, 'ACTIVE'),
(167, '250011', NULL, NULL, '2025-01-22', 111011.00, 'dsasd', 'sda', 'sda', NULL, NULL, NULL, 'dsa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '23123123132', 'dsads', NULL, 'sdads', NULL, 1, 'ACTIVE'),
(181, '250025', 'New', 'Individual', '2025-01-24', 99900.00, 'BULAN', 'JOEY', 'DALINA', 'dsasd', 'dsadssda', '2025-01-25', 'BATANGAS', 21, 'Male', 'Married', 'Tertiary', 'dsa', 'dsasd', 'dsads', '093271354123', 'TABANGAO AMBULONG BULIHAN BATANGAS CITY', 'dsads', 'BATANGAS CITY', NULL, 1, 'ACTIVE'),
(182, '250026', 'New', NULL, '2025-01-30', 99900.00, '8test', 'testt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'ACTIVE'),
(183, '250027', NULL, NULL, '2025-02-02', 5900.00, 'bautista', 'dondon', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'ACTIVE'),
(184, '250028', NULL, NULL, '2025-02-02', 60900.00, 'Javier', 'Gerald', 'DALINA', NULL, NULL, NULL, 'BATANGAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'TABANGAO AMBULONG BULIHAN BATANGAS CITY', NULL, 'Select Cities', '1738525843324-47251030_2192358141033323_11421009529798656_n.jpg', 0, 'ACTIVE'),
(185, '250029', 'New', 'Individual', '2025-02-06', 6000.00, 'Lim', 'Mary rose', 'Gawan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1738955867651-formal_attire_photo.jpg', 0, 'Active'),
(186, '250030', 'New', 'Individual', '2025-02-06', 99900.00, 'test', 'JOEY', 'DALINA', 'sdasd', 'dsads', '2025-02-21', 'BATANGAS', 23, 'Male', 'Married', 'Post-Graduate', 'sdads', 'dsasds', 'dsa', '21323123', 'TABANGAO AMBULONG BULIHAN BATANGAS CITY', 'dsasdasd', '\\sdadsasd', '1738962066127-formal_attire_photo.jpg', 0, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `member_account`
--

CREATE TABLE `member_account` (
  `accountId` int(11) NOT NULL,
  `memberId` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `accountStatus` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member_account`
--

INSERT INTO `member_account` (`accountId`, `memberId`, `email`, `password`, `accountStatus`) VALUES
(157, 157, NULL, NULL, 'NOT ACTIVATED'),
(159, 159, '250003', '250003', 'ACTIVATED'),
(160, 160, NULL, NULL, 'NOT ACTIVATED'),
(161, 161, NULL, NULL, 'NOT ACTIVATED'),
(162, 162, NULL, NULL, 'NOT ACTIVATED'),
(163, 163, NULL, NULL, 'NOT ACTIVATED'),
(164, 164, NULL, NULL, 'NOT ACTIVATED'),
(166, 166, NULL, NULL, 'NOT ACTIVATED'),
(167, 167, NULL, NULL, 'NOT ACTIVATED'),
(181, 181, '250025', '250025', 'ACTIVATED'),
(182, 182, NULL, NULL, 'NOT ACTIVATED'),
(183, 183, NULL, NULL, 'NOT ACTIVATED'),
(184, 184, '250028', '250028', 'ACTIVATED'),
(185, 185, NULL, NULL, 'NOT ACTIVATED'),
(186, 186, 'joeybulan84@gmail.com', NULL, 'NOT ACTIVATED');

-- --------------------------------------------------------

--
-- Table structure for table `memoriallot_details`
--

CREATE TABLE `memoriallot_details` (
  `memoriallot_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `motorcycle_details`
--

CREATE TABLE `motorcycle_details` (
  `motorcycle_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_relationship` varchar(100) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL,
  `coborrower_contact` varchar(50) DEFAULT NULL,
  `coborrower_address` varchar(255) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ofw_details`
--

CREATE TABLE `ofw_details` (
  `ofw_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL,
  `coborrower_member_id` varchar(50) DEFAULT NULL,
  `coborrower_name` varchar(255) DEFAULT NULL,
  `coborrower_relationship` varchar(100) DEFAULT NULL,
  `coborrower_contact` varchar(50) DEFAULT NULL,
  `coborrower_address` varchar(255) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quickcash_details`
--

CREATE TABLE `quickcash_details` (
  `quickcash_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reconstruction_details`
--

CREATE TABLE `reconstruction_details` (
  `reconstruction_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `scheduled_payment` varchar(255) DEFAULT NULL,
  `comaker1_name` varchar(255) DEFAULT NULL,
  `comaker1_member_id` varchar(50) DEFAULT NULL,
  `comaker2_name` varchar(255) DEFAULT NULL,
  `comaker2_member_id` varchar(50) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `regular_savings`
--

CREATE TABLE `regular_savings` (
  `savingsId` int(11) NOT NULL,
  `memberId` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `remarks` varchar(255) DEFAULT 'Active',
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `regular_savings`
--

INSERT INTO `regular_savings` (`savingsId`, `memberId`, `amount`, `remarks`, `last_updated`) VALUES
(20, 157, 100.00, 'ACTIVE', '2025-01-23 05:32:49'),
(21, 159, 100.00, 'ACTIVE', '2025-01-23 06:22:09'),
(22, 160, 100.00, 'ACTIVE', '2025-01-23 06:45:52'),
(23, 161, 100.00, 'ACTIVE', '2025-01-23 06:46:25'),
(24, 162, 100.00, 'ACTIVE', '2025-01-23 06:47:09'),
(25, 163, 100.00, 'ACTIVE', '2025-01-23 07:09:25'),
(26, 164, 100.00, 'ACTIVE', '2025-01-23 07:12:06'),
(27, 166, 100.00, 'ACTIVE', '2025-01-23 07:13:30'),
(28, 167, 100.00, 'ACTIVE', '2025-01-23 07:51:46'),
(29, 181, 100.00, 'ACTIVE', '2025-01-25 11:43:02'),
(30, 182, 100.00, 'ACTIVE', '2025-02-01 02:36:55'),
(31, 183, 100.00, 'ACTIVE', '2025-02-02 16:37:13'),
(32, 184, 100.00, 'ACTIVE', '2025-02-02 19:50:43'),
(33, 185, 100.00, 'Active', '2025-02-07 19:17:47'),
(34, 186, 100.00, 'Active', '2025-02-07 21:01:06');

-- --------------------------------------------------------

--
-- Table structure for table `regular_savings_details`
--

CREATE TABLE `regular_savings_details` (
  `regular_savings_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `special_details`
--

CREATE TABLE `special_details` (
  `special_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL,
  `gift_check_amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_deposit`
--

CREATE TABLE `time_deposit` (
  `timeDepositId` int(11) NOT NULL,
  `memberId` int(255) NOT NULL,
  `amount` float NOT NULL,
  `fixedTerm` int(11) NOT NULL,
  `interest` float NOT NULL,
  `payout` float NOT NULL,
  `maturityDate` date NOT NULL,
  `remarks` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `time_deposit`
--

INSERT INTO `time_deposit` (`timeDepositId`, `memberId`, `amount`, `fixedTerm`, `interest`, `payout`, `maturityDate`, `remarks`) VALUES
(15, 157, 10000, 6, 37.5, 10037.5, '2025-07-23', 'ACTIVE'),
(16, 159, 10000, 12, 100, 10100, '2026-01-23', 'ACTIVE'),
(17, 160, 10000, 6, 37.5, 10037.5, '2025-07-23', 'ACTIVE'),
(18, 162, 500000, 12, 15000, 515000, '2026-01-23', 'ACTIVE'),
(19, 161, 10000, 12, 100, 10100, '2026-01-23', 'ACTIVE'),
(20, 163, 1000, 6, 0, 1000, '2025-07-23', 'ACTIVE'),
(21, 164, 1111, 6, 0, 1111, '2025-07-23', 'ACTIVE'),
(22, 166, 1222, 6, 0, 1222, '2025-07-23', 'ACTIVE'),
(24, 167, 11111, 6, 41.67, 11152.7, '2025-07-23', 'ACTIVE'),
(27, 181, 10000, 12, 100, 10100, '2026-01-29', 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `travel_details`
--

CREATE TABLE `travel_details` (
  `travel_details_id` int(11) NOT NULL,
  `loan_application_id` int(11) NOT NULL,
  `statement_of_purpose` varchar(255) DEFAULT NULL,
  `comaker_name` varchar(255) DEFAULT NULL,
  `comaker_member_id` varchar(50) DEFAULT NULL,
  `document` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT 'Other',
  `address` varchar(255) DEFAULT NULL,
  `contactNo` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `userType` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userName`, `age`, `gender`, `address`, `contactNo`, `email`, `password`, `userType`) VALUES
(3, 'dsa', 21, 'Male', 'sda', 'dsa', 'gutierrezpiolo@yahoo.com', 'dsadsasdaasdasd', ''),
(4, 'testtt', 21, 'Male', 'dsadsasd', '93298123', 'test@gmail.com', '12345678', ''),
(5, 'testtt', 21, 'Female', 'dsa', 'das', 'bautistakathlene02@gmail.com', '12345678', 'Loan officer');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcementId`);

--
-- Indexes for table `backtoback_details`
--
ALTER TABLE `backtoback_details`
  ADD PRIMARY KEY (`backtoback_details_id`),
  ADD KEY `fk_backtoback_application` (`loan_application_id`);

--
-- Indexes for table `beneficiaries`
--
ALTER TABLE `beneficiaries`
  ADD PRIMARY KEY (`beneficiaryId`),
  ADD KEY `beneficiaries_ibfk_1` (`memberId`);

--
-- Indexes for table `car_details`
--
ALTER TABLE `car_details`
  ADD PRIMARY KEY (`car_details_id`),
  ADD KEY `fk_car_application` (`loan_application_id`);

--
-- Indexes for table `character_references`
--
ALTER TABLE `character_references`
  ADD PRIMARY KEY (`referenceId`),
  ADD KEY `character_references_ibfk_1` (`memberId`);

--
-- Indexes for table `educational_details`
--
ALTER TABLE `educational_details`
  ADD PRIMARY KEY (`educational_details_id`),
  ADD KEY `fk_educational_application` (`loan_application_id`);

--
-- Indexes for table `emergency_details`
--
ALTER TABLE `emergency_details`
  ADD PRIMARY KEY (`emergency_details_id`),
  ADD KEY `fk_emergency_application` (`loan_application_id`);

--
-- Indexes for table `feeds_rice_details`
--
ALTER TABLE `feeds_rice_details`
  ADD PRIMARY KEY (`feeds_rice_details_id`),
  ADD KEY `fk_feeds_rice_application` (`loan_application_id`);

--
-- Indexes for table `file_maintenance`
--
ALTER TABLE `file_maintenance`
  ADD PRIMARY KEY (`maintenanceId`);

--
-- Indexes for table `health_details`
--
ALTER TABLE `health_details`
  ADD PRIMARY KEY (`health_details_id`),
  ADD KEY `fk_health_application` (`loan_application_id`);

--
-- Indexes for table `housing_details`
--
ALTER TABLE `housing_details`
  ADD PRIMARY KEY (`housing_details_id`),
  ADD KEY `fk_housing_application` (`loan_application_id`);

--
-- Indexes for table `intermentlot_details`
--
ALTER TABLE `intermentlot_details`
  ADD PRIMARY KEY (`intermentlot_details_id`),
  ADD KEY `fk_intermentlot_application` (`loan_application_id`);

--
-- Indexes for table `livelihood_details`
--
ALTER TABLE `livelihood_details`
  ADD PRIMARY KEY (`livelihood_details_id`),
  ADD KEY `fk_livelihood_application` (`loan_application_id`);

--
-- Indexes for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD PRIMARY KEY (`loan_application_id`),
  ADD KEY `fk_member` (`memberId`);

--
-- Indexes for table `marketing_details`
--
ALTER TABLE `marketing_details`
  ADD PRIMARY KEY (`marketing_details_id`),
  ADD KEY `fk_marketing_application` (`loan_application_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`memberId`);

--
-- Indexes for table `member_account`
--
ALTER TABLE `member_account`
  ADD PRIMARY KEY (`accountId`),
  ADD KEY `member_account_ibfk_1` (`memberId`);

--
-- Indexes for table `memoriallot_details`
--
ALTER TABLE `memoriallot_details`
  ADD PRIMARY KEY (`memoriallot_details_id`),
  ADD KEY `fk_memoriallot_application` (`loan_application_id`);

--
-- Indexes for table `motorcycle_details`
--
ALTER TABLE `motorcycle_details`
  ADD PRIMARY KEY (`motorcycle_details_id`),
  ADD KEY `fk_motorcycle_application` (`loan_application_id`);

--
-- Indexes for table `ofw_details`
--
ALTER TABLE `ofw_details`
  ADD PRIMARY KEY (`ofw_details_id`),
  ADD KEY `fk_ofw_application` (`loan_application_id`);

--
-- Indexes for table `quickcash_details`
--
ALTER TABLE `quickcash_details`
  ADD PRIMARY KEY (`quickcash_details_id`),
  ADD KEY `fk_quickcash_application` (`loan_application_id`);

--
-- Indexes for table `reconstruction_details`
--
ALTER TABLE `reconstruction_details`
  ADD PRIMARY KEY (`reconstruction_details_id`),
  ADD KEY `fk_reconstruction_application` (`loan_application_id`);

--
-- Indexes for table `regular_savings`
--
ALTER TABLE `regular_savings`
  ADD PRIMARY KEY (`savingsId`),
  ADD KEY `savings_fk` (`memberId`);

--
-- Indexes for table `regular_savings_details`
--
ALTER TABLE `regular_savings_details`
  ADD PRIMARY KEY (`regular_savings_details_id`),
  ADD KEY `fk_regular_application` (`loan_application_id`);

--
-- Indexes for table `special_details`
--
ALTER TABLE `special_details`
  ADD PRIMARY KEY (`special_details_id`),
  ADD KEY `fk_special_application` (`loan_application_id`);

--
-- Indexes for table `time_deposit`
--
ALTER TABLE `time_deposit`
  ADD PRIMARY KEY (`timeDepositId`),
  ADD KEY `timeDeposit_fk` (`memberId`);

--
-- Indexes for table `travel_details`
--
ALTER TABLE `travel_details`
  ADD PRIMARY KEY (`travel_details_id`),
  ADD KEY `fk_travel_application` (`loan_application_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcementId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `backtoback_details`
--
ALTER TABLE `backtoback_details`
  MODIFY `backtoback_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beneficiaries`
--
ALTER TABLE `beneficiaries`
  MODIFY `beneficiaryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=235;

--
-- AUTO_INCREMENT for table `car_details`
--
ALTER TABLE `car_details`
  MODIFY `car_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `character_references`
--
ALTER TABLE `character_references`
  MODIFY `referenceId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `educational_details`
--
ALTER TABLE `educational_details`
  MODIFY `educational_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emergency_details`
--
ALTER TABLE `emergency_details`
  MODIFY `emergency_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feeds_rice_details`
--
ALTER TABLE `feeds_rice_details`
  MODIFY `feeds_rice_details_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `file_maintenance`
--
ALTER TABLE `file_maintenance`
  MODIFY `maintenanceId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `health_details`
--
ALTER TABLE `health_details`
  MODIFY `health_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `housing_details`
--
ALTER TABLE `housing_details`
  MODIFY `housing_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `intermentlot_details`
--
ALTER TABLE `intermentlot_details`
  MODIFY `intermentlot_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `livelihood_details`
--
ALTER TABLE `livelihood_details`
  MODIFY `livelihood_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_applications`
--
ALTER TABLE `loan_applications`
  MODIFY `loan_application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `marketing_details`
--
ALTER TABLE `marketing_details`
  MODIFY `marketing_details_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `memberId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT for table `member_account`
--
ALTER TABLE `member_account`
  MODIFY `accountId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=187;

--
-- AUTO_INCREMENT for table `memoriallot_details`
--
ALTER TABLE `memoriallot_details`
  MODIFY `memoriallot_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `motorcycle_details`
--
ALTER TABLE `motorcycle_details`
  MODIFY `motorcycle_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ofw_details`
--
ALTER TABLE `ofw_details`
  MODIFY `ofw_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quickcash_details`
--
ALTER TABLE `quickcash_details`
  MODIFY `quickcash_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reconstruction_details`
--
ALTER TABLE `reconstruction_details`
  MODIFY `reconstruction_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `regular_savings`
--
ALTER TABLE `regular_savings`
  MODIFY `savingsId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `regular_savings_details`
--
ALTER TABLE `regular_savings_details`
  MODIFY `regular_savings_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `special_details`
--
ALTER TABLE `special_details`
  MODIFY `special_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_deposit`
--
ALTER TABLE `time_deposit`
  MODIFY `timeDepositId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `travel_details`
--
ALTER TABLE `travel_details`
  MODIFY `travel_details_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `backtoback_details`
--
ALTER TABLE `backtoback_details`
  ADD CONSTRAINT `fk_backtoback_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `beneficiaries`
--
ALTER TABLE `beneficiaries`
  ADD CONSTRAINT `beneficiaries_ibfk_1` FOREIGN KEY (`memberId`) REFERENCES `members` (`memberId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `car_details`
--
ALTER TABLE `car_details`
  ADD CONSTRAINT `fk_car_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `character_references`
--
ALTER TABLE `character_references`
  ADD CONSTRAINT `character_references_ibfk_1` FOREIGN KEY (`memberId`) REFERENCES `members` (`memberId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `educational_details`
--
ALTER TABLE `educational_details`
  ADD CONSTRAINT `fk_educational_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `emergency_details`
--
ALTER TABLE `emergency_details`
  ADD CONSTRAINT `fk_emergency_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `feeds_rice_details`
--
ALTER TABLE `feeds_rice_details`
  ADD CONSTRAINT `fk_feeds_rice_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `health_details`
--
ALTER TABLE `health_details`
  ADD CONSTRAINT `fk_health_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `housing_details`
--
ALTER TABLE `housing_details`
  ADD CONSTRAINT `fk_housing_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `intermentlot_details`
--
ALTER TABLE `intermentlot_details`
  ADD CONSTRAINT `fk_intermentlot_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `livelihood_details`
--
ALTER TABLE `livelihood_details`
  ADD CONSTRAINT `fk_livelihood_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD CONSTRAINT `fk_member` FOREIGN KEY (`memberId`) REFERENCES `members` (`memberId`) ON UPDATE CASCADE;

--
-- Constraints for table `marketing_details`
--
ALTER TABLE `marketing_details`
  ADD CONSTRAINT `fk_marketing_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `member_account`
--
ALTER TABLE `member_account`
  ADD CONSTRAINT `member_account_ibfk_1` FOREIGN KEY (`memberId`) REFERENCES `members` (`memberId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `memoriallot_details`
--
ALTER TABLE `memoriallot_details`
  ADD CONSTRAINT `fk_memoriallot_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `motorcycle_details`
--
ALTER TABLE `motorcycle_details`
  ADD CONSTRAINT `fk_motorcycle_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `ofw_details`
--
ALTER TABLE `ofw_details`
  ADD CONSTRAINT `fk_ofw_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `quickcash_details`
--
ALTER TABLE `quickcash_details`
  ADD CONSTRAINT `fk_quickcash_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `reconstruction_details`
--
ALTER TABLE `reconstruction_details`
  ADD CONSTRAINT `fk_reconstruction_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `regular_savings`
--
ALTER TABLE `regular_savings`
  ADD CONSTRAINT `savings_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`memberId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `regular_savings_details`
--
ALTER TABLE `regular_savings_details`
  ADD CONSTRAINT `fk_regular_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `special_details`
--
ALTER TABLE `special_details`
  ADD CONSTRAINT `fk_special_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;

--
-- Constraints for table `time_deposit`
--
ALTER TABLE `time_deposit`
  ADD CONSTRAINT `timeDeposit_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`memberId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `travel_details`
--
ALTER TABLE `travel_details`
  ADD CONSTRAINT `fk_travel_application` FOREIGN KEY (`loan_application_id`) REFERENCES `loan_applications` (`loan_application_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
