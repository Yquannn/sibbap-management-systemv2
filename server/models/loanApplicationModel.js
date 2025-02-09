const db = require('../config/db');

function generateVoucherNumber() {
    const timestamp = Date.now();
    const randomNum = Math.floor(1000 + Math.random() * 9000); 
    return `VOUCHER-${timestamp}-${randomNum}`;
}





async function createLoanApplication(data) {
  const { client_voucher_number, memberId, loan_type, application, loan_amount, interest, terms, balance, details } = data;
  let conn;

  const voucherNumber = client_voucher_number || generateVoucherNumber();

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Insert into common loan_applications table
    const [result] = await conn.query(
      `INSERT INTO loan_applications (client_voucher_number, memberId, loan_type, application, loan_amount, interest, terms, balance)
       VALUES (?, ?, ?, ?,?,?,?, ?)`,
      [voucherNumber, memberId, loan_type, application, loan_amount, interest, terms, balance]
    );
    const loanApplicationId = result.insertId;

    // Insert into the appropriate detail table based on loan_type
    switch (loan_type) {
      case 'Feeds Loan':
      case 'Rice Loan':
        await conn.query(
          `INSERT INTO feeds_rice_details 
           (loan_application_id, statement_of_purpose, sacks, max_sacks, proof_of_business)
           VALUES (?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.sacks,
            details.max_sacks,
            details.proof_of_business,
          ]
        );
        break;

      case 'Marketing Loan':
        await conn.query(
          `INSERT INTO marketing_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
          ]
        );
        break;

      case 'BackToBack Loan':
        await conn.query(
          `INSERT INTO backtoback_details 
           (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
          ]
        );
        break;

      case 'Regular Loan':
        await conn.query(
          `INSERT INTO regular_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
          ]
        );
        break;

      case 'Livelihood Loan':
        await conn.query(
          `INSERT INTO livelihood_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
          ]
        );
        break;

      case 'Educational Loan':
        await conn.query(
          `INSERT INTO educational_details 
           (loan_application_id, statement_of_purpose, relative_relationship, student_name, institution, course, year_level, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.relative_relationship,
            details.student_name,
            details.institution,
            details.course,
            details.year_level,
            details.document,
          ]
        );
        break;

      case 'Emergency Loan':
        await conn.query(
          `INSERT INTO emergency_details 
           (loan_application_id, statement_of_purpose, emergency_other_purpose, document)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.emergency_other_purpose,
            details.document,
          ]
        );
        break;

      case 'QuickCash Loan':
        await conn.query(
          `INSERT INTO quickcash_details 
           (loan_application_id, statement_of_purpose)
           VALUES (?, ?)`,
          [loanApplicationId, details.statement_of_purpose]
        );
        break;

      case 'Car Loan':
        await conn.query(
          `INSERT INTO car_details 
           (loan_application_id, statement_of_purpose, vehicle_type, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.vehicle_type,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'Housing Loan':
        await conn.query(
          `INSERT INTO housing_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'Motorcycle Loan':
        await conn.query(
          `INSERT INTO motorcycle_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_relationship, coborrower_name, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_relationship,
            details.coborrower_name,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'MemorialLot Loan':
        await conn.query(
          `INSERT INTO memoriallot_details 
           (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_name)
           VALUES (?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.coborrower_member_id,
            details.coborrower_name,
          ]
        );
        break;

      case 'IntermentLot Loan':
        await conn.query(
          `INSERT INTO intermentlot_details 
           (loan_application_id, statement_of_purpose, coborrower_member_id, coborrower_name, interment_interest)
           VALUES (?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.coborrower_member_id,
            details.coborrower_name,
            details.interment_interest,
          ]
        );
        break;

      case 'Travel Loan':
        await conn.query(
          `INSERT INTO travel_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, document)
           VALUES (?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.document,
          ]
        );
        break;

      case 'Ofw Loan':
        await conn.query(
          `INSERT INTO ofw_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, coborrower_member_id, coborrower_name, coborrower_relationship, coborrower_contact, coborrower_address, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.coborrower_member_id,
            details.coborrower_name,
            details.coborrower_relationship,
            details.coborrower_contact,
            details.coborrower_address,
            details.document,
          ]
        );
        break;

      case 'Savings Loan':
        await conn.query(
          `INSERT INTO savings_details 
           (loan_application_id, statement_of_purpose, document)
           VALUES (?, ?, ?)`,
          [loanApplicationId, details.statement_of_purpose, details.document]
        );
        break;

      case 'Health Loan':
        await conn.query(
          `INSERT INTO health_details 
           (loan_application_id, statement_of_purpose, document)
           VALUES (?, ?, ?)`,
          [loanApplicationId, details.statement_of_purpose, details.document]
        );
        break;

      case 'Special Loan':
        await conn.query(
          `INSERT INTO special_details 
           (loan_application_id, statement_of_purpose, comaker_name, comaker_member_id, document, gift_check_amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.comaker_name,
            details.comaker_member_id,
            details.document,
            details.gift_check_amount,
          ]
        );
        break;

      case 'Reconstruction Loan':
        await conn.query(
          `INSERT INTO reconstruction_details 
           (loan_application_id, statement_of_purpose, scheduled_payment, comaker1_name, comaker1_member_id, comaker2_name, comaker2_member_id, document)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            loanApplicationId,
            details.statement_of_purpose,
            details.scheduled_payment,
            details.comaker1_name,
            details.comaker1_member_id,
            details.comaker2_name,
            details.comaker2_member_id,
            details.document,
          ]
        );
        break;

      default:
        throw new Error('Invalid loan type provided.');
    }

    await conn.commit();
    return { loanApplicationId };
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getLoanApplicationById(id) {
    let conn;
    try {
      conn = await db.getConnection();
  
      // Join with the members table to get member information.
      const [rows] = await conn.query(
        `SELECT la.*, 
                m.FirstName, 
                m.LastName, 
                m.MiddleName, 
                m.memberCode, 
                m.civilStatus, 
                m.sex, 
                m.dateOfBirth, 
                m.age, 
                m.occupationSourceOfIncome, 
                m.contactNumber, 
                m.houseNoStreet, 
                m.barangay, 
                m.city,
                m.idPicture,
                m.birthPlaceProvince,
                m.spouseName,
                m.spouseOccupationSourceOfIncome
         FROM loan_applications la
         LEFT JOIN members m ON la.memberId = m.memberId
         WHERE la.loan_application_id = ?`,
        [id]
      );
      if (rows.length === 0) return null;
      const application = rows[0];
  
      // Determine which details table to query based on the loan_type.
      let detailQuery = null;
      switch (application.loan_type) {
        case 'Feeds Loan':
        case 'Rice Loan':
          detailQuery = `SELECT * FROM feeds_rice_details WHERE loan_application_id = ?`;
          break;
        case 'Marketing Loan':
          detailQuery = `SELECT * FROM marketing_details WHERE loan_application_id = ?`;
          break;
        case 'BackToBack Loan':
          detailQuery = `SELECT * FROM backtoback_details WHERE loan_application_id = ?`;
          break;
        case 'Regular Loan':
          detailQuery = `SELECT * FROM regular_details WHERE loan_application_id = ?`;
          break;
        case 'Livelihood Loan':
          detailQuery = `SELECT * FROM livelihood_details WHERE loan_application_id = ?`;
          break;
        case 'Educational Loan':
          detailQuery = `SELECT * FROM educational_details WHERE loan_application_id = ?`;
          break;
        case 'Emergency Loan':
          detailQuery = `SELECT * FROM emergency_details WHERE loan_application_id = ?`;
          break;
        case 'QuickCash Loan':
          detailQuery = `SELECT * FROM quickcash_details WHERE loan_application_id = ?`;
          break;
        case 'Car Loan':
          detailQuery = `SELECT * FROM car_details WHERE loan_application_id = ?`;
          break;
        case 'Housing Loan':
          detailQuery = `SELECT * FROM housing_details WHERE loan_application_id = ?`;
          break;
        case 'Motorcycle Loan':
          detailQuery = `SELECT * FROM motorcycle_details WHERE loan_application_id = ?`;
          break;
        case 'MemorialLot Loan':
          detailQuery = `SELECT * FROM memoriallot_details WHERE loan_application_id = ?`;
          break;
        case 'IntermentLot Loan':
          detailQuery = `SELECT * FROM intermentlot_details WHERE loan_application_id = ?`;
          break;
        case 'Travel Loan':
          detailQuery = `SELECT * FROM travel_details WHERE loan_application_id = ?`;
          break;
        case 'Ofw Loan':
          detailQuery = `SELECT * FROM ofw_details WHERE loan_application_id = ?`;
          break;
        case 'Savings Loan':
          detailQuery = `SELECT * FROM savings_details WHERE loan_application_id = ?`;
          break;
        case 'Health Loan':
          detailQuery = `SELECT * FROM health_details WHERE loan_application_id = ?`;
          break;
        case 'Special Loan':
          detailQuery = `SELECT * FROM special_details WHERE loan_application_id = ?`;
          break;
        case 'Reconstruction Loan':
          detailQuery = `SELECT * FROM reconstruction_details WHERE loan_application_id = ?`;
          break;
        default:
          detailQuery = null;
      }
      let details = {};
      if (detailQuery) {
        const [detailRows] = await conn.query(detailQuery, [id]);
        if (detailRows.length > 0) {
          details = detailRows[0];
        }
      }
      // Attach the details to the common record.
      application.details = details;
      return application;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }
  
  // Optionally, fetch all applications with their details
  async function getAllLoanApplicant() {
    let conn;
    try {
      conn = await db.getConnection();
      // Only retrieve the loan_application_id to then fetch the complete record.
      const [rows] = await conn.query(
        `SELECT loan_application_id FROM loan_applications`
      );
      
      // Use Promise.all to fetch all detailed applications concurrently.
      const applications = await Promise.all(
        rows.map((row) => getLoanApplicationById(row.loan_application_id))
      );
      return applications;
    } catch (error) {
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

module.exports = {
    createLoanApplication,
    getLoanApplicationById,
    getAllLoanApplicant,
};
